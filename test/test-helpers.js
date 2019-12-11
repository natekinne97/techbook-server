const jwt = require('jsonwebtoken')
const moment = require('moment');

// make posts array
function makePostsArray() {
    // (post, user_id)
    return [
        // personal posts
        {
            // id: 1,
            post: "some post",
            user_id: 2,
        },
        {
            // id: 2,
            post: "some post",
            user_id: 1,
        },
        // group posts
        {
            // id: 3,
            post: "some post",
            user_id: 1,
            group_id: 1
        },
        {
            // id: 4,
            post: "some post",
            user_id: 1,
            group_id: 2,
        },

    ]
}

// make comments
function makeCommentsArray(){
    return[
        {
            
            comment: "some comment",
            user_id: 1,
            post_id: 1
        },
        {
            comment: "some comment",
            user_id: 1,
            post_id: 2
        },

    ];
}

// make all the groups
function makeGroupArray(){
    return [
        {
            // id: 1,
            group_name: "Python",
            about: "some thing",
            exp_lvl: "some other stuff"
        },
        {
            // id: 2,
            group_name: "Java",
            about: "Java thing",
            exp_lvl: "some other stuff"
        },
        {
            // id: 3,
            group_name: "JavaScript",
            about: "JavaScript thing",
            exp_lvl: "some other stuff"
        },
        {
            // id: 4,
            group_name: "Node.js",
            about: "Node thing",
            exp_lvl: "some other stuff"
        },
    ]
}

function makeFriendsArray(){
    return [
        {
            user_id: 1,
            friends_id: 2
        },
        {
            user_id: 2,
            friends_id: 1
        }
    ]
}

// make group members array
function makeGroupMembersArray(){
    return [
        {
            group_id: 1,
            user_id: 1
        },
        {
            group_id: 2,
            user_id: 1
        },
        {
            group_id: 1,
            user_id: 2
        },
        {
            group_id: 2,
            user_id: 2
        },
    ]
}


// we cannot insert the same data we retrieve
function makePostResponse(){
    // id, post, user, user_id, date_created
    let date = new Date();
    return [
        {
            id: 1,
            post: "Welcome to TeckBook! :)",
            user: "TeckBook",
            date_created: date.toISOString(),
            votes: 99,
            user_id: 0,
        },
        {
            id: 2,
            post: "some post",
            user: "human person",
            date_created: new Date().toISOString(),
            user_id: 1,
        },
    ];
}

function makeAllGroupResponse(){
    return [
        {
            id: 1,
            name: 'Python',
            about: 'some thing',
            level: 'some other stuff'
        },
        {
            id: 2,
            name: 'Java',
            about: 'Java thing',
            level: 'some other stuff'
        },
        {
            id: 3,
            name: 'JavaScript',
            about: 'JavaScript thing',
            level: 'some other stuff'
        },
        {
            id: 4,
            name: 'Node.js',
            about: 'Node thing',
            level: 'some other stuff'
        } 
    ]
}

// finds the user with the token given
function getUserWithTokens(db, resetpasswordtoken) {
    return db('users')
        .where({
            resetpasswordtoken: resetpasswordtoken,
        })
        .first()
}

// user array is being used to retrieve the author for comments
function makeUserArray() {
    return [
        {
            id: 1,
            user_name: 'dunder',
            full_name: 'dunder mifflin',
            email: 'blah@gmail.com',
            password: '$2a$12$3MsnYDHU0g.FBXkHU5qNiOVM/KT.2LXho7D6TZwbOKLFJBmSbHFbG'
        },
        {
            id: 2,
            user_name: 'person',
            full_name: 'human person',
            email: 'person@gmail.com',
            password: '$2a$12$nt8./ljTB2nPzcncvT51OOTl2AvWkDwQx0Fc70d8dB.VwKx.lKJRe'
        },
        {
            id: 3,
            user_name: 'blurp',
            full_name: 'bard lurpen',
            email: 'blurp@gmail.com',
            password: '$2a$12$nt8./ljTB2nPzcncvT51OOTl2AvWkDwQx0Fc70d8dB.VwKx.lKJRe'
        },
    ];//end of return
}
// make auth token for test
function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
    const token = jwt.sign({ user_id: user.id }, secret, {
        subject: user.user_name,
        algorithm: 'HS256',
    })
    return `Bearer ${token}`
}


function seedUser(db, data) {
    return db.insert(data)
        .into('users')
        .returning('*')
        .then(rows => {
            return rows[0];
        })
}

// insert the posts into db
function seedPosts(db, data){
 
    return db.insert(data)
            .into('posts')
            .returning('*')
            .then(rows => {
                return rows[0];
            })
}

// insert comments
function seedComments(db, data){
    return db.insert(data)
            .into('comments')
            .returning('*')
            .then(rows => {
                return rows[0];
            })
}
// insert groups
function seedGroups(db, data){
    return db.insert(data)
            .into('groups')
            .returning('*')
            .then(rows=>{
                return rows[0];
            });
}

// insert all the member data
function seedMembers(db, data){
    return db.insert(data)
            .into('group_members')  
            .returning('*')
            .then(rows=>{
                return rows[0];
            });
}

function seedFriends(db, data){
    return db.insert(data)
        .into('friends')
        .returning('*')
        .then(rows => {
            return rows[0];
        });
}

function cleanTables(db) {
    return db.raw(
        'TRUNCATE users, posts, groups, voted, group_members  RESTART IDENTITY CASCADE'
    )
}


module.exports = {
    // make data
    makePostsArray,
    makeUserArray,
    makeCommentsArray,
    makeGroupArray,
    makeGroupMembersArray,
    makeAllGroupResponse,
    makeFriendsArray,
    // response data
    makePostResponse,
    // insert data
    seedPosts,
    seedUser,
    seedComments,
    seedGroups,
    seedMembers,
    seedFriends,
    // clean tables
    cleanTables,
    // authentication
    makeAuthHeader,
    getUserWithTokens,
}