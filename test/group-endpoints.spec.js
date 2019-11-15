const app = require('../src/app');
const helpers = require('./test-helpers');
const knex = require('knex')

describe('Group end points end points', () => {
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


    // tests all of the groups
    describe('Test all group endpoints', ()=>{
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

        // get a list of all groups
        it('GET /api/groups/ get all groups', ()=>{
            let token = helpers.makeAuthHeader(testUser);

            // get the comments for post 1
            return supertest(app)
                .get('/api/groups/')
                .set('Authorization', token)
                .expect(200)
                .expect(res => {
                    expect(res.body[0]).to.have.property('id');
                    expect(res.body).to.eql(groupsAdded);
                });
        });

        // get groups by id
        it('GET /api/groups/:id get group by id', ()=>{
            let token = helpers.makeAuthHeader(testUser);

            // get the comments for post 1
            return supertest(app)
                .get('/api/groups/1')
                .set('Authorization', token)
                .expect(200)
                .expect(res => {
                    
                    expect(res.body).to.have.property('id');
                    expect(res.body).to.eql(groupsAdded[0]);
                });
        }); 

        // insert a new group
        it('POST /api/groups/ insert new group', ()=>{
            let token = helpers.makeAuthHeader(testUser);
            const newGroup = {
                group_name: "a fake group",
                about: "fake stuff",
                exp_lvl: "fake"
            }
            const feedback = {
                group_name: 'a fake group',
                about: 'fake stuff',
                exp_lvl: 'fake',
                id: 5 
            }

            // get the comments for post 1
            return supertest(app)
                .post('/api/groups/')
                .set('Authorization', token)
                .send(newGroup)
                .expect(200)
                .expect(res => {
                    
                    expect(res.body).to.have.property('id');
                    expect(res.body).to.eql(feedback);
                });
        });


    }); 

//main suite
});