const express = require('express')
const objectsRouter = express.Router();

const { getObjects, getObjectById } = require(`${__dirname}/../controllers/objects-controller`)

objectsRouter.get('/', getObjects)

objectsRouter.get('/:object_id', getObjectById)

module.exports = objectsRouter