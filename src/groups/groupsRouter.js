const express = require('express')
const jsonBodyParser = express.json()
const xss = require('xss');
const {Group} = require('../models/schema');
const groupRouter = express.Router()
const { requireAuth } = require('../middleware/jwt-auth');


// this deals with all the group descriptions and 
// names associated with groups

// serialize groups
serializeGroups = group=>{
    return {
        id: group.id,
        name: xss(group.group_name),
        about: xss(group.about),
        level: xss(group.exp_lvl)
    }
}

// get all groups
groupRouter.route('/')
        .get(requireAuth,async (req, res, next)=>{
            // get the data from db
            const groups = await Group.query();
            
            // check if there was content
            if(groups != []){
                res.status(200).json(groups.map(serializeGroups));
            }else{
                // send error message
                res.status(400).json({
                    error: "The database is empty"
                })
            }
        }); 

// get group by id
groupRouter.route('/:id')
        .get(requireAuth,async (req, res, next)=>{
            // get the id
            const id = req.params.id;
            
           try{
               console.log('before the grab work now')
               // get the data
               const group = await Group.query().where('id', `${id}`);
                
               // check if group exists
               if (group != []) {
                   res.status(200).json(serializeGroups(group[0]));
               } else {
                   res.status(400).json({
                       error: "Group not found."
                   })
               }
           }catch(err){
               console.log('error');
               console.log(err);
           }

        });


// insert new group
groupRouter.route('/')
    .post(requireAuth ,jsonBodyParser, async (req, res, next)=>{
        const {group_name, about, exp_lvl} = req.body;

        const newGroup = {
            group_name: group_name,
            about: about,
            exp_lvl: exp_lvl
        }

        // ensure there is nothing missing here
        Object.keys(newGroup).forEach(key => {
            if (!newGroup[key])return res.status(400).json({
                error: `Missing field in ${key}`
            })
        });

        // for checking if the name already exists
        const exist = await Group.query()
                            .where('group_name', group_name);
        
        if(exist.length > 0){
           
           return res.status(400).json({
                message: "Group name already exists. Please try a different one."
            });
        }

        // insert the new group
        const inserted = await Group.query()
                            .insert(newGroup);
                            
        // check if it was inserted
        if(inserted){
            res.status(200).json(inserted);
        }else{
            // error not inserted
           
            res.status(400).json({
                error: "Error inserting group"
            })
        }

    });

module.exports = groupRouter;