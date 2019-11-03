const postService = {
    getAllPosts(db){
        return db.raw(`
        select posts.*, sum(voted.vote), users.full_name
        from  users, posts  left outer join voted 
        on posts.id = voted.post_id  
        where (users.id = posts.user_id)
        group by posts.id, voted.post_id, users.full_name;
        `)

        
    },
    // this returns only 
    getAllPostsForGroup(db, group_id){
        return db.raw(`
            select posts.*, sum(voted.vote), users.full_name
            from  users, posts left outer join voted 
            on posts.id = voted.post_id  
            where (users.id = posts.user_id and posts.group_id = ${Number(group_id)})
            group by posts.id, voted.post_id, users.full_name;
        `)
    },
   
}

module.exports = postService;