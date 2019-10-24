const express = require('express')

const { Post, Users } = require('../models/schema')

const jsonBodyParser = express.json()
const xss = require('xss');
const searchRouter = express.Router()
const { requireAuth } = require('../middleware/jwt-auth');

// cleanse and filter users
serializeUsers = user =>{
    return {
        id: user.id,
        full_name: user.full_name
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



// here we are going to search for posts and users
// we can search text in posts and users to add as friends
// in the future we will have groups;
searchRouter.route('/')
            .post(jsonBodyParser, async (req, res, next)=>{
                const {term} = req.body;
                console.log(term, 'term');
                if(!term){
                    res.status(400).json({
                        error: "Must include search term"
                    })
                }
                
                // search for users
                const friends = await Users.query()
                                    .where('full_name', 'ilike', `%${term}%`);
                // search for posts
                const posts = await Post.query()
                            .eager('users')
                            .where('post', 'ilike', `%${term}%`);
                
                // send friends 
                if(friends.length > 0){
                    res.status(200).json({
                        friends: friends.map(serializeUsers)
                    });
                }else if(posts.length > 0){
                    res.status(200).json({
                        posts: posts.map(serializePost)
                    });
                }else if(posts.length > 0 && friends.length > 0){
                    res.status(200).json({
                        posts: posts.map(serializePost),
                        friends: friends.map(serializeUsers)
                    });
                }

                
            });

module.exports = searchRouter;