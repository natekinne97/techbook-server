const express = require('express')

const { Post, Member, Friend, Group } = require('../models/schema')

const jsonBodyParser = express.json()
const xss = require('xss');
const postRouter = express.Router()
const {requireAuth} = require('../middleware/jwt-auth');

// cleanse the post
serializePost = post=>{
   
    return {
        id: post.id,
        post: xss(post.post),
        date_created: post.date_created,
        full_name: xss(post.full_name),
        user_id: post.user_id,
        votes: post.sum
    }
}

  

// fake post generated when not in any groups
fakePost = ()=>{
    let date = new Date();
    return [{
        id: 1,
        post: "Welcome to TeckBook! :)",
        date_created: date.toISOString(),
        full_name: "TeckBook",
        user_id: 0,
        votes: 99
    }]
}

// accepts a groupd of ids
getPostsFromGroups = async (group_id, db) =>{
    let post = await db.raw(`select posts.*, sum(voted.vote), users.full_name
                from  users, posts left outer join voted 
                on posts.id = voted.post_id  
                where (users.id = posts.user_id and posts.group_id in (${group_id}))
                group by posts.id, voted.post_id, users.full_name;`);

    return  post.rows;
   
}


getFriendPosts = async (friend_id, db) => {

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

getPostGroupById = async (id, db)=>{
    let post = await db.raw(`select posts.*, sum(voted.vote), users.full_name
                from  users, posts left outer join voted 
                on posts.id = voted.post_id  
                where (users.id = posts.user_id and posts.group_id = ${id})
                group by posts.id, voted.post_id, users.full_name;`);


    return post.rows; 
}

// get post by id
getPostById = async (id, db) => {
    let post = await db.raw(`select posts.*, sum(voted.vote), users.full_name
                from  users, posts left outer join voted 
                on posts.id = voted.post_id  
                where (users.id = posts.user_id and posts.id = ${id})
                group by posts.id, voted.post_id, users.full_name;`);


    return post.rows;
}


// get all the posts associated with the user.
postRouter.route('/')
        .get(requireAuth,async  (req, res, next)=>{
            // database access
            let db = req.app.get('db');

            const {id} = req.query;
            // const user = req.user;
            // get the user id
            const user_id = req.user.id;
            
            // check they want group posts only for a specific group
            if (id) {

                // this sends back posts specifically for groups
                const posts = await getPostGroupById(id, db);
                
                return res.status(200).json(posts);

            }

            // get group id's of groups the user is in.
            const groups = await  Member.query()
                                    .where({
                                        user_id: user_id
                                    });
           
            
            // get friends posts
            const friends = await Friend.query()
                                  .where('user_id', `${user_id}`);
    
            
            // get the friend id's of users friends.
            // check if the user is in any groups or has friends
            let group_ids;
            // check if there are any posts with the groups the user is in.
            if(groups.length > 0){
                
                // extract the ids
                group_ids = groups.map(group=>{
                    return group.group_id;
                })
                
            }

            
            let friend_id;
            // check if there are any friends
            if(friends){
                // strip the list of friends id
                friend_id = friends.map(friend=>{
                    return friend.id;
                })
            }

            
            // check if we should send anything back or just send the fakepost
            if(friends.length === 0 && groups.length === 0){
                // make the fake post
                const fake_post = await fakePost();
                // send the fake post as an array
                return res.status(200).json([serializePost(fake_post[0])]);
            }
           
            // default send all groups, friends when loading
            if(!id){


                const groupPosts = group_ids && group_ids.length > 0 ? await getPostsFromGroups(group_ids, db) : [];
                // get personal posts
                const personalPosts = await getPersonalPosts(user_id, db);
               
                const friendPosts = friend_id && friend_id.length > 0 ? await getFriendPosts(friend_id, db) : [];
                
               
                // concat the posts into on array
                const posts = [...groupPosts, ...personalPosts,   ...friendPosts];
                
                
                
                // send all posts
                res.status(200).json(posts);
               
               
            }
            
        });


// insert new post
postRouter.route('/')
    .post(requireAuth, jsonBodyParser, async (req, res, next) => {
        const { post } = req.body;
        const id = req.query.id;
        const user = req.user;

        // check if there is an id


        if(id){
          
            // check if group id is valid
            const group = await Group.query()
                            .where({
                                id: id
                            });
           
            // if the group exists allow insert
            if(group){
                
                // make new post to insert
                const newPost = {
                    post: post,
                    user_id: user.id,
                    group_id: id
                }

                // validate the post
                for(const key of Object.keys(newPost)){
                    if (!newPost[key]) {
                      
                        return res.status(400).json({
                            error: `Missing field in ${key}`
                        })
                    }
                }

                // check if there are characters 
                for(const key of Object.keys(newPost)){
                    if (/^ *$/.test(newPost[key])) {
                       
                        // It has only spaces, or is empty
                        return res.status(400).json({
                            error: "Post is only spaces. Must include characters!"
                        })
                    }
                }
               
                // insert the post. allowing the user to only insert
                // the new post and user_id
                const postInserted = await Post.query()
                    .allowInsert('[post, user_id, group_id]')
                    .insert(newPost)
               
                const posts = await getPostById(postInserted.id, req.app.get('db'))
                
                return res.status(200).json(serializePost(posts[0]));
                
            }else{
               
                return res.status(400).json({
                    error: "Group does not exist"
                })
            }
        }
      
        // everything below this line is for when there is not an 
        // id referencing a group
        
        // make new post to insert
        const newPost = {
            post: post,
            user_id: user.id,
        }

        // make sure all keys were sent
        for (const key of Object.keys(newPost)) {
            if (!newPost[key]) {
               
                return res.status(400).json({
                    error: `Missing field in ${key}`
                })
            }
        }

        // test if there are characters in submission 
        for (const key of Object.keys(newPost)) {
            if (/^ *$/.test(newPost[key])) {
               
                // It has only spaces, or is empty
                return res.status(400).json({
                    error: "Post is only spaces. Must include characters!"
                })
            }
        }

       try{
       
           // insert the post. allowing the user to only insert
           // the new post and user_id
           const postInserted = await Post.query()
               .allowInsert('[post, user_id, group_id]')
               .insert(newPost);

            
            const posts = await getPostById(postInserted.id, req.app.get('db'))
               
           return res.status(200).json(serializePost(posts[0]));

       }catch(err){
           console.log('error');
           console.log(err);
       }
    });

module.exports = postRouter;