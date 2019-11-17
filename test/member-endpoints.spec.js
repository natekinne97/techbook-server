const app = require('../src/app');
const helpers = require('./test-helpers');
const knex = require('knex')

describe('Member end points', () => {
    let db;

    const posts = helpers.makePostsArray();
    const users = helpers.makeUserArray();
    const groups = helpers.makeGroupArray();
    const comment = helpers.makeCommentsArray();
    const members = helpers.makeGroupMembersArray();
    const testUser = users[0];

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


    describe('Checking the adding and removing of members from a group', ()=>{
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
                   
                    return helpers.seedGroups(db, groups)
                        .then(() => {
                            return helpers.seedMembers(db, members)
                                .then(()=>{
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

        it('/api/members/gets list of all members of every group', ()=>{
            let token = helpers.makeAuthHeader(testUser);

            return supertest(app)
                    .get('/api/member/')
                    .set('Authorization', token)
                    .expect(200);
                    
        });

        // get all groups for current user
        it('/api/member/users-groups returns all groups associated with user', ()=>{
            let token = helpers.makeAuthHeader(testUser);

            return supertest(app)
                .get('/api/member/users-groups')
                .set('Authorization', token)
                .expect(200);

        });

        // check if user is in groups
        it('/api/member/:id check if user is in group', ()=>{
            let token = helpers.makeAuthHeader(testUser);

            return supertest(app)
                .get('/api/member/1')
                .set('Authorization', token)
                .expect(200)
                .expect(res=>{
                   
                    expect(res.body.user).to.eql('The user is in this group');
                });
        });

        // add user to the group
        it('POST /api/member/:id add member to the group', ()=>{
            let token = helpers.makeAuthHeader(testUser);
            // add user to group 3
            return supertest(app)
                .post('/api/member/3')
                .set('Authorization', token)
                .expect(200)
                .expect(res => {
                 
                    expect(res.body.message).to.eql('Welcome to the group');
                });
        });

        // leave the group
        it('DELETE /api/member/:id Remove member from the group', ()=>{
            let token = helpers.makeAuthHeader(testUser);
            // add user to group 3
            return supertest(app)
                .delete('/api/member/1')
                .set('Authorization', token)
                .expect(200)
                .expect(res => {
                   
                    expect(res.body.message).to.eql('User has left the group');
                });
        }); 

    });

});