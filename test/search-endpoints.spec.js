const app = require('../src/app');
const helpers = require('./test-helpers');
const knex = require('knex')

describe('Search end points end points', () => {
    let db;

    const posts = helpers.makePostsArray();
    const users = helpers.makeUserArray();
    const groups = helpers.makeGroupArray();
    const comment = helpers.makeCommentsArray();
    const members = helpers.makeGroupMembersArray();
    const groupsAdded = helpers.makeAllGroupResponse();
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



    describe('testing search terms', ()=>{
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

        it('Searches for friends', ()=>{
            let token = helpers.makeAuthHeader(testUser);
            
            const searchTerm = {
                term: "dunder"
            }
            const person = {
                id: testUser.id,
                name: testUser.full_name
            }

            return supertest(app)
                .post('/api/search/')
                .set('Authorization', token)
                .send(searchTerm)
                .expect(200)
                .expect(res=>{
                    
                    expect(res.body.people[0]).to.have.property('id');
                    expect(res.body.people[0]).to.eql(person);
                });
        });

        it('Searches for posts', () => {
            let token = helpers.makeAuthHeader(testUser);

            const searchTerm = {
                term: "some"
            }

            return supertest(app)
                .post('/api/search/')
                .set('Authorization', token)
                .send(searchTerm)
                .expect(200)
                .expect(res => {
                    expect(res.body.posts[0]).to.have.property('id');
                    expect(res.body.posts[0].post).to.eql('some post');
                    expect(res.body.posts[0].user);
                });
        });

        it('Searches for groups', () => {
            let token = helpers.makeAuthHeader(testUser);

            const searchTerm = {
                term: "python"
            }
            const group = {
                id: 1,
                name: 'Python'
            }

            return supertest(app)
                .post('/api/search/')
                .set('Authorization', token)
                .send(searchTerm)
                .expect(200)
                .expect(res => {
                    expect(res.body.groups[0]).to.eql(group);
                });
        });

    });
});