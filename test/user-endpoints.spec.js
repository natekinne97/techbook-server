const knex = require('knex')
const bcrypt = require('bcryptjs')
const app = require('../src/app')
const helpers = require('./test-helpers')

// tests user endpoints such as create account and login
describe('User endpoints', () => {
    let db;

    const users = helpers.makeUserArray();
    const testUser = users[0];

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

    describe('POST /api/users', () => {
        context('User validation', () => {
            // insert all the data to the database
            beforeEach('inserting data to db', () => {
                return helpers.seedUser(db, users)
                    .then(() => {
                        console.log('users added')
                    });
            })

            const requiredFields = ['user_name', 'email', 'password', 'full_name'];

            requiredFields.forEach(field => {
                const registerAttemptBody = {
                    user_name: 'test user_name',
                    password: 'test password',
                    full_name: 'test full_name',
                    email: 'test email',
                }
                // check field missing 
                it(`responds with 400 required error when '${field}' is missing`, () => {
                    delete registerAttemptBody[field]

                    return supertest(app)
                        .post('/api/users/new-user')
                        .send(registerAttemptBody)
                        .expect(400, {
                            error: `Missing '${field}' in request body`,
                        })
                })
            })
            // check password length
            it(`responds 400 'Password be longer than 8 characters' when empty password`, () => {
                const userShortPassword = {
                    user_name: 'test user_name',
                    password: '1234567',
                    full_name: 'test full_name',
                    email: 'test email',
                }
                return supertest(app)
                    .post('/api/users/new-user')
                    .send(userShortPassword)
                    .expect(400, { error: `Password be longer than 8 characters` })
            })
            // check password too long
            it(`responds 400 'Password be less than 72 characters' when long password`, () => {
                const userLongPassword = {
                    user_name: 'test user_name',
                    password: '*'.repeat(73),
                    full_name: 'test full_name',
                    email: 'test email',
                }
                return supertest(app)
                    .post('/api/users/new-user')
                    .send(userLongPassword)
                    .expect(400, { error: `Password be less than 72 characters` })
            })
            // check for spaces start
            it(`responds 400 error when password starts with spaces`, () => {
                const userPasswordStartsSpaces = {
                    user_name: 'test user_name',
                    password: ' 1Aa!2Bb@',
                    full_name: 'test full_name',
                    email: 'test email',
                }
                return supertest(app)
                    .post('/api/users/new-user')
                    .send(userPasswordStartsSpaces)
                    .expect(400, { error: `Password must not start or end with empty spaces` })
            })
            // check for spaces end
            it(`responds 400 error when password ends with spaces`, () => {
                const userPasswordEndsSpaces = {
                    user_name: 'test user_name',
                    password: '1Aa!2Bb@ ',
                    full_name: 'test full_name',
                    email: 'test email',
                }
                return supertest(app)
                    .post('/api/users/new-user')
                    .send(userPasswordEndsSpaces)
                    .expect(400, { error: `Password must not start or end with empty spaces` })
            })

            // password complexity
            it(`responds 400 error when password isn't complex enough`, () => {
                const userPasswordNotComplex = {
                    user_name: 'test user_name',
                    password: '11AAaabb',
                    full_name: 'test full_name',
                    email: 'test email',
                }
                return supertest(app)
                    .post('/api/users/new-user')
                    .send(userPasswordNotComplex)
                    .expect(400, { error: `Password must contain 1 upper case, lower case, number and special character` })
            })
            // check if username is taken
            it(`responds 400 'User name already taken' when user_name isn't unique`, () => {
                const duplicateUser = {
                    user_name: testUser.user_name,
                    password: '11AAaa!!',
                    full_name: 'test full_name',
                    email: 'test email',
                }
                return supertest(app)
                    .post('/api/users/new-user')
                    .send(duplicateUser)
                    .expect(400, { error: `Username already taken` })
            })
        })

        context(`Happy path`, () => {
            it(`responds 201, serialized user, storing bcryped password`, () => {
                const newUser = {
                    user_name: 'test user_name',
                    password: '11AAaa!!',
                    full_name: 'test full_name',
                    email: 'test email',
                }
                return supertest(app)
                    .post('/api/users/new-user')
                    .send(newUser)
                    .expect(201)
                    .expect(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.user_name).to.eql(newUser.user_name)
                        expect(res.body.full_name).to.eql(newUser.full_name)
                        expect(res.body.email).to.eql('')
                        expect(res.body).to.not.have.property('password')
                        expect(res.headers.location).to.eql(`/api/users/${res.body.id}`)
                        const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
                        const actualDate = new Date(res.body.date_created).toLocaleString()
                        expect(actualDate).to.eql(expectedDate)
                    })
                    .expect(res =>
                        db
                            .from('users')
                            .select('*')
                            .where({ id: res.body.id })
                            .first()
                            .then(row => {
                                expect(row.user_name).to.eql(newUser.user_name)
                                expect(row.full_name).to.eql(newUser.full_name)
                                expect(row.email).to.eql(null)
                                const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
                                const actualDate = new Date(row.date_created).toLocaleString()
                                expect(actualDate).to.eql(expectedDate)

                                return bcrypt.compare(newUser.password, row.password)
                            })
                            .then(compareMatch => {
                                expect(compareMatch).to.be.true
                            })
                    )
            })
        })//context

    });//post

})//suite