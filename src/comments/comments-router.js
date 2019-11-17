const express = require('express')

const { Comment } = require('../models/schema')

const jsonBodyParser = express.json()
const xss = require('xss');
const commentRouter = express.Router()
const { requireAuth } = require('../middleware/jwt-auth');

// cleanse and send certian data
serializeComment = comment => {
    return {
        id: comment.id,
        date_created: comment.date_created,
        user_id: comment.user_id,
        user: xss(comment.users.full_name),
        comment: xss(comment.comment)
    }
}



// gets all comments for post with id
commentRouter.route('/:id')
    .get(requireAuth, async (req, res, next) => {
        try {
            console.log('getting comments')
            //   find comments for post
            const comments = await Comment.query()
                .where('post_id', `${req.params.id}`)
                .eager('users');
                
            console.log('comments retrieved');

            //   check if there are comments
            if (!comments)return res.status(400).json({ error: "no comments found" })

            res.status(200).json(comments.map(serializeComment));

        } catch (e) {
            res.status(400).json({ error: "Something went wrong" })
            console.log(e);
        }
    });



// insert new comment
commentRouter.route('/')
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

        res.status(200).json(serializeComment(commmentInserted));

    });

module.exports = commentRouter;