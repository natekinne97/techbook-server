require('dotenv').config()
const express = require('express')
// loggers and error checkers
const morgan = require('morgan')
const helmet = require('helmet')
// cors
const cors = require('cors')
// config file
const { NODE_ENV } = require('./config')
const app = express()
// endpoints
const authRouter = require('./auth/auth-router');
const resRouter = require('./reset-password/reset-router');

const postRouter = require('./posts/posts');

// logger
app.use(morgan((NODE_ENV === 'production') ? 'tiny' : 'common', {
    skip: () => NODE_ENV === 'test',
}))

// logger and cors
app.use(cors())
app.use(helmet())

//endpoints
app.use('/api/posts', postRouter); 

// authentication endpoints
app.use('/api/auth', authRouter);
app.use('/api/reset', resRouter);


// catch all error handler
app.use(function errorHandler(error, req, res, next) {
    let response
    if (NODE_ENV === 'production') {
        response = { error: 'Server error' }
    } else {
        console.error(error)
        response = { error: error.message, object: error }
    }
    res.status(500).json(response)
})

module.exports = app
