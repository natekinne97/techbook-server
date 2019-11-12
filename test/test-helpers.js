const jwt = require('jsonwebtoken')
const moment = require('moment');

// make posts array
function makePostsArray() {
    // (post, user_id)
    return [
        {
            id: 1,
            post: "some post",
            user_id: 2,
        },
        {
            id: 2,
            post: "some post",
            user_id: 1,
        },
        
    ]
}

// make comments
function makeCommentsArray(){
    return[
        {
            id: 1,
            comment: "some comment",
            user_id: 1,
            post_id: 1
        },
        {
            id: 2,
            comment: "some comment",
            user_id: 1,
            post_id: 1
        },

    ];
}

// we cannot insert the same data we retrieve
function makePostResponse(){
    // id, post, user, user_id, date_created
    return [
        {
            id: 1,
            post: "some post",
            user: "dunder mifflin",
            date_created: moment().format(),
            user_id: 2,
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
    console.log(data);
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

function cleanTables(db) {
    return db.raw(
        'TRUNCATE users, posts  RESTART IDENTITY CASCADE'
    )
}


module.exports = {
    // make data
    makePostsArray,
    makeUserArray,
    makeCommentsArray,
    // response data
    makePostResponse,
    // insert data
    seedPosts,
    seedUser,
    seedComments,
    // clean tables
    cleanTables,
    // authentication
    makeAuthHeader,
    getUserWithTokens,
}