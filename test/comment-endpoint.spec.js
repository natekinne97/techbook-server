const app = require('../src/app');
const helpers = require('./test-helpers');
const knex = require('knex')

describe('Comment end points', ()=>{
    let db;

    const posts = helpers.makePostsArray();
    const users = helpers.makeUserArray();
    const groups = helpers.makeGroupArray();
    const comment = helpers.makeCommentsArray();
    const postsDB = helpers.makePostResponse();
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



    // connect to db
    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db);
        console.log(process.env.TEST_DB_URL);
    })

    describe('Get and insert comments', ()=>{
        // seed database
        beforeEach('inserting data to db', () => {
            // insert users
            return helpers.seedUser(db, users)
                .then(() => {
                    
                    return helpers.seedGroups(db, groups)
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
                        });
                });
        });

        // get all comments for post
        it('/api/comments/:id get all comments for a specific post', ()=>{
            let token = helpers.makeAuthHeader(testUser);

            // get the comments for post 1
            return supertest(app)
                    .get('/api/comments/1')
                    .set('Authorization', token)
                    .expect(200)
                    .expect(res=>{
                       
                        expect(res.body[0]).to.have.property('id');
                        
                    });
        });

        // inserting a new comment
        it('/api/comment/ inserting a new comment return the comment', ()=>{
            let token = helpers.makeAuthHeader(testUser);

            let fakeComment = {
                post_id: 1,
                comment: "a comment about comments commenting comments"
            }

            // get the comments for post 1
            return supertest(app)
                .post('/api/comments/')
                .set('Authorization', token)
                .send(fakeComment)
                .expect(200)
        });

    });

});
