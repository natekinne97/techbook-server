const knex = require('knex')
const bcrypt = require('bcryptjs')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Post endpoints', ()=>{
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


    describe('Get and insert posts', ()=>{
        // seed database
        beforeEach('inserting data to db', () => {
            // insert users
            return helpers.seedUser(db, users)
                .then(() => {
                   
                    return helpers.seedGroups(db, groups)
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
                        });
                });
        });
        
        // get all posts for user
        it('/api/post/ gets all posts', ()=>{
            let token = helpers.makeAuthHeader(testUser);
            return supertest(app)
                        .get('/api/posts/')
                        .set('Authorization', token)
                        .expect(200);
        });

        // get all posts with group id
        it('/api/post/ gets all posts for group', () => {
            let token = helpers.makeAuthHeader(testUser);
            return supertest(app)
                .get('/api/posts/?id=1')
                .set('Authorization', token)
                .expect(200)
        });
        
        // insert a personal post
        it('/api/post/ personal post returns inserted post', ()=>{
            let token = helpers.makeAuthHeader(testUser);
            // make fake post
            const fakePost = {
                post: "some post thing"
            }

            return supertest(app)
                .post('/api/posts/')
                .set('Authorization', token)
                .send(fakePost)
                .expect(200)
                .expect(res=>{
                   
                    expect(res.body).to.have.property('id');
                    expect(res.body.post).to.eql(fakePost.post);
                    expect(res.body.user).to.eql(testUser.full_name);
                });

        });

        // insert a post with group id
        it('/api/posts/?id=1 returns post with group id', ()=>{
            let token = helpers.makeAuthHeader(testUser);
            // make fake post
            const fakePost = {
                post: "some post thing"
            }

            return supertest(app)
                .post('/api/posts/?id=1')
                .set('Authorization', token)
                .send(fakePost)
                .expect(200)
                .expect(res => {
                  
                    expect(res.body).to.have.property('id');
                    expect(res.body.post).to.eql(fakePost.post);
                    expect(res.body.user).to.eql(testUser.full_name);
                    
                });

        });


    });

});