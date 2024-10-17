const { fetchAllExhibitObjects, fetchExhibitObjectWithExhibitObjectId, postNewExhibitObject, patchExhibitObjectPositions, deleteExhibitObjectById } = require(`${__dirname}/../models/exhibit-objects-model`)
const { fetchExhibitByExhibitId } = require(`${__dirname}/../models/exhibits-model`)

// get ALL objects of an exhibit

exports.getExhibitObjects = (req, res, next) => {
    const id = req.params.exhibit_id
    fetchAllExhibitObjects(id).then((objects) => {
        res.status(200).send({objects})
    })
    .catch((err) => {
        next(err)
    })
}

// get single object using exhibit object id

exports.getExhibitObjectWithExhibitObjectId = (req, res, next) => {
    const id = req.params.exhibit_object_id
    fetchExhibitObjectWithExhibitObjectId(id).then((object) => {
        res.status(200).send({object})
    })
    .catch((err) => {
        next(err)
    })
}

// post a new exhibit object - takes exhibit_id and object id on req body. Position calc in model

exports.postExhibitObject = (req, res, next) => {
    const newExhibitObject = req.body
    postNewExhibitObject(newExhibitObject).then((exhibitObject) => {
        res.status(200).send({exhibitObject})
    })
    .catch((err) => {
        next(err)
    })
}

// patch exhibit object positions - takes exhibit_id, req.body composed of ALL EXHIBIT OBJECTS with their UPDATED POSITIONS

exports.patchExhibitObjects = (req, res, next) => {
    const id = req.params.exhibit_id
    const user_id = req.body.user_id
    const positionUpdates = req.body.position_updates
    return fetchExhibitByExhibitId(id)
    .then((exhibit) => {
        if (exhibit.curator_id !== user_id){
            return Promise.reject({
            status: 403,
            msg: "user doesn't have permission to patch this exhibit"
            })
        }
        return patchExhibitObjectPositions(id, positionUpdates);
    })
    .then((updatedExhibitObjects) => {
        res.status(200).send({updatedExhibitObjects})
    })
    .catch((err) => {
        next(err)
    })
}

// delete an exhibit object via its exhibit_object_id

exports.deleteExhibitObject = (req, res, next) => {
    const id = req.params.exhibit_object_id
    deleteExhibitObjectById(id).then((deletedObject) => {
        res.status(204).send({deletedObject})
    })
    .catch((err) => {
        next(err)
    })
}