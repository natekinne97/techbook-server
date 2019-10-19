require('dotenv').config()

const pg = require('pg')
pg.defaults.ssl = true

// connection tells us connection style
let connection;
// check if we are running tests
if(process.env.NODE_ENV === 'test'){
    console.log('using test databas');
    // switch to test database
    connection = process.env.TEST_DB_URL;
}else{
    console.log('using regular db');
    // regular database
    connection = process.env.DATABASE_URL;
}

module.exports = {
    client: 'pg',
    connection: connection
}