				Tech-Book

Tech-Book is a social media style forum for tech. Create an account and start asking questions and making groups. Add friends, make groups and ask questions. Get connected with your peers.

			Tech-Book Server

The server side is a CRUD style API made using Node, Express, Postgresql, Knex,  JWT, and Objection.js. This API handles all of the accounts (I.e friending and unfriending, entering and leaving a group), groups, and post related activities.  


			Summary

This API handles account access and login with bcrypt and also uses JWT Authentication tokens to handle the refreshes. Create, leave and join groups.
Create and comment on posts. Add posts with group tags or just personal.

1. To start first clone the repository
2. npm I to install the dependencies
3. configure the db and set up the .env
4. run npm test to ensure the install went well.


			Table Schemas
User Schema
{
	id,
	user_name: 'String',
	email: 'String',
	full_name: 'String',
	password: 'String',
	date_created: 'String',
	date_modified: 'String',
	bio: 'String',
	occupation: 'String',
	resetpasswordtoken: 'String',
	resetpasswordexpires: 'String'
}

Posts Schema
{
	id: integer,
	post: 'String',
	date_created: 'String',
	user_id: 'Integer',
	groupt_id: 'Integer',
}

Comments Schema
{
	id: 'Integer',
	comment: 'String',
	date_created: 'String',
	user_id: 'Integer',
	post_id: 'Integer'
}

Votes Schema
{
	id: 'Integer',
	vote: 'Integer',
	post_id: 'Integer',
	user_id: 'Integer'
},

Groups Schema
{
	id: 'Integer'
	group_name: 'String',
	about: 'String',
	exp_lvl: 'String'
}

Group Members Schema
{
	id: 'Integer',
	group_id: 'Integer',
	user_id: 'Integer'
}

Friends Schema
{
	id: 'Integer', 
	friends_id: 'Integer', 
	user_id: 'Integer',
}

			Users

The user portion of the API has several features. It holds the user_name, full_name, email, resetpasswordtoken, resetpasswordexpiry.

To create a new user we use ‘/api/users/new-user’. This takes several parameters first an authentication token and the body takes `full_name, password, email, user_name`. This returns an authentication token. 

PATCH a user ‘/api/users/update-user’. The patch for the user is used to add a bio and occupation and/or change the user_name and full_name.
For password reset refer to password reset. Returns the users: user_name, 
full_name, bio, occupation.

GET user info. ‘/api/users/profile’ is used to get either the current user’s profile or the profile of a different user. Returns the users: user_name, full_name, bio, occupation.


				Password Reset

The password reset is a 3 part process. First we need to send the email, next we need to verify that the link is valid finally the password change. Returns status 200 and a message saying: 'recovery email sent'.

POST request change ‘/api/reset/forgot’ body takes only the email parameter. On success returns ‘Recovery email sent’.

POST Verify Link ‘/api/reset/reset-check’ the body takes the resetpasswordtoken from the url. And returns the user_name on success.
The username is to be stored for use in the next step.

PATCH Takes 2 body parameters: user_name and password. 	On success returns status 201 and ‘Successfully changed’.

		
				Authentication

For Authentication starting with the simple login the route used is ‘/api/auth/login’. This takes 2 parameters in the body: user_name and password. In return the user will get a JWT.

Refreshing ‘/api/auth/refresh’. The timing for refresh can be changed in the .env file. Returns an updated authentication token.

				Friends
A user can add and remove friends also checking all friends and check if they are currently following eachother.

POST ‘/api/friends/:id’. The id in the params is the id of the friend meaning to be added. Returns a 1 if successful and if unsuccessful
returns status 400 error 'Error inserting'.

GET ‘/api/friends/check/:id’ checks if the current user and the viewed user are friends. Returns not friends if its false and returns the friends id if it is true.

GET ‘/api/friends/’ returns a list of all the current users friends.

DELETE ‘/api/friends/’ if successful deleted returns a message saying: ‘You are no longer friends’.  

				



			Groups
Groups can be created, joined, and left. They are there to compartmentalize the topics of conversation.

GET ALL GROUPS ‘/api/groups/’ returns every group. The data is returned:  id, name, about, level.

GET GROUP BY ID ‘/api/groups/:id’ the data is sorted with id, name, about, level.

POST ‘/api/groups/’ takes the body parameters: group_name, about, exp_lvl.
Returns:  id, name, about, level.


			Group Members

If you have groups you will need to have members. 

POST ‘/api/member/:id’.  The id is the group id the user is being added to. 
On success it will return a message saying: ‘Welcome to the group’.

DELETE ‘/api/member/:id’ This is for removing the user from the group.
returns status 200 and message: 'User has left the group.'.

GET ALL MEMBERS ‘/api/member/’ returns every member of every group: id, group_id, user_id.

GET USERS GROUPS ‘/api/member/user-groups’ returns the name and id of every group the current user is in.

GET CHECK IF USER IS IN GROUP ‘/api/member/:id’ returns user: ‘The user is in this group’ if the user is in the group and message: ‘User is not in this group’ if false.
		

				Posts

Posts can be added with a personal or group tag. A personal or group post will show up in the home post feed. Posts made by friends will also show up in the main feed. 

POST ‘/api/posts/’ will take 1 body parameter and 1 authentication header. The body must include the post and the user MUST be logged in to make a new post. If you’re tagging a group you can use ‘/api/posts/?id=num’. The id in the query must be the id of the group being tagged. This will return id, post, date_created, user (the owner of the post), user_id (can be made into a link that can check the users profile), votes (the current tally of upvotes and down votes).

GET ‘/api/posts/’ again remember you need to pass the JWT. This will return id, post, date_created, user (the owner of the post), user_id (can be made into a link that can check the users profile), votes (the current tally of upvotes and down votes). For each post associated with the user. If the user is not associated with anyone or any groups a welcome post will be sent.


					Comments

Comments can be made on any posts. And are seperated from the posts route.
This is a secured endpoint and requires the user to be logged in. 

POST ‘/api/comments/’ . The body takes 2 parameters: comment and post_id. Returning: id, date_created, user_id, users, comment.

GET ‘/api/comments/’. Returning: id, date_created, user_id, users, comment.

		
					Votes

Votes only takes a post request. It cannot be changed once submitted. It checks the database to see if the user has already voted for that post. 

POST ‘/api/votes/’. This takes 2 body parameters: vote and post_id. The vote can only be 1 or -1. 

PATCH '/api/votes/'. returns the sum of all votes for the post.


					Search

Searches can be made for anything such as posts, groups or people. 

POST ‘/api/search/’. The body accepts 1 parameter: term. The search results are divided into the different sections: people, posts, and groups.
People is returning: id, name
Posts is returning: id, post, date_created, user, user_id, votes.
Groups is returning: id, name


				
