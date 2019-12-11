const express = require('express')
const AuthService = require('./auth-service')
const jsonBodyParser = express.json()
const { requireAuth } = require('../middleware/jwt-auth');
const authRouter = express.Router()

authRouter
    .post('/login', jsonBodyParser, (req, res, next) => {
        // get info
        const { user_name, password } = req.body
        //  user 
        const loginUser = { user_name, password }

        // check if missing request
        for (const [key, value] of Object.entries(loginUser))
            if (value == null)
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                })
        //  check user name
        AuthService.getUserWithUserName(
            req.app.get('db'),
            loginUser.user_name
        )
            .then(dbUser => {
                if (!dbUser)
                    return res.status(400).json({
                        error: 'Incorrect user name or password',
                    })
                // check password against db

                return AuthService.comparePasswords(loginUser.password, dbUser.password)
                    .then(compareMatch => {
                        if (!compareMatch)
                            return res.status(400).json({
                                error: 'Incorrect user_name or password',
                            })

                        const sub = dbUser.user_name
                        // insert the user id into the token
                        const payload = { user_id: dbUser.id }
                        // send the token
                        res.status(200).send({
                            authToken: AuthService.createJwt(sub, payload),
                            user: sub
                        })
                    })
            })
            .catch(next)
    })

// refreshes the the user token
authRouter.post('/refresh', requireAuth, (req, res) => {
   
    const sub = req.user.user_name
    const payload = { user_id: req.user.id }
    res.send({
        authToken: AuthService.createJwt(sub, payload),
    })
})

module.exports = authRouter