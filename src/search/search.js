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
serializeSearchedPost = post => {

    return {
        id: post.id,
        post: xss(post.post),
        date_created: post.date_created,
        user: xss(post.full_name),
        user_id: post.user_id,
        votes: post.voted
    }
}

// select posts
getPostForTerm = async (term, db)=>{
    let post = await db.raw(`select posts.*, sum(voted.vote), users.full_name
            from  users, posts left outer join voted 
            on posts.id = voted.post_id  
            where (users.id = posts.user_id and posts.post ilike  '%${term}%')
            group by posts.id, voted.post_id, users.full_name;`);
    return post.rows;
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
                    return res.status(400).json({
                        error: "Must include search term"
                    })
                }


                // check if only spaces
                if (/^ *$/.test(term)) {
                   
                    // It has only spaces, or is empty
                    return res.status(400).json({
                        error: "Input is only spaces. Must include characters!"
                    })
                }
                
                
                // search for users
                const friends = await User.query()
                                    .where('full_name', 'ilike', `%${term}%`);
                // search for posts
                const posts = await getPostForTerm(term, req.app.get('db'));
                
                // search for groups
                const groups = await Group.query()
                             .where('group_name', 'ilike', `%${term}%`);


                // serialize friends
                let people = friends.map(person=>{
                    return serializePeople(person);
                });

                // serialize posts
                let cleanPost = posts.map(post=>{
                    return serializeSearchedPost(post)
                });

                // serialize groups
                let groupList = groups.map(group=>{
                    return serializeGroup(group);
                });

                // check if nothing came up
                if(groupList.length === 0 && cleanPost.length === 0 && people.length === 0){
                    return res.status(404).json({
                        error: "No results found."
                    })
                }
               
                // send all the results
               res.status(200).json({
                    people: people,
                    posts: cleanPost,
                    groups: groupList
               });

                

                
            });

module.exports = searchRouter;