const format = require('pg-format')
const db = require('../connection')
const bcrypt = require('bcrypt')

const seed = ({userData, objectData, exhibitData, exhibitObjectData}) => {
    return db
        .query(`DROP TABLE IF EXISTS exhibit_objects`)
        .then(() => {
            return db.query('DROP TABLE IF EXISTS exhibits');
        })
        .then(() => {
            return db.query('DROP TABLE IF EXISTS users');
        })
        .then(() => {
            return db.query('DROP TABLE IF EXISTS objects');
        })
        .then(() => {
            const usersTablePromise = db.query(`
            CREATE TABLE users (
                user_id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(254) UNIQUE NOT NULL,
                password VARCHAR NOT NULL
            );`);

            const objectsTablePromise = db.query(`
                CREATE TABLE objects (
                object_id SERIAL PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    culture VARCHAR(100),
                    period VARCHAR(100),
                    object_begin_date INT,
                    object_end_date INT,
                    medium VARCHAR(350),
                    classification VARCHAR(100),
                    primary_image VARCHAR(255),
                    object_url VARCHAR(255) NOT NULL,
                    museum_dataset VARCHAR(100) NOT NULL
                )`);

            return Promise.all([usersTablePromise, objectsTablePromise])
        })
        
        .then(() => {
            return db.query(`
                CREATE TABLE exhibits (
                exhibit_id SERIAL PRIMARY KEY,
                title VARCHAR (255) NOT NULL DEFAULT 'My Exhibit',
                description VARCHAR (500) NOT NULL DEFAULT 'No description given.',
                curator_id INT REFERENCES users(user_id) NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            );`)
        })
        .then(() => {
            return db.query(`
                CREATE TABLE exhibit_objects (
                exhibit_object_id SERIAL PRIMARY KEY,
                exhibit_id INT REFERENCES exhibits(exhibit_id) ON DELETE CASCADE,
                object_id INT REFERENCES objects(object_id) ON DELETE CASCADE,
                object_position INT NOT NULL,
                UNIQUE (exhibit_id, object_id)
                );`);
        })
        .then(() => {
            const hashPromises = userData.map(({username, email, password}) => {
                return bcrypt.hash(password, 10).then(hashedPassword => {
                    return [username, email, hashedPassword];
                });
            });
            return Promise.all(hashPromises)
        })        
        .then((hashedUserData) => {
            const insertUsersQueryString = format(
                'INSERT INTO users ( username, email, password) VALUES %L;',
                hashedUserData
            );
            const usersPromise = db.query(insertUsersQueryString);

            const insertObjectsQueryString = format(
                'INSERT INTO objects (title, culture, period, object_begin_date, object_end_date, medium, classification, primary_image, object_url, museum_dataset) VALUES %L;',
                objectData.map(
                    ({
                        title,
                        culture,
                        period,
                        objectBeginDate,
                        objectEndDate,
                        medium,
                        classification,
                        primaryImage,
                        objectURL,
                        museumDataset,
                    }) => [title, culture, period, objectBeginDate, objectEndDate, medium, classification, primaryImage, objectURL, museumDataset]
                )
            );
            const objectsPromise = db.query(insertObjectsQueryString);
            return Promise.all([usersPromise, objectsPromise])
        })
        .then(() => {
            const insertExhibitQueryString = format(
                'INSERT INTO exhibits (title, description, curator_id) VALUES %L;',
                exhibitData.map(
                    ({ 
                        title,
                        description, 
                        curator_id 
                    }) => [title, description, curator_id])
            );
            return db.query(insertExhibitQueryString);
        })
        .then(() => {
            const insertExhibitObjectQueryString = format(
                'INSERT INTO exhibit_objects (exhibit_id, object_id, object_position) VALUES %L;',
                exhibitObjectData.map(
                    ({ 
                        exhibit_id, 
                        object_id, 
                        object_position }) => [exhibit_id, object_id, object_position ])
            );
            return db.query(insertExhibitObjectQueryString);
        });
        
};

module.exports = seed;