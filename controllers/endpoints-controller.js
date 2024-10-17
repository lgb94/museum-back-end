const {fetchEndpoints} = require(`${__dirname}/../models/endpoints-model`)

exports.getEndpoints = (req, res, next) => {
    return fetchEndpoints()
        .then((endpoints) => {
            const parsedEndpoints = JSON.parse(endpoints)
            res.status(200).send(parsedEndpoints)
        })
        .catch(next)
}