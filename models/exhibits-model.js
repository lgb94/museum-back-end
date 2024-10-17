const db = require(`${__dirname}/../db/connection`)

// get ALL exhibits request - results returned with object counts & curator username, sorted by exhibit_id.

exports.fetchAllExhibits = () => {
    return db.query(`
        SELECT exhibits.*,
        users.username AS curator_username, 
        COUNT(exhibit_objects.object_id)::INTEGER AS object_count
        FROM exhibits
        LEFT JOIN users ON exhibits.curator_id = users.user_id
        LEFT JOIN exhibit_objects ON exhibits.exhibit_id = exhibit_objects.exhibit_id
        GROUP BY exhibits.exhibit_id, users.username
        ORDER BY exhibits.exhibit_id ASC;
        `)
    .then((result) => {
        return result.rows
    })
}

// get single exhibit by exhibit_id - results returned with object coun & curator username - single result = no need to sort

exports.fetchExhibitByExhibitId = (id) => {
    return db.query(`
        SELECT exhibits.*,
        users.username AS curator_username, 
        COUNT(exhibit_objects.object_id)::INTEGER AS object_count
        FROM exhibits
        LEFT JOIN users ON exhibits.curator_id = users.user_id
        LEFT JOIN exhibit_objects ON exhibits.exhibit_id = exhibit_objects.exhibit_id
        WHERE exhibits.exhibit_id = $1
        GROUP BY exhibits.exhibit_id, users.username;
    `, [id])
    .then((result) => {
        if(result.rows.length === 0){
            return Promise.reject({
                status : 404,
                msg : "bad request - exhibit_id not recognised"
            })
        }
        else {return result.rows[0]}
    })
}

// get all exhibits by single user with given user_id, results returned with object count, curator username and sorted by ex ID ASC

exports.fetchExhibitsByUserId = (id) => {
    return db.query(`
        SELECT exhibits.*,
        users.username AS curator_username, 
        COUNT(exhibit_objects.object_id)::INTEGER AS object_count
        FROM exhibits
        LEFT JOIN users ON exhibits.curator_id = users.user_id
        LEFT JOIN exhibit_objects ON exhibits.exhibit_id = exhibit_objects.exhibit_id
        WHERE exhibits.curator_id = $1
        GROUP BY exhibits.exhibit_id, users.username
        ORDER BY exhibits.exhibit_id ASC;
    `, [id])
    .then((result) => {
        if(result.rows.length === 0){
            return Promise.reject({
                status : 404,
                msg : "bad request - no exhibits matching user_id"
            })
        }
        else {return result.rows}
    })
}

// post a new exhibit - needs a request body with all three fields - SQL has defaults but this wont work without values for those fields??? returns with object count 0 since its new.

exports.postNewExhibit = (newExhibit) => {
    const { title, description, user_id } = newExhibit
    return db.query(`
        INSERT INTO exhibits (title, description, curator_id) 
        VALUES ($1, $2, $3) 
        RETURNING *, 0::INTEGER AS object_count;
    `, [ title, description, user_id])
    .then((result) => {
        return result.rows[0]
    })
}

// patch an exisiting exhibit - can take updates to title and description in same request, or by themselves. Doesn't need to worry about invalid exhibit id since check has already been carried out by controller during user_id matching. returns updated object WITHOUT object_count or curator username (this was complicated enough)

exports.patchExhibitWithExhibitId = (id, patchObject) => {
    const validKeys = ['new_title', 'new_description']
    const updates = Object.keys(patchObject).filter(key => validKeys.includes(key))
    if (updates.length === 0){
        return Promise.reject({
                status : 400,
                msg : 'no valid fields to update'
             })
    }
    
    const queryUpdateFields = [];
    const queryValues = [];
    let queryIndex = 1;     

    updates.forEach((key) => {
        if (key === 'new_title') {
            queryUpdateFields.push(`title = $${queryIndex}`);
            queryValues.push(patchObject.new_title);
            queryIndex++;
            }
        if (key === 'new_description') {
            queryUpdateFields.push(`description = $${queryIndex}`);
            queryValues.push(patchObject.new_description);
            queryIndex++;
            }
        });
    
    queryValues.push(id);
    
    const queryStr = `
            UPDATE exhibits
            SET ${queryUpdateFields.join(', ')}
            WHERE exhibit_id = $${queryIndex}
            RETURNING *;
        `;
    
    return db.query(queryStr, queryValues)
        .then((result) => {
                return result.rows[0];
            });
    };

// delete exhibit by ID

exports.deleteExhibitById = (id) => {
    return db.query('DELETE FROM exhibits WHERE exhibit_id = $1 RETURNING *;', [id])
    .then((result) => {
        if (result.rows.length === 0){
            return Promise.reject({
                status : 404,
                msg : "bad request - exhibit_id not recognised"
            })
        }
        else return result.rows[0]
    })
}

