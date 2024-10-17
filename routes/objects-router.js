const express = require('express')
const objectsRouter = express.Router();

const { getObjects } = require(`${__dirname}/../controllers/objects-controller`)

objectsRouter.get('/', getObjects)

module.exports = objectsRouter