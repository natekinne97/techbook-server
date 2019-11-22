const express = require('express')
const UserService = require('./users-service')
const AuthService = require('../auth/auth-service');
const usersRouter = express.Router()
const jsonBodyParser = express.json()
const {User} = require('../models/schema');
const { requireAuth } = require('../middleware/jwt-auth');


// serialize user for profile info
serializeUser = user =>{
  return {
      id: user.id,
      full_name: user.full_name,
      user_name: user.user_name,
      bio: user.bio,
      occupation: user.occupation
  };
}


// login
usersRouter
    .post('/new-user', jsonBodyParser, (req, res, next) => {
        const { password, user_name, email, full_name } = req.body

        // make sure all fields are filled
        for (const field of ['full_name', 'email', 'user_name', 'password'])
            if (!req.body[field])
                return res.status(400).json({
                    error: `Missing '${field}' in request body`
                })

        // check that nothing starts with or is just spaces
        // validate the post
        // check if there are characters 
        for (const key of ['full_name', 'email', 'user_name', 'password']) {
            if (/^ *$/.test(newPost[key])) {
                console.log('just space found')
                // It has only spaces, or is empty
                return res.status(400).json({
                    error: "Input is only spaces. Must include characters!"
                })
            }
        }

        const passwordError = UserService.validatePassword(password)

        if (passwordError)
            return res.status(400).json({ error: passwordError })

        // first check if email is used to ensure no errors
        UserService.getUsernameWithEmail(
            req.app.get('db'),
            email
        )
            .then(user => {
                if (user) {
                    return res.status(400).json({
                        error: "Account already exists"
                    })
                }

            }).catch(error => console.log(error));


        // make sure username doesnt already exist
        UserService.hasUserWithUserName(
            req.app.get('db'),
            user_name
        )
            .then(hasUserWithUserName => {
                if (hasUserWithUserName)
                    return res.status(400).json({ error: `Username already taken` })

                return UserService.hashPassword(password)
                    .then(hashedPassword => {
                        const newUser = {
                            user_name,
                            password: hashedPassword,
                            full_name,
                            email,
                            date_created: 'now()',
                        }
                        // insert to db
                        return UserService.insertUser(
                            req.app.get('db'),
                            newUser
                        )
                            .then(user => {
                                const sub = user.user_name
                                const payload = { user_id: user.id }
                                // send the token
                                return res.status(200)
                                    .send({
                                        authToken: AuthService.createJwt(sub, payload),
                                    })
                            })
                    })
            })
            .catch(next)
    })

// here we are getting the user information to be displayed and possibly
// edited by the front end. we only want to display the username full name
// bio and occupation
// in the future we may add more such as link to portfolio 
// or link to project
// get users profile information
usersRouter
    .route('/profile')
    .get(requireAuth,async (req, res, next)=>{
       
        const user = req.user;
        
        const {profile} = req.query;
        
        if(Number(profile) > 0){
            
            const users = await User.query()
                .where('id', `${profile}`);
            return res.status(200).json(serializeUser(users[0]));
        }else{
           
            const personal = await User.query()
                .where('id', `${user.id}`);
            return res.status(200).json(serializeUser(personal[0]));
        }

    });

usersRouter.route('/update-user')
    .patch(requireAuth ,jsonBodyParser,async (req, res, next)=>{
        
        // get data
        const { user_name, full_name, bio, occupation } = req.body;
        const user = req.user;
        const updateUser = {
            user_name: user_name,
            full_name: full_name,
            bio: bio,
            occupation: occupation
        };
       
        // check if user info has been added
        Object.keys(updateUser).forEach(key=>{
            
            if(!updateUser[key])return res.status(400).json({
                error: `Missing key in ${key}.`
            })
        });

        const updated = await User.query()
                    .update(updateUser)
                    .where('id', `${user.id}`);

       
        if(!updated){
            return  res.status(400).json({
                error: "Unable to update profile"
            })
        }

        res.status(200).json(updated[0]);

    });


module.exports = usersRouter