const { fetchAllExhibits, fetchExhibitByExhibitId, fetchExhibitsByUserId, postNewExhibit, patchExhibitWithExhibitId, deleteExhibitById } = require(`${__dirname}/../models/exhibits-model`)
const { fetchUserById } = require(`${__dirname}/../models/users-model`)

//get ALL exhibits

exports.getExhibits = (req, res, next) => {
    fetchAllExhibits().then((exhibits) => {
        res.status(200).send({exhibits})
    })
    .catch((err) => {
        next(err)
    })
}

//get single exhibit by exhibit_id

exports.getExhibitByExhibitId = (req, res, next) => {
    const id = req.params.exhibit_id
    fetchExhibitByExhibitId(id)
    .then((exhibit) => {
        res.status(200).send({exhibit})
    })
    .catch((err) => {
        next(err)
    })
}

// get all exhibits by SINGLE USER via user_id

exports.getExhibitsByUserId = (req, res, next) => {
    const id = req.params.user_id
    fetchUserById(id)
    .then((user) => {
        return fetchExhibitsByUserId(id)
    })
    .then((exhibits) => {
        res.status(200).send({exhibits})
    })
    .catch((err) => {
        next(err)
    })
}

// post a new exhibit

exports.postExhibit = (req, res, next) => {
    const newExhibit = req.body
    postNewExhibit(newExhibit).then((exhibit) => {
        res.status(200).send({exhibit})
    })
    .catch((err) => {
        next(err)
    })
}

// patch an existing exhibit

exports.patchExhibit = (req, res, next) => {
    const id = req.params.exhibit_id
    const user_id = req.body.user_id
    const patchObject = req.body
    return fetchExhibitByExhibitId(id)
    .then((exhibit) => {
        if (exhibit.curator_id !== user_id){
            return Promise.reject({
                status: 403,
                msg : "user doesn't have permission to patch this exhibit"
            })
        }
        return patchExhibitWithExhibitId(id, patchObject);
        })
        .then((updatedExhibit) => {
            res.status(200).send({updatedExhibit})
        })
        .catch((err) => {
            next(err)
        })
    }

// delete an exhibit

exports.deleteExhibit = (req, res, next) => {
    const id = req.params.exhibit_id
    deleteExhibitById(id).then((deletedExhibition) => {
        res.status(204).send({deletedExhibition})
    })
    .catch((err) => {
        next(err)
    })
}
