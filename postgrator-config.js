process.env.TZ = 'UTC'
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-jwt-secret'
process.env.JWT_EXPIRY = '3m'

require('dotenv').config()
const { expect } = require('chai')
const supertest = require('supertest')

const postgrator = require('postgrator');


// module.exports = {
//     "migrationDirectory": "migrations",
//     "driver": "pg",
//     "host": process.env.MIGRATION_DB_HOST,
//     "port": process.env.MIGRATION_DB_PORT,
//     "database": process.env.MIGRATION_DB_NAME,
//     // "database": process.env.TEST_DB_URL,
//     "username": process.env.MIGRATION_DB_USER,
//     "password": process.env.MIGRATION_DB_PASS,
//     "connectionString": (process.env.NODE_ENV === 'test')
//         ? process.env.TEST_DATABASE_URL
//         : process.env.DATABASE_URL,
//     "ssl": !!process.env.SSL,
// }

// check the user credendtials before running
module.exports = {
    migrationDirectory: 'migrations',
    driver: 'pg',
    host: process.env.PROD_MIGRATION_DB_HOST,
    port: process.env.PROD_MIGRATION_DB_PORT,
    database: process.env.PROD_MIGRATION_DB_NAME,
    username: process.env.PROD_MIGRATION_DB_USER,
    password: process.env.PROD_MIGRATION_DB_PASS,
    ssl: true
};

// module.exports = {
//     "migrationDirectory": "migrations",
//     "driver": "pg",
//     "connectionString": (process.env.NODE_ENV === 'test')
//         ? process.env.TEST_DATABASE_URL
//         : process.env.DATABASE_URL,
//         "ssl": !!process.env.SSL,
//   }