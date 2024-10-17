const fs = require('fs/promises')

exports.fetchEndpoints = () => {
    return fs.readFile(`${__dirname}/../endpoints.json`)
;}