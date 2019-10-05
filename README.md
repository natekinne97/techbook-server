User API Boilerplate

The user api boilerplate has everything you need to hit the ground running
with everything you need to let users create accounts and reset passwords,
it even has token authentication with refresh.

To run first npm i to install all of the dependencies. Then create a database for the program and change the .env file to fit your credentials.
Run npm run migrate to create the user table. Run npm test to check everythng works. And you're set.

To create an account use '/api/users/new-user'.

Login is done at '/api/users/login'.

On the desired expirey time you set in the .env your user will new to have 
their authentication token refreshed. The token refresh is done at 
'/api/auth/refresh'.

The password reset is a 3 part process.
first we make the request at '/api/reset/forgot'. This sends an email to the
user with an auth token.

Second the user clicks the link and takes you to a page where the password
change takes place. You must send the auth token to the server 
at '/api/reset/reset-check' this verfies the users credentials. Just a 
warning the user can ONLY click the link ONCE. 

Next we reset the password. This is done at '/api/reset/reset-password'.
