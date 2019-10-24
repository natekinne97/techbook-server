const express = require('express')

const { Post, Comment, Users, Voted } = require('../models/schema')

const jsonBodyParser = express.json()
const xss = require('xss');
const postService = require('./postService');
const postRouter = express.Router()
const {requireAuth} = require('../middleware/jwt-auth');

// cleanse the post
serializePost = post=>{
    
    return {
        id: post.id,
        post: xss( post.post),
        date_created: post.date_created,
        user: xss(post.users.full_name),
        user_id: post.user_id,
        votes: post.voted
    }
}


/*

POSTS

*/

postRouter.route('/')
        .get(  (req, res, next)=>{
           

            postService.getAllPosts(
                    req.app.get('db')
                ).then(posts=>{
                    
                    res.json(posts.rows);
                }).catch(next);

               
            
        });


// insert new post
postRouter.route('/')
    .post(requireAuth, jsonBodyParser, async (req, res, next) => {
        const { post } = req.body;
        const user = req.user;

        const newPost = {
            post: post,
            user_id: user.id
        }
        // ensure there is nothing missing here
        Object.keys(newPost).forEach(key => {
            if (!newPost[key]) res.status(400).json({
                error: `Missing field in ${key}`
            })
        });
        // insert the post. allowing the user to only insert
        // the new post and user_id
        const postInserted = await Post.query()
            .allowInsert('[post, user_id]')
            .insert(newPost)
            .eager('users');

        res.json(serializePost(postInserted));

    });



/*
=================
VOTES
=================
*/


// this is where we handle the votes on the posts
// we have up votes and down votes. 
// it increases when a 1 is sent and decreases when a 0 is sent.
// we patch update the votes.
postRouter.route('/votes')
        .post( requireAuth, jsonBodyParser,async (req, res, next)=>{
            console.log('votes was called');
            const {vote, post_id} = req.body;
            const user = req.user;
            
           
            if(!user){
                res.status(400).json("no user");
            }
            // ensure the client sent the post id
            if(!post_id){
               return res.status(400).json({
                    error: "Must include post id."
                })
            }
            

            // check that the client sent the right number
            if(Number(vote) != 1 && Number(vote) != -1){
               return res.status(400).json({
                    error: "Votes can either be 1 or -1."
                })
            }

            const found = await Voted.query()
                                .where({
                                    user_id: user.id,
                                    post_id: post_id
                                })  
            

            if(found.length === 0){
                console.log('inserting')
                
                    // insert the like and user to db
                    const inserted = await Voted.query()
                        .insert({
                            vote,
                            post_id,
                            user_id: user.id
                        });

                
                
                if(inserted){
                    const finished = await Voted.query()
                                        .where({
                                            post_id: post_id
                                        })  
                                        .count('vote');

                    res.status(200).json(finished);
                }
                                        
            }else{ 
                console.log('already voted')
                res.status(200).json({
                    message: "user already voted"
                })
            }

          
            
        });


/*

*************
COMMENTS
*************

*/

module.exports = postRouter;