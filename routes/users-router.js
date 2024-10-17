const express = require('express')
const usersRouter = express.Router();

const { getUsers, getUserById, getUserByEmail, getUserByUsername, postUser, patchUser, deleteUser } = require(`${__dirname}/../controllers/users-controller`);

//requests for object containing array of ALL users

usersRouter.get('/', getUsers);

//requests for object containing single users information, based on each key (except password)

usersRouter.get('/:user_id', getUserById )

usersRouter.get('/username/:username', getUserByUsername)

usersRouter.get('/email/:email', getUserByEmail )

// request to ADD a new user to users table, should they not already exist.

usersRouter.post('/', postUser);

// request to PATCH an existing user VIA user_id - changing an existing users information according to given body (if possible).

usersRouter.patch('/:user_id', patchUser);

// request to DELETE an existing user via user_id 

usersRouter.delete('/:user_id', deleteUser);

module.exports = usersRouter