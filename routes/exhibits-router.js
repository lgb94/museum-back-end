const express = require('express')
const exhibitsRouter = express.Router();

const { getExhibits, getExhibitByExhibitId, getExhibitsByUserId, postExhibit, patchExhibit, deleteExhibit } = require(`${__dirname}/../controllers/exhibits-controller`)

// get ALL exhibits 

exhibitsRouter.get('/', getExhibits)

// get exhibit by exhibits_Id - single exhibit request

exhibitsRouter.get('/:exhibit_id', getExhibitByExhibitId )

// get all exhibits of a single user - using their user_id

exhibitsRouter.get('/user/:user_id', getExhibitsByUserId)

// post a new exhibit 

exhibitsRouter.post('/', postExhibit)

// patch an existing exhibit - requires exhibit_id (verified with user_id), changes title / description / both

exhibitsRouter.patch('/:exhibit_id', patchExhibit)

// delete an exhibit via exhibit_id 

exhibitsRouter.delete('/:exhibit_id', deleteExhibit)

module.exports = exhibitsRouter