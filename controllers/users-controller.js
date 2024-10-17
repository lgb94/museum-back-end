const { fetchAllUsers, fetchUserById, fetchUserByUsername, fetchUserByEmail, postNewUser, patchUserWithId, deleteUserById } = require(`${__dirname}/../models/users-model`)
const bcrypt = require("bcrypt")

// get ALL users request

exports.getUsers = (req, res, next) => {
    fetchAllUsers().then((users) => {
        res.status(200).send({users})
    })
    .catch((err) => {
        next(err)
    })
}

// get single user by given ID request

exports.getUserById = (req, res, next) => {
    const id = req.params.user_id
    fetchUserById(id).then((user) => {
        res.status(200).send({user})
    })
    .catch((err) => {
        next(err)
    })
}

// get single user by given username request

exports.getUserByUsername = (req, res, next) => {
    const username = req.params.username
    fetchUserByUsername(username).then((user) => {
        res.status(200).send({user})
    })
    .catch((err) => {
        next(err)
    })
}

// get single user by given email request

exports.getUserByEmail = (req, res, next) => {
    const email = req.params.email
    fetchUserByEmail(email).then((user) => {
        res.status(200).send({user})
    })
    .catch((err) => {
        next(err)
    })
}

// verify a user / login request - uses users email and password and checks them against stored data.

exports.verifyUser = (req, res, next) => {
    const submittedDetails = req.body
    fetchUserByEmail(submittedDetails.email).then((user) => {
        bcrypt.compare(submittedDetails.password, user.password).then((isMatch) => {
            if (!isMatch) {
                return res.status(401).send({ msg: 'wrong email/password' });
            }
            res.status(200).send({user});
        });
    })
    .catch((err) => {
        next(err)
    })    
}

// post a new user request

exports.postUser = (req, res, next) => {
    const newUserObject = req.body
    postNewUser(newUserObject).then((user) => {
        res.status(200).send({user})
    })
    .catch((err) => {
        next(err)
    })
}


// patch an existing user request - change username, email, password 

exports.patchUser = (req, res, next) => {
    const id = req.params.user_id
    const patchObject = req.body
    const promises = [patchUserWithId(id, patchObject), fetchUserById(id)]
    Promise.all(promises)
    .then((promisesArray) => {
        const user = promisesArray[0]
        res.status(200).send({user})
    })
    .catch((err) => {
        next(err)
    })
}

// delete an existing user request - will require verification on front end

exports.deleteUser = (req, res, next) => {
    const id = req.params.user_id
    deleteUserById(id).then((deletedUser) => {
        res.status(204).send({deletedUser})
    })
    .catch((err) => {
        next(err)
    })
}


