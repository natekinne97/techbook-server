const express = require('express')
const friendsRouter = express.Router()
const { Friends } = require('../models/schema');
const { requireAuth } = require('../middleware/jwt-auth');
 
// the friends table groups users together using the logged in
// users id and the id of the person wanted to be friends


// get all friends of current user or different user
friendsRouter.route('/')
    .get( requireAuth,async (req, res, next)=>{
        // get the current user for only if no query is used.
        const user = req.user.id;
        // get the query option if searching for friends of a user.
        const {id} = req.query;

        try{
            // check if id is being used
            if(id){
                console.log('id is being used')
                const friends = await Friends.query()
                                .where({
                                    user_id: id
                                })
                return res.status(200).json(friends);
            }
            // current user info if no id is sent on query.
            const friends = await Friends.query()
                .where({
                    user_id: user
                })
            
            return res.status(200).json(friends);
            

        }catch(err){
            console.log(err);
            next();
        }
        
        
    });

// check if current user is friends with user
// to see if we need to show the adding friends button
friendsRouter.route('/check/:id')
    .get(requireAuth, async(req, res, next)=>{
        // get the id for 
        const id = req.params.id;
        // get the current user
        const user = req.user.id;
        
        // test id needs to be 1
        try{
            // get the friends data
            const friends = await Friends.query()
                            .where({
                                user_id: user,
                                friends_id: id
                            })
            
            // check if they are friends
            if(friends.length > 0){
                console.log(friends, 'friends');
                console.log('friends found')
                return res.status(200).json(friends);
            }else{
                console.log(friends, 'friends');
                console.log('not friends')
                return res.status(200).json({
                    message: "not friends"
                })
            }

        }catch(err){
            console.log(err);
            next();
        }

    });


// insert new friend
friendsRouter.route('/:id')
    .post(requireAuth, async(req, res, next)=>{
        // the id is for the person that is going to be added as a friend
        const id = req.params.id;
        
        console.log(id);
        // get the current user
        const user = req.user.id;
        console.log(user);
        // put in a try catch if nothing is returned then go on to the next try
       try{
           // first check if they are currently friends.
           const currentFriends = await Friends.query()
               .where({
                   user_id: user,
                   friends_id: id
               });

           console.log(currentFriends, 'current friends');
           // check if users are already friends
           if (currentFriends.id) {
               console.log('it is there');
               return res.status(200).json("Already friends")
           } 

           const newFriend = {
                user_id: user,
                friends_id: id
           }

            const insert = await Friends.query()
                                .insert(newFriend);  
            console.log(insert);
            if(insert.id){
                res.status(200).json(insert);
            }else{
                res.status(400).json("Error inserting");
            }

       }catch(err){
           console.log(err);
           next();
       }

      

    });


module.exports = friendsRouter;