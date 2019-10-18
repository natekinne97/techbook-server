const express = require('express')

const { Post, Comment, Users } = require('../models/schema')
const { Model } = require('objection')
const jsonBodyParser = express.json()
const xss = require('xss');
const postRouter = express.Router()


// cleanse the post
serializePost = post=>{
    return {
        id: post.id,
        post: xss( post.post),
        date_created: post.date_created,
        user: xss(post.users.full_name),
        user_id: post.user_id
    }
}


// get posts
postRouter.route('/')
        .get(async (req, res, next)=>{
            // get the data
            const posts = await Post.query().eager('users');
            // check if there is data
            if(!posts)res.status(400).json({error: "database empty"});
            // send the data back serialized
            res.status(200).json(posts.map(serializePost))
            
        });

// possibly put back in
// postRouter.route('/:id')
//         .get(async (req, res, next)=>{
//             // gets comments for it also
//             const posts = await Post.query()
//                             .findById(req.params.id).eager('comments');
            
//             res.json(posts);
//         });


// gets all comments for post
postRouter.route('/comments/:id')
        .get(async(req, res, next)=>{
           try{
               const comments = await Comment.query().eager('users');
                                        
                                    // .where('post_id', `${req.params.id}`);

                if(!comments)res.status(400).json({error: "no comments found"})
               res.json(comments);
           }catch(e){
               console.log(e);
               throw(e);
           }
        });


// insert new post
postRouter.route('/')
        .post(jsonBodyParser, async (req, res, next)=>{
            const newPost = req.body;
            
            if(!newPost){
                res.status(400).json({
                    error: "missing post field"
                })
            }

            const post = await Post.query()
                                    .allowInsert('[post, user]')
                                    .insert(newPost);
            
            console.log(post, 'new post');
            res.json(post);

        });



module.exports = postRouter;