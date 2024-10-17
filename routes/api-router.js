const express = require('express');
const apiRouter = express.Router();
const usersRouter = require('./users-router')
const objectsRouter = require('./objects-router')
const exhibitsRouter = require('./exhibits-router')
const exhibitObjectsRouter = require('./exhibit-objects-router')

// get all endpoints request - endpoints.json

const { getEndpoints } = require(`${__dirname}/../controllers/endpoints-controller`)

apiRouter.get('/', getEndpoints);

// further routing - /api/...

//api routes for users - usernames, passwords, email

apiRouter.use('/users', usersRouter);

//api routes for objects - data acquired through museum apis

apiRouter.use('/objects', objectsRouter);

//api routes for user made exhibits - exhibit id, title, description, SQL calculated object count

apiRouter.use('/exhibits', exhibitsRouter)

//api routes for exhibit objects - objects placed in exhibits by a user

apiRouter.use('/exhibitobjects',exhibitObjectsRouter)


module.exports = apiRouter;