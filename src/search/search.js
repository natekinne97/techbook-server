const express = require('express')

const { Post, User, Group } = require('../models/schema')

const jsonBodyParser = express.json()
const xss = require('xss');
const searchRouter = express.Router()
const { requireAuth } = require('../middleware/jwt-auth');

// clean groups
serializeGroup = group =>{
    return {
        id: group.id,
        name: xss(group.group_name)
    }
}

// cleanse the post
serializePost = post => {

    return {
        id: post.id,
        post: xss(post.post),
        date_created: post.date_created,
        user: xss(post.users.full_name),
        user_id: post.user_id,
        votes: post.voted
    }
}

// clean the people
serializePeople = people =>{
    return {
        id: people.id,
        name: xss(people.full_name)
    }
}


// here we are going to search for posts and users
// we can search text in posts and users to add as friends
// in the future we will have groups;
searchRouter.route('/')
            .post(requireAuth, jsonBodyParser, async (req, res, next)=>{
                const {term} = req.body;
               
                if(!term){
                    res.status(400).json({
                        error: "Must include search term"
                    })
                }
                
                // search for users
                const friends = await User.query()
                                    .where('full_name', 'ilike', `%${term}%`);
                // search for posts
                const posts = await Post.query()
                            .eager('users')
                            .where('post', 'ilike', `%${term}%`);
                
                // search for groups
                const groups = await Group.query()
                             .where('group_name', 'ilike', `%${term}%`);


                // serialize friends
                let people = friends.map(person=>{
                    return serializePeople(person);
                });

                // serialize posts
                let cleanPost = posts.map(post=>{
                    return serializePost(post)
                });
                
                // serialize groups
                let groupList = groups.map(group=>{
                    return serializeGroup(group);
                });

               
                // send all the results
               res.status(200).json({
                    people: people,
                    posts: cleanPost,
                    groups: groupList
               });

                

                
            });

module.exports = searchRouter;