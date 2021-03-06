const express = require('express')

const {  Voted } = require('../models/schema')

const jsonBodyParser = express.json()
const votesRouter = express.Router()
const { requireAuth } = require('../middleware/jwt-auth');



// this is where we handle the votes on the posts
// we have up votes and down votes. 
// it increases when a 1 is sent and decreases when a 0 is sent.
// we patch update the votes.
votesRouter.route('/')
    .post(requireAuth, jsonBodyParser, async (req, res, next) => {

        const { vote, post_id } = req.body;
        const user = req.user;

        if (!user) {
            res.status(400).json("no user");
        }
        // ensure the client sent the post id
        if (!post_id) {
            return res.status(400).json({
                error: "Must include post id."
            })
        }

        // check that the client sent the right number
        if (Number(vote) != 1 && Number(vote) != -1) {
            return res.status(400).json({
                error: "Votes can either be 1 or -1."
            })
        }

        const found = await Voted.query()
            .where({
                user_id: user.id,
                post_id: post_id
            })


        if (found.length === 0) {

            // insert the like and user to db
            const inserted = await Voted.query()
                .insert({
                    vote,
                    post_id,
                    user_id: user.id
                });



            if (inserted) {
                const finished = await Voted.query()
                    .where({
                        post_id: post_id
                    })
                    .sum('vote');

                return res.status(200).json(finished);
            }

        } else {

            return res.status(200).json({
                message: "user already voted"
            })
        }

    });

votesRouter.route('/')
    .patch( jsonBodyParser, async (req, res, next)=>{
        const { vote, post_id } = req.body;
        const user = 3;

        if (!user) {
            res.status(400).json("no user");
        }
        // ensure the client sent the post id
        if (!post_id) {
            return res.status(400).json({
                error: "Must include post id."
            })
        }

        // check that the client sent the right number
        if (Number(vote) != 1 && Number(vote) != -1) {
            return res.status(400).json({
                error: "Votes can either be 1 or -1."
            })
        }

        // find post where the user voted
        const findVote = await Voted.query()
                            .where({
                               post_id: Number(post_id),
                                user_id: Number(user)
                            })
                            .update({
                                post_id: Number(post_id),
                                user_id: Number(user),
                                vote: vote
                            })
       if(findVote){
           const finished = await Voted.query()
               .where({
                   post_id: post_id
               })
               .sum('vote');

         return  res.status(200).json(finished);
       } else {

           return res.status(400).json({
               message: "Failed to update"
           })
       }
      
       
                
        
    });

module.exports = votesRouter;