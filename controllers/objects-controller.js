const { fetchAllObjects } = require(`${__dirname}/../models/objects-model`)

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