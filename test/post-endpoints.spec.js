const app = require('../src/app');
const helpers = require('./test-helpers');
const knex = require('knex')

describe('Post endpoints', ()=>{
    let db;

    const posts = helpers.makePostsArray();
    const users = helpers.makeUserArray();
    const comment = helpers.makeCommentsArray();
    const postsDB = helpers.makePostResponse();
    const testUser = users[0];  


    function makeAuthHeader(user) {
        const token = Buffer.from(`${user.user_name}:${user.password}`).toString('base64')
        return `Basic ${token}`;
    }


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


    describe('Get all posts and comments', ()=>{
        // seed database
        beforeEach('inserting data to db', () => {
            // insert users
            return helpers.seedUser(db, users)
                .then(() => {
                    console.log('users added')
                    // posts relies on users
                    return helpers.seedPosts(db, posts)
                        .then(()=>{
                            // comments relies on posts and users
                            return helpers.seedComments(db, comment).then(()=>{
                                console.log('comments seeded');
                            });
                        })
                        .catch(err=>{
                            console.log(err, 'error');
                        });
                });
        });
        // make authtoken to access 
        let token = helpers.makeAuthHeader(testUser);
        // console.log(toke);
        // get all posts
        it('gets all posts with user', ()=>{

            return supertest(app)
                .get('/api/posts/')
                .set('Authorization', token)
                .expect(200);
        });

        it('gets all comments', ()=>{

        });
    });

});