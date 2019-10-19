const knex = require('knex')
// const jwt = require('jsonwebtoken')
const app = require('../src/app')
const helpers = require('./test-helpers');

describe('Email password reset test', () => {
    let db;
    const users = helpers.makeUserArray();

    // connect to db
    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })
    // destroy connection
    after('disconnect from db', () => db.destroy())
    // remove data before tests
    before('cleanup', () => helpers.cleanTables(db))
    // remove data after tests
    afterEach('cleanup', () => helpers.cleanTables(db))

    beforeEach('insert campsites', () => {
        return helpers.seedUsers(db, users)
            .then(() => {
                console.log('users seeded');
            })
    })

    // first start at the reset request. we want to test
    // if we get an error when no email is sent.
    it('If no email respond error 401', () => {
        let email = '';
        return supertest(app)
            .post('/api/reset/forgot')
            .send(email)
            .expect(400, {
                error: `Missing email in request body.`,
            })
    });

    // send false email and check if we recieve false user
    it('User not found return 400', () => {
        let email = {
            email: 'wrongperson@gmail.com',
        }
        return supertest(app)
            .post('/api/reset/forgot')
            .send(email)
            .expect(400, {
                error: `User not found.`,
            })
    });

    // reset password page errors
    describe('post /reset-check if token exists', () => {
        it('No token send 400', () => {
            let token = '';
            return supertest(app)
                .post('/api/reset/reset-check')
                .send(token)
                .expect(400, {
                    error: `Missing token in request field.`,
                })
        });

        it('User not found with token', () => {
            let token = {
                resetPasswordToken: '849398ds7f89da8f9dsaf78ds9a07f8'
            }
            return supertest(app)
                .post('/api/reset/reset-check')
                .send(token)
                .expect(400, {
                    error: `password reset link is invalid or has expired`,
                })
        });

    })

    describe('Patch reseting the password', () => {

    });

});