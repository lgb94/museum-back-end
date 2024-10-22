const db = require(`${__dirname}/../db/connection`);

exports.fetchAllObjects = (
    title, culture, period, medium, classification, museum_dataset,
    object_begin_date, object_begin_date_operator, object_end_date, object_end_date_operator,
    sortBy, sortOrder, limit, page
) => {
    // first we handle potential queries, then add sorting, then pagination

    let sqlString = 'SELECT * FROM objects';
    let countSqlString = 'SELECT COUNT(*) FROM objects';
    let queryConditions = [];
    let queryValues = [];

    if (title) {
        queryConditions.push('title ILIKE $' + (queryValues.length + 1));
        queryValues.push(title);
    }
    if (culture) {
        queryConditions.push('culture ILIKE $' + (queryValues.length + 1));
        queryValues.push(culture);
    }
    if (period) {
        queryConditions.push('period ILIKE $' + (queryValues.length + 1));
        queryValues.push(period);
    }
    if (medium) {
        queryConditions.push('medium ILIKE $' + (queryValues.length + 1));
        queryValues.push(medium);
    }
    if (classification) {
        queryConditions.push('classification ILIKE $' + (queryValues.length + 1));
        queryValues.push(classification);
    }
    if (museum_dataset) {
        queryConditions.push('museum_dataset = $' + (queryValues.length + 1));
        queryValues.push(museum_dataset);
    }
    if (object_begin_date) {
        const operator = object_begin_date_operator || '=';
        queryConditions.push(`object_begin_date ${operator} $${queryValues.length + 1}`);
        queryValues.push(object_begin_date);
    }
    if (object_end_date) {
        const operator = object_end_date_operator || '=';
        queryConditions.push(`object_end_date ${operator} $${queryValues.length + 1}`);
        queryValues.push(object_end_date);
    }

    if (queryConditions.length > 0) {
        const whereStatements = ' WHERE ' + queryConditions.join(' AND ');
        sqlString += whereStatements;
        countSqlString += whereStatements;
    }

    //sorting - we should ensure nothing invalid gets sent through, and add default (object_id ASC - will be classed as 'none' in FE)

    if (sortBy) {
        const sortFields = ['title', 'culture', 'period', 'medium', 'classification', 'museum_dataset', 'object_begin_date', 'object_end_date'];
        if (sortFields.includes(sortBy)) {
            let sortDirection = 'ASC';
            if (sortOrder === 'desc') {
                sortDirection = 'DESC';
            }
            sqlString += ` ORDER BY ${sortBy} ${sortDirection}`;
        }
    } else {
        sqlString += ` ORDER BY object_id ASC`;
    }

    // pagination - in production i think default limit will be 50 (for over 1500 objects), for now 10 (test data has 10 objects)

    limit = (1*limit) || 10;  
    page = (1*page) || 1;
    const offset = (page - 1) * limit;

    sqlString += ` LIMIT $${queryValues.length + 1} OFFSET $${queryValues.length + 2}`;
    queryValues.push(limit, offset);

    // Now we get the total object count WITHOUT pagination so front-end can display pages properly (amounts and that)

    return db.query(countSqlString, queryValues.slice(0, queryValues.length - 2))
        .then((countResult) => {

            const totalRecords = parseInt(countResult.rows[0].count, 10);
            const totalPages = Math.ceil(totalRecords / limit);
            return db.query(sqlString, queryValues)
                .then((result) => {
                    return {
                        objects: result.rows,
                        totalRecords,
                        totalPages,
                        currentPage: page,
                        limit
                    };
                });
        });
};

exports.fetchObjectById = (id) => {
        return db.query('SELECT * FROM objects WHERE object_id = $1', [id])
        .then((result) => {
            if (result.rows.length === 0){
                return Promise.reject({
                    status : 404,
                    msg : "bad request - object_id not recognised"
                })
            }
            else {return result.rows[0]}
        })
    }
