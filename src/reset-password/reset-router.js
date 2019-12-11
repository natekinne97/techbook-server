const AuthService = require('../auth/auth-service')
const UserService = require('../users/users-service');
const nodemailer = require('nodemailer')
const config = require('../config')
const express = require('express')
const jsonBodyParser = express.json()
const resRouter = express.Router()
const {User} = require('../models/schema');

// sends email for the password reset
resRouter
    .route('/forgot')
    .post(jsonBodyParser, async (req, res, next) => {
        const { email } = req.body;
       
        // check if email was sent to api
        if (!email){
           
            return res.status(400).json({
                error: 'Missing email in request body.',
            })

        }
         
        try{
            // check user with email
            const user = await User.query()
                            .where({
                                email: email
                            }).first();
            
            if(!user || user.length === 0){
               
                return res.status(400).json({
                   error: "User not found."
                })
            }

            const sub = user.user_name
            const payload = { user_id: user.id }
            const token = AuthService.createJwt(sub, payload);

            const update = {
                resetpasswordtoken: token,
                resetpasswordexpires: Date.now() + 36000
            }

             // update the user and insert the data
            const updated = await User.query()
                                .allowUpsert(['resetpasswordtoken', 'resetpasswordexpires'])
                                .update(update);
            
            if(updated === 0){
              
                return res.status(400).json({
                    error: "Error. Could not create token"
                })
            }

            // transporter for email verification
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: `${config.EMAIL}`,
                    pass: `${config.EMAIL_PASSWORD}`
                }
            })


            // the actual email
            const mailOptions = {
                from: 'techbookapp@gmail.com',
                to: `${user.email}`,
                subject: 'Link to password reset.',
                text:
                    'You are recieving this email because you (or someone else) has requested a reset of the password of your account' +
                    'Please click the following link, or paste this in your browser to complete the process within 1 hour of revieving this email.' +
                    `http://localhost:3000/reset/${token} \n\n` +
                    'If you did not make this request, please ignore this message.'
            }

           
            // send the email
            transporter.sendMail(mailOptions, function (err, response) {

                if (err) {
                 
                    return res.status(400).json({
                        error: 'Unable to send',
                        message: 'Please try again later'
                    })
                } else {
                    return res.status(200).json('recovery email sent');
                }
            })


        }catch(err){
            console.log(err);
            next();
        }      

    });

// double checks the params before loading the remainder of the reset
resRouter.route('/reset-check')
    .post(jsonBodyParser, async (req, res, next) => {
        // get user token
        const { resetPasswordToken } = req.body;

        if (!resetPasswordToken) {
            res.status(400).json({
                error: 'Missing token in request field.'
            })
        }

      
        // find user with token
        const user = await User.query()
                            .where({
                                resetpasswordtoken: resetPasswordToken
                            });
                        
        if(!user || user.length === 0){
            return res.status(400).json({
                error: 'password reset link is invalid or has expired'
            });
        }

        // check if password token is expired
        if (Number(user.resetpasswordexpires) > Date.now()) {
            return res.status(200)
                .location(`/${user.id}`)
                .json(user.user_name);
        } else {
            return res.status(400).json({
                error: 'password reset link is invalid or has expired'
            })
        }
          
    })

// update the password
resRouter.route('/reset-password')
    .patch(jsonBodyParser, async (req, res, next) => {
        const { username, password } = req.body;

        if (!username) {
            res.status(400).json({
                error: 'must include username'
            })
        } else if (!password) {
            res.status(400).json({
                error: 'Must include password'
            })
        }

        // get the user with username
        const user = await User.query()
                    .where({
                        user_name: username
                    }).first();

        // check if a user was found
        if(!user || user.lenght === 0){
            return res.status(404).json({
                error: "Username not found"
            })
        }

        // check the new password
        const passwordError = UserService.validatePassword(password);
        if (passwordError)
            return res.status(400).json({ error: passwordError })

        const hashedPassword = await UserService.hashPassword(password);

        // makesure hash password is put into db
        const updated = {
            password: hashedPassword
        }

        // update the password
        const updatedPassword = await User.query()
                                    .where({
                                        user_name: username
                                    })
                                    .allowInsert(['password'])
                                    .update(updated);

        // check if password is updated
        if(updatedPassword === 0)
                return res.status(400)
                        .json({
                            error: "Failed to update password"
                        })

        // if it is all successful return success
        return res.status(201).json('updated successfully');
       
    })


module.exports = resRouter;