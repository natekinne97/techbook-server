const app = require('../src/app');
const helpers = require('./test-helpers');
const knex = require('knex')

describe('Friend end points end points', () => {
    let db;

    const posts = helpers.makePostsArray();
    const users = helpers.makeUserArray();
    const groups = helpers.makeGroupArray();
    const comment = helpers.makeCommentsArray();
    const members = helpers.makeGroupMembersArray();
    const friends = helpers.makeFriendsArray();
    const groupsAdded = helpers.makeAllGroupResponse();
    const testUser = users[0];
    const testUser2 = users[2];


    // connect to db
    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db);
        console.log(process.env.TEST_DB_URL);
    })

    // destroy connection
    after('disconnect from db', () => db.destroy());
    // remove data before tests
    before('cleanup', () => helpers.cleanTables(db));
    // remove data after tests
    afterEach('cleanup', () => helpers.cleanTables(db));


    describe('Testing all friends endpoints', ()=>{
        // seed database
        beforeEach('inserting data to db', () => {
            // onion layers
            // users
            // groups
            // groupMembers
            // posts
            // comments
            // insert users
            return helpers.seedUser(db, users)
                .then(() => {
                    return helpers.seedFriends(db, friends)
                        .then(()=>{
                            return helpers.seedGroups(db, groups)
                                .then(() => {
                                    return helpers.seedMembers(db, members)
                                        .then(() => {
                                            // posts relies on users
                                            return helpers.seedPosts(db, posts)
                                                .then(() => {
                                                    // comments relies on posts and users
                                                    return helpers.seedComments(db, comment).then(() => {

                                                    });
                                                })
                                                .catch(err => {
                                                    console.log(err, 'error');
                                                });
                                        })
                                });
                        });
                });
        });

        // friends from current user
        it('GET /api/friends/ get friends id for current user', ()=>{
            let token = helpers.makeAuthHeader(testUser);
            return supertest(app)
                .get('/api/friends/')
                .set('Authorization', token)
                .expect(200)
                .expect(res=>{
                    expect(res.body[0]).to.have.property('id');
                    expect(res.body[0]).to.have.property('friends_id');
                    expect(res.body[0]).to.have.property('user_id');
                });
        }); 

        // friends by user id
        it('GET /api/friends/ get friends id for a user', () => {
            let token = helpers.makeAuthHeader(testUser);
            return supertest(app)
                .get('/api/friends/?id=1')
                .set('Authorization', token)
                .expect(200)
                .expect(res => {
                   
                    expect(res.body[0]).to.have.property('id');
                    expect(res.body[0]).to.have.property('friends_id');
                    expect(res.body[0]).to.have.property('user_id');
                });
        }); 

        // the check if current user is friends with the other user
        it('GET /api/friends/ get friends id for a user', () => {
            let token = helpers.makeAuthHeader(testUser);
            return supertest(app)
                .get('/api/friends/check/2')
                .set('Authorization', token)
                .expect(200)
                .expect(res => {
                    expect(res.body[0]).to.have.property('id');
                    expect(res.body[0]).to.have.property('friends_id');
                    expect(res.body[0]).to.have.property('user_id');
                });
        }); 

        // insert new friend
        it('POST /api/friend/:id make new friends', ()=>{
            let token = helpers.makeAuthHeader(testUser2);
            return supertest(app)
                .post('/api/friends/2')
                .set('Authorization', token)
                .expect(200)
                .expect(res => {
                    expect(res.body).to.have.property('id');
                    expect(res.body).to.have.property('friends_id');
                    expect(res.body).to.have.property('user_id');
                });

        });

        // insert new friend
        it('POST /api/friend/:id drive the friend away friends', () => {
            let token = helpers.makeAuthHeader(testUser);
            return supertest(app)
                .delete('/api/friends/2')
                .set('Authorization', token)
                .expect(200)
                .expect(res => {
                    // expect(res.body).to.have.property('id');
                    // expect(res.body).to.have.property('friends_id');
                    // expect(res.body).to.have.property('user_id');
                });

        });

    });

});