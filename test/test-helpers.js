const jwt = require('jsonwebtoken')

// make array for seeding the db
function makeCampsitesArray() {
    return [
        {
            id: 1,
            img: 'https://i.imgur.com/ELRFWHvb.jpg',
            name: 'Bayou place',
            description: 'A beautiful bayou great for fishing',
            park: 'Okefenokee Swamp National Park',
            city: 'Williamsburg',
            state: 'Georgia'
        },
        {
            id: 2,
            img: 'https://i.imgur.com/JGdoWLe.jpg',
            name: 'Mountain Place',
            description: 'Perched atop a mountain meadow this site offers great birdwatching',
            park: 'Black Mountain',
            city: 'Boise',
            state: 'Idaho'
        }
    ]
}


function makeReviewArray() {
    // (text, rating, campsite_id, user_id)
    return [
        {
            id: 1,
            text: 'This place is great. definitly going again',
            rating: 5,
            campsite_id: 1,
            user_id: 1

        },
        {
            id: 2,
            text: 'A great place to camp',
            rating: 5,
            campsite_id: 2,
            user_id: 2
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
            full_name: 'dunder miffilin',
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

function seedCampsites(db, data) {
    return db.insert(data)
        .into('campsites')
        .returning('*')
        .then(rows => {
            return rows[0];
        })
}

function seedReviews(db, data) {
    return db.insert(data)
        .into('reviews')
        .returning('*')
        .then(rows => {
            return rows[0];
        })
}

function seedReviews2(db, users, reviews) {
    return db.transaction(async trx => {
        await seedUsers(trx, users);
        await trx.into('reviews')
            .insert(reviews)
            .returning('*')
            .then(rows => {
                console.log(rows, 'rows being returned')
                return rows[0];
            });

        console.log('seeding reviews');
    })
}

function seedUsers(db, data) {
    return db.insert(data)
        .into('users')
        .returning('*')
        .then(rows => {
            return rows[0];
        })
}

function cleanTables(db) {
    return db.raw(
        'TRUNCATE users  RESTART IDENTITY CASCADE'
    )
}


module.exports = {
    makeCampsitesArray,
    makeReviewArray,
    makeUserArray,
    seedCampsites,
    seedReviews,
    seedReviews2,
    seedUsers,
    cleanTables,
    makeAuthHeader,
    getUserWithTokens,
}