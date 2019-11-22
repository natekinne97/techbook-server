// make sure password contains some of the following?
const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]/
const xss = require('xss')
const bcrypt = require('bcryptjs')

const UserService = {
    // compare username with db
    hasUserWithUserName(db, user_name) {
        // change table to desired db
        return db('users')
            .where({ user_name })
            .first()
            .then(user => !!user)
    },
    // insert the user to db
    insertUser(db, newUser) {
        return db
            .insert(newUser)
            .into('users')
            .returning('*')
            .then(([user]) => user)
    },
    // check password for creation
    validatePassword(password) {
        // password less than 8
        if (password.length < 8) {
            return 'Password must be 8 characters or longer'
        }
        // mak sure its not longer than 72
        if (password.length > 72) {
            return 'Password be less than 72 characters'
        }
        // check for empty spaces at the beginning and end
        if (password.startsWith(' ') || password.endsWith(' ')) {
            return 'Password must not start or end with empty spaces'
        }
        // test complexity
        if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
            return 'Password must contain 1 upper case, lower case, number and special character'
        }
        return null
    },
    // check user from db
    getUsernameWithEmail(db, email) {
        return db('users')
            .where({ email })
            .first()
    },
    // encript password
    hashPassword(password) {
        return bcrypt.hash(password, 12)
    },
    // modify if more user info is stored
    // serialize and cleanse user
    serializeUser(user) {
        return {
            id: user.id,
            full_name: xss(user.full_name),
            user_name: xss(user.user_name),
            nickname: xss(user.nick_name),
            date_created: new Date(user.date_created),
        }
    },
}

module.exports = UserService