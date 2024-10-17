const db = require(`${__dirname}/../db/connection`)
const bcrypt = require('bcrypt')

// get ALL users request

exports.fetchAllUsers = () => {
    return db.query('SELECT * FROM users')
    .then((result) => {
        return result.rows
    })
}

// get single user by user_id request

exports.fetchUserById = (id) => {
    return db.query('SELECT * FROM users WHERE user_id = $1', [id])
    .then((result) => {
        if (result.rows.length === 0){
            return Promise.reject({
                status : 404,
                msg : "bad request - user_id not recognised"
            })
        }
        else {return result.rows[0]}
    })
}

// get single user by username request

exports.fetchUserByUsername = (username) => {
    return db.query('SELECT * FROM users WHERE username = $1', [username])
    .then((result) => {
        if (result.rows.length === 0){
            return Promise.reject({
                status : 404,
                msg : "bad request - username not recognised"
            })
        }
        else {return result.rows[0]}
    })
}

// get single user by email request

exports.fetchUserByEmail = (email) => {
    return db.query('SELECT * FROM users WHERE email = $1', [email])
    .then((result) => {
        if (result.rows.length === 0){
            return Promise.reject({
                status : 404,
                msg : "bad request - email not recognised"
            })
        }
        else {return result.rows[0]}
    })
}

// post a new user request - password is hashed here.

exports.postNewUser = (newUserObject) => {
    const { username, email, password } = newUserObject;
    return bcrypt.hash(password, 10)
        .then((hashedPassword) => {
            return db.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *;', [username, email, hashedPassword])
        })
        .then((result) => {
            return result.rows[0]
        }) 
}

// patch an existing user by id - change username, email or password. CAN ONLY TAKE ONE CHANGE AT A TIME.

exports.patchUserWithId = (id, patchObject) => {
    const validKeys = ['new_username', 'new_email', 'new_password']
    const updates = Object.keys(patchObject).filter(key => validKeys.includes(key))
    if (updates.length === 0){
        return Promise.reject({
                status : 400, 
                msg : 'no valid fields to update'
            })
    }
    else for (const key in patchObject){
        if (key === 'new_username') {
            updateValue = patchObject.new_username
            return db.query('UPDATE users SET username = $1 WHERE user_id = $2 RETURNING *;', [updateValue, id])
            .then((result) => {
                return result.rows[0]
            })
        }
        if (key === 'new_email') {
            updateValue = patchObject.new_email
            return db.query('UPDATE users SET email = $1 WHERE user_id = $2 RETURNING *;', [updateValue, id])
            .then((result) => {
                return result.rows[0]
            })
        }
        if (key === 'new_password') {
            return bcrypt.hash(patchObject.new_password, 10)
            .then((hashedPassword) => {
                return db.query('UPDATE users SET password = $1 WHERE user_id = $2 RETURNING *;', [hashedPassword, id])
            })
            .then((result) => {
                return result.rows[0]
            })
        }    
    }
}

// delete an existing user by ID

exports.deleteUserById = (id) => {
    return db.query('DELETE FROM users WHERE user_id = $1 RETURNING *;', [id])
    .then((result) => {
        if (result.rows.length === 0){
            return Promise.reject({
                status : 404,
                msg: "bad request - user_id not recognised"
            })
        }
        else return result.rows[0]
    })
}