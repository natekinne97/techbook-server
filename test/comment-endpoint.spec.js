const app = require('../src/app');
const helpers = require('./test-helpers');
const knex = require('knex')

describe.only('Comment end points', ()=>{
    
    let db;

    function makeAuthHeader(user) {
        const token = Buffer.from(`${user.user_name}:${user.password}`).toString('base64')
        return `Basic ${token}`;
    }

    // get test data
    const posts = helpers.makePostsArray();
    const users = helpers.makeUserArray();
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

    // seed database
    beforeEach('inserting data to db', () => {
        // insert users
        return helpers.seedUsers(db, users)
            .then(() => {
                console.log('users added')
                // posts relies on users
                return helpers.seedPosts(db, posts)
                    .then(() => {
                        // comments relies on posts and users
                        return helpers.seedComments(db, comment).then(() => {
                            console.log('comments seeded');
                        });
                    })
                    .catch(err => {
                        console.log(err, 'error');
                    });
            });
    });

});