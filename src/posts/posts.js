const express = require('express')

const { Post, Voted, Members, Friends } = require('../models/schema')

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

getPostsFromGroups = async (group_id, db) =>{

    let post = await db.raw(`select posts.*, sum(voted.vote), users.full_name
                from  users, posts left outer join voted 
                on posts.id = voted.post_id  
                where (users.id = posts.user_id and posts.group_id in (${group_id}))
                group by posts.id, voted.post_id, users.full_name;`);

    return  post.rows;
   
}


getFriendsPosts = async (friend_id, db) => {

    let post = await db.raw(`select posts.*, sum(voted.vote), users.full_name
                from  users, posts left outer join voted 
                on posts.id = voted.post_id  
                where (users.id = posts.user_id and posts.user_id in (${friend_id}))
                group by posts.id, voted.post_id, users.full_name;`);

    return post.rows;

}

getPersonalPosts = async (user, db) =>{
    let post = await db.raw(`select posts.*, sum(voted.vote), users.full_name
                from  users, posts left outer join voted 
                on posts.id = voted.post_id  
                where (users.id = posts.user_id and posts.user_id = ${user})
                group by posts.id, voted.post_id, users.full_name;`);  

    return post.rows; 
}





/*

POSTS

*/

postRouter.route('/')
        .get(requireAuth,async  (req, res, next)=>{
            // database access
            let db = req.app.get('db');

            const {id} = req.query;
            const user = req.user;
            // get the user id
            const user_id = user.id;
            console.log(user_id, 'user id');
            // get group id's of groups the user is in.
            const groups = await  Members.query()
                                    .where('user_id', `${user_id}`);
            
            // get friends posts
            const friends = await Friends.query()
                                .where('user_id', `${user_id}`);
    
            // get the friend id's of users friends.
            // check if the user is in any groups or has friends
            let group_ids;
            if(groups){
                // extract the ids
                group_ids = groups.map(group=>{
                    console.log(group);
                    return group.group_id;
                })
                
            }

            // strip the list of friends id
            let friend_id
            if(friends){
                friend_id = friends.map(friend=>{
                    return friend.id;
                })
            }

            console.log(id, 'id');

            // default send all groups, friends when loading
            if(!id){

                try{
                    // get all posts associated with groups.
                    const groupPosts = await getPostsFromGroups(group_ids, db);
                    // get personal posts
                    const personalPosts = await getPersonalPosts(user_id, db);
                    // get all the posts from friends
                    const friendPosts = await getFriendsPosts(friend_id, db);

                    // concat the posts into on array
                    const posts = [...groupPosts, ... personalPosts, ...friendPosts];

                    // send all posts
                    res.json(posts);
                }catch(err){
                    console.log(err);
                }
               
            }else if(id){
                try{
                    // this sends back posts specifically for groups
                    const posts = await getPostsFromGroups(id, db);
                    res.status(200).json(posts);    

                }catch(err){
                    console.log(err);
                }
                            
        
            }
            

           

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
                                        .sum('vote');
                    console.log(finished);
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