const express = require('express')
const exhibitObjectsRouter = express.Router()

const { getExhibitObjects, getExhibitObjectWithExhibitObjectId, postExhibitObject, patchExhibitObjects, deleteExhibitObject } = require(`${__dirname}/../controllers/exhibit-objects-controller`)

// get all an exhibits objects (we dont need an endpoint for all exhibit objects but i might still make it)

exhibitObjectsRouter.get('/:exhibit_id', getExhibitObjects)

// get SINGLE EXHIBIT OBJECT with its exhibit_object_ID - returns exhibit obj info + its detailed info attached.

exhibitObjectsRouter.get('/objects/:exhibit_object_id', getExhibitObjectWithExhibitObjectId)

// post - adding an object to an exhibit - needs exhibit_id, takes object_id for reference, calculates position.

exhibitObjectsRouter.post('/', postExhibitObject)

// patch - updating object positions in an exhibit - needs exhibit_id, takes req body of object with ALL positions {id:position}

exhibitObjectsRouter.patch('/:exhibit_id', patchExhibitObjects)

// delete - delete an exhibit object via its id

exhibitObjectsRouter.delete('/:exhibit_object_id', deleteExhibitObject)

module.exports = exhibitObjectsRouter