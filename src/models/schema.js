const Knex = require('knex')
const connection = require('./knexfile')
const { Model } = require('objection')

const knexConnection = Knex(connection)

Model.knex(knexConnection);

// comments model handles comments
class Comment extends Model {
    static get tableName() {
        return 'comments'
    }

    static get relationMappings() {
        return {
            post: {
                relation: Model.HasOneRelation,
                modelClass: Post,
                join: {
                    from: 'comments.post_id',
                    to: 'posts.id'
                },
            },
            // get user information on comments
            users: {
                relation: Model.HasOneRelation,
                modelClass: Users,
                join: {
                    from: 'users.id',
                    to: 'comments.user_id'
                }
            }
        }
    }
}


// post model handles posts
class Post extends Model{
    static get tableName(){
        return 'posts'
    }


    static get relationMappings(){
        return{
            // has possibility to get comments with post 
            // and display with user information
            comments: {
                relation: Model.HasManyRelation,
                modelClass: Comment,
                join: {
                    from: 'posts.id',
                    to: 'comments.post_id'
                },
            },
            users: {
                relation: Model.HasOneRelation,
                modelClass: Users,
                join: {
                    from: 'users.id',
                    to: 'posts.user_id'
                }
            },
            voted: {
                relation: Model.HasManyRelation,
                modelClass: Voted,
                join: {
                    from: 'voted.post_id',
                    to: 'posts.id'
                }
            
                
            }
        }
    
    }//mappings

    // json schema
    static get jsonSchema(){
        return {
            type: 'object',
            // required: ['post', 'user_id'],
            properties: {
                id: {type: 'integer'},
                post: {type: 'string'},
                user_id: {type: 'integer'},
            }
        }
    }
}

class Voted extends Model{
    static get tableName(){
        return 'voted';
    }

    static get modifiers(){
        return {
            sum(query){
                query.select('vote').count();
            }
        }
    }

    static get relationMappings(){
       return {
           users: {
               relation: Model.HasManyRelation,
               modelClass: Users,
               join: {
                   from: 'users.id',
                   to: 'voted.id'
               }
           },

           posts: {
               relation: Model.HasOneRelation,
               modelClass: Post,
               join: {
                   from: 'posts.id',
                   to: 'voted.id'
               }

           }
       }
    }
}

// user model for loading username information on the posts.
// will also be used to send the user to the users profile
// when link is finished
class Users extends Model {
    static get tableName() {
        return 'users'
    }

    static get jsonSchema(){
        return {
            type: 'object',
            required: ['user_name', 'full_name'],
            properties: {
                id: {type: 'integer'},
                user_name: {type: 'string'},
                full_name: {type: 'string'},
                email: {type: 'string'},
                password: {type: 'string'},
                resetpasswordtoken: {type: 'string'},
                resetpasswordexpires: {type: 'string'}
            }
        }
    }
}

module.exports = {Post, Comment, Users, Voted};