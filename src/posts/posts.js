const express = require('express')

const { Post, Member, Friend } = require('../models/schema')

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
        user_id: post.user_id,
        votes: post.voted
    }
}

// fake post generated when not in any groups
fakePost = ()=>{
    return [{
        id: 1,
        post: "Welcome to TeckBook! :)",
        date_created: Date.now(),
        user: "TeckBook",
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

// get all the posts associated with the user.
postRouter.route('/')
        .get(requireAuth,async  (req, res, next)=>{
            // database access
            let db = req.app.get('db');

            const {id} = req.query;
            // const user = req.user;
            // get the user id
            const user_id = req.user.id;
            
            // get group id's of groups the user is in.
            const groups = await  Member.query()
                                    .where({
                                        user_id: user_id
                                    });
            console.log(groups, 'groups');
            // get friends posts
            const friends = await Friend.query()
                                .where('user_id', `${user_id}`);
    
            
            // get the friend id's of users friends.
            // check if the user is in any groups or has friends
            let group_ids;
            // check if there are any posts with the groups the user is in.
            if(groups.length > 0){
                console.log('user is in groups');
                // extract the ids
                group_ids = groups.map(group=>{
                    console.log(group, 'groups user is in');
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

            console.log(friend_id, 'friend id');
            console.log(group_ids, 'group ids');
            // check if we should send anything back or just send the fakepost
            if(friends.length === 0 && groups.length === 0){
                console.log('user is just starting out');
                const fake_post = await fakePost();
                return res.status(200).json(fake_post);
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
                res.json(posts);
               
               
            }else if(id){
                // sends back posts for a specific group
                
                   
                // this sends back posts specifically for groups
                const posts = await getPostGroupById(id, db);
                res.status(200).json(posts);    

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

module.exports = postRouter;