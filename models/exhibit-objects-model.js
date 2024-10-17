const db = require(`${__dirname}/../db/connection`)

// get all objects of a given exhibit_id - returns objects ordered by object_position in exhibition

exports.fetchAllExhibitObjects = (id) => {
    return db.query(`SELECT * FROM exhibits WHERE exhibit_id = $1;`,[id])
    .then((result) => {
        if (result.rows.length === 0){
            return Promise.reject({
                status: 404,
                msg : "bad request - exhibit_id not recognised"
            })
        }
    return db.query(`
        SELECT exhibit_objects.object_position, objects.*
        FROM exhibit_objects
        JOIN objects ON exhibit_objects.object_id = objects.object_id
        WHERE exhibit_objects.exhibit_id = $1
        ORDER BY exhibit_objects.object_position ASC;
        `, [id])
        .then((result) => {
            if (result.rows.length === 0){
                return [];
            }
            else return result.rows
        })
    })
}

// get SINGLE exhibition object with exhibition object ID - join on deatiled info from objects table.

exports.fetchExhibitObjectWithExhibitObjectId = (id) => {
    return db.query(`
        SELECT exhibit_objects.*, objects.*
        FROM exhibit_objects
        JOIN objects ON exhibit_objects.object_id = objects.object_id
        WHERE exhibit_objects.exhibit_object_id = $1;
    `, [id])
    .then((result) => {
        if (result.rows.length === 0) {
            return Promise.reject({
                status: 404,
                msg: "bad request - object not found"
            });
        }
        return result.rows[0];  
    });
};

//post new exhibit object - takes exhibit_id and object_id from req body, calculates next available position.

exports.postNewExhibitObject = (newExhibitObject) => {
    const { exhibit_id, object_id } = newExhibitObject
    return db.query(`
        WITH max_position AS (
            SELECT COALESCE(MAX(object_position), 0) AS max_pos
            FROM exhibit_objects
            WHERE exhibit_id = $1
        )
        INSERT INTO exhibit_objects (exhibit_id, object_id, object_position)
        VALUES ($1, $2, (SELECT max_pos + 1 FROM max_position))
        RETURNING *;
    `, [exhibit_id, object_id])
    .then((result) => {
        return result.rows[0];
    });
};

// patch exhibit object positions - takes object with positions for ALL OBJECTS - Check position_updates matches amount of exhibition objects (handle discrepancy), iterate through and construct SQL query to update, send back updated objects sorted by new positions. 

exports.patchExhibitObjectPositions = (exhibitId, positionUpdates) => {
    const exhibitObjectIds = Object.keys(positionUpdates);
    
    // First check the length of the update object compared to objects in exhibit - reject if wrong.

    return db.query(`
        SELECT *
        FROM exhibit_objects
        WHERE exhibit_id = $1;
    `, [exhibitId])
    .then((result) => {
        if (result.rows.length !== exhibitObjectIds.length) {
            return Promise.reject({
                status: 400,
                msg: "too many/not enough position updates",
            });
        }

        // Now work through the update object to create SQL statement - this should update each object as required according to given object ({object id: new postion}) (in the then block so this is all done sequentially)

        const setStatements = exhibitObjectIds.map(id => {

            return `WHEN exhibit_object_id = ${id} THEN ${positionUpdates[id]}`;
        }).join(' ');

        const idsList = exhibitObjectIds.join(', ');
        
        const updateQuery = `
            UPDATE exhibit_objects
            SET object_position = CASE ${setStatements} END
            WHERE exhibit_object_id IN (${idsList})
            RETURNING *;
        `;
        return db.query(updateQuery)

        // now query the db for the newly updated object list WITH sorting - the previous sql query annoyingly cant seem to do this and i need to move on (ORDER BY object_position ASC;)

        .then(() => {
            return db.query(`
                SELECT *
                FROM exhibit_objects
                WHERE exhibit_id = $1
                ORDER BY object_position ASC;
                `, [exhibitId])
        })
        .then((result) => {
            return result.rows
        })
    });
};

// delete an exhibit object

exports.deleteExhibitObjectById = (id) => {
    return db.query('DELETE FROM exhibit_objects WHERE exhibit_object_id = $1 RETURNING *;', [id])
    .then((result) => {
        if (result.rows.length === 0){
            return Promise.reject({
                status : 404,
                msg : "bad request - exhibit_object_id not recognised"
            })
        }
        else return result.rows[0]
    })
}

