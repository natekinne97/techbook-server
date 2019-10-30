const express = require('express')
const jsonBodyParser = express.json()
const xss = require('xss');
const { Group, Members } = require('../models/schema');
const memberRouter = express.Router()
const { requireAuth } = require('../middleware/jwt-auth');

// this file deals with all member associated dealings 
serializeMembers = member =>{
    
    return {
        group_name: member.group[0].group_name,
        id: member.group[0].id
    }
}

// get all members
memberRouter.route('/')
        .get(requireAuth,async (req, res, next)=>{
            // get the data
            const members = await Members.query().eager('users');

            res.status(200).json(members);
        });

// check if user is in group
memberRouter.route('/check/:id')
            .get(requireAuth, async (req, res, next)=>{
                const user = req.user;
                // id associates the user and the group.
                // the id is for the group id
                const id = req.params.id;
                
                try{
                    console.log('checking user');
                    const inGroup = await Members.query()
                                        
                                        .where({
                                            user_id: `${user.id}`,
                                            group_id: `${id}`
                                        })
                                        ;
                    if(inGroup.length === 0){
                       return  res.status(200).json({
                            message: "User is not this group"
                        })
                    }
                    
                    res.status(200).json(inGroup[0]);
                }catch(err){
                    console.log(err);
                    res.status(400).json({
                        error: "an error occured"
                    })
                }
            });

// get groups by user for display on the sidebar
memberRouter.route('/users-groups')
        .get(requireAuth, async (req, res, next)=>{
            const user = req.user;
            try{
                const group = await Members.query()
                                .eager('group')
                                .where('user_id', `${user.id}`);

                
                if(group.length > 0){
                    return res.status(200).json(group.map(serializeMembers))
                }else{
                    return res.status(200).json({
                        message: "user is not in any groups"
                    })
                }
            }catch(err){
                console.log(err);
                res.status(400).json({
                    error: "Something went wrong"
                })
            }
        })

// mark user as a member
memberRouter.route('/add/:id')
            .post(requireAuth, async(req, res, next)=>{
                // inserted with group id
                const group_id = req.params.id;
                // and user id
                const user = req.user;
                console.log('getting called')
                console.log('working still here');
                // make a new entry
                const newMember = {
                    group_id: group_id,
                    user_id: user.id
                }

                try{
                    // insert the new member
                    const inserted = await Members.query()
                                    .insert(newMember);
                   if(inserted.length > 0){
                       console.log('sending message');
                       // send the welcome message
                       res.status(200).json({
                           message: "Welcome to the group"
                       })
                   }


                }catch(err){
                    console.log(err);
                    res.status(400).json({
                        error: "Something went wrong"
                    })
                }
            });

module.exports = memberRouter;