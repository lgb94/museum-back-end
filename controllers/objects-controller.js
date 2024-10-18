const { fetchAllObjects, fetchObjectById } = require(`${__dirname}/../models/objects-model`)

exports.getObjects = (req, res, next) => {
    const { 
        title, 
        culture, 
        period, 
        medium, 
        classification, 
        museum_dataset, 
        object_begin_date, 
        object_begin_date_operator, 
        object_end_date, 
        object_end_date_operator,
        sortBy,
        sortOrder,
        limit, 
        page 
    } = req.query;

    fetchAllObjects(
        title, 
        culture, 
        period, 
        medium, 
        classification, 
        museum_dataset,
        object_begin_date, 
        object_begin_date_operator, 
        object_end_date, 
        object_end_date_operator,
        sortBy,
        sortOrder,
        limit,
        page
    )
    .then((results) => {
        res.status(200).send({results})
    })
    .catch((err) => {
        next(err)
    })
}

exports.getObjectById = (req, res, next) => {
    const id = req.params.object_id
    fetchObjectById(id)
    .then((object) => {
        res.status(200).send({object})
    })
    .catch((err) => {
        next(err)
    })
}