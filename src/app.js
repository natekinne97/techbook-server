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
// authentication and password changing
const authRouter = require('./auth/auth-router');
const resRouter = require('./reset-password/reset-router');
// users
const usersRouter = require('./users/users-router');
// posts
const commentRouter = require('./comments/comments-router');
const postRouter = require('./posts/posts');
// searching
const searchRouter = require('./search/search');
// groups
const groupRouter = require('./groups/groupsRouter');
const memberRouter = require('./group-members/memberRouter');
const friendsRouter = require('./friends/friendsRouter');

// logger
app.use(morgan((NODE_ENV === 'production') ? 'tiny' : 'common', {
    skip: () => NODE_ENV === 'test',
}))

// logger and cors
app.use(cors())
app.use(helmet())

// authentication endpoints
app.use('/api/auth', authRouter);
app.use('/api/reset', resRouter);
app.use('/api/users', usersRouter);

// post related
app.use('/api/comments', commentRouter);
app.use('/api/posts', postRouter); 

// search
app.use('/api/search', searchRouter);

// user groupings
app.use('/api/groups', groupRouter);
app.use('/api/member', memberRouter);
app.use('/api/friends', friendsRouter)

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
