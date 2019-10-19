const express = require('express')

const { Post, Comment, Users } = require('../models/schema')

const jsonBodyParser = express.json()
const xss = require('xss');
const postRouter = express.Router()
const {requireAuth} = require('../middleware/jwt-auth');

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

// cleanse and send certian data
serializeComment = comment=>{
    return{
        id: comment.id,
        date_created: comment.date_created,
        user_id: comment.user_id,
        user: comment.users.full_name,
        comment: comment.comment
    }
}

/*

POSTS

*/

postRouter.route('/')
        .get(  async (req, res, next)=>{
            try{
                console.log('getting called')
                // get the data
                const posts = await Post.query()
                                .orderBy('date_created', 'desc')
                                .eager('users');
         

                // check if there is data
                if (!posts) res.status(400).json({ error: "database empty" });
                // send the data back serialized
                res.status(200).json(posts.map(serializePost));
            }catch(e){
                console.log(e, ' error occured')
                console.log('error occured in retrieving data');
                res.status(400).json({
                    error: "something went wrong"
                })
            }
            
        });


// insert new post
postRouter.route('/')
        .post(requireAuth, jsonBodyParser, async (req, res, next)=>{
            const {post} = req.body;
            const user = req.user;
           
            const newPost = {
                post: post,
                user_id: user.id
            }
            // ensure there is nothing missing here
            Object.keys(newPost).forEach(key=>{
                if(!newPost[key])res.status(400).json({
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

*************
COMMENTS
*************

*/

// gets all comments for post
postRouter.route('/comments/:id')
    .get(requireAuth, async (req, res, next) => {
        try {
            //    console.log(req.params.id);
            const comments = await Comment.query()
                .where('post_id', `${req.params.id}`)
                .eager('users');


            //   check if there are comments
            if (!comments) res.status(400).json({ error: "no comments found" })

            res.status(200).json(comments.map(serializeComment));

        } catch (e) {
            res.status(400).json({ error: "Something went wrong" })
            console.log(e);
        }
    });



// insert new comment
postRouter.route('/comment')
    .post(requireAuth, jsonBodyParser, async (req, res, next) => {
        const { comment, post_id } = req.body;
        const user = req.user;

        const newComment = {
            comment: comment,
            user_id: user.id,
            post_id: post_id
        }

        // ensure there is nothing missing here
        Object.keys(newComment).forEach(key => {
            if (!newComment[key]) res.status(400).json({
                error: `Missing field in ${key}`
            })
        });
        // insert the post. allowing the user to only insert
        // the new post and user_id
        const commmentInserted = await Comment.query()
            .allowInsert('[comment, user_id, post_id]')
            .insert(newComment)
            .eager('users');

        res.json(serializeComment(commmentInserted));

    });


module.exports = postRouter;