const knex = require('knex')
const app = require('./app')
const { PORT, DB_URL } = require('./config')

const db = knex({
    client: 'pg',
    connection: DB_URL,
})

app.set('db', db)

console.log('Connecting to db: ', DB_URL);

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`)
})
