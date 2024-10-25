# Museum Project - Back End

API Link: https://museum-project-back-end.onrender.com/api

This is the back end for my museum project - the details of which you can find on the repo for the front end: https://github.com/lgb94/museum-project-frontend

This is the hosted link for the site that uses the database and api built in this repo : https://bespoke-cheesecake-846a37.netlify.app/

The api link at the very top should show you what requests are available.

Databases hosted on elephantSQL (soon to be obsolete): https://www.elephantsql.com/
API hosted through Render: https://render.com/

## INSTALL INSTRUCTIONS:

Not included in the repository are TWO .env files, which will be required in order for any of this backend to run with reference to the correct database. heres what to do:

2. Create two files, one called .env.test, and another called .env.development.
3. within these files, add the line PGDATABASE= , then the name of the PSQL database you will want to refer to.
    - .env.test will want to refer to your test database - a dummy dataset that will be used anytime you want to run your jest testing suite - this database should be called something similar to my_database_test
    - .ev.development will refer to a more complete dataset that will be used when you run your seed file outside of the testing framework - which should give you a more realistic representation of how this backend will run when live. Will probably look like your test database, without the word test - e.g. my_database
4. With that done, NPM install to install all of the projects required dependencies!

# GETTING STARTED

You'll need to seed your database before getting started making queries:

1. run NPM setup-dbs 

This will drop the database tables if you've run this script previously, so if you've ran this before and then played around with the data, running this again will delete your database and recreate them from scratch. 

2. run NPM test

This will run ALL the test files within this repository (utils.test.js and app.test.js) using jest, using the test data in the db/data/test-data folder.

Running tests via jest in this way will use a test database that is dropped and recreated everytime the tests are ran, so you can see the functionality of each individual endpoint and how they run each time, but the data will not persist. 

## IMPORTANT NOTE

To test the database using development data, YOU WILL HAVE TO CREATE A FILE FOR OBJECT DATA WITHIN THE DEVELOPMENT DATA FOLDER - NO DEV DATA FOR THIS FIELD IS INCLUDED IN THIS REPO. This is because I used the object development data to seed my db in the production stage, meaning for objects I used the data collected from the Harvard and Met APIs. Whilst its probably ok, something seems a bit off about re-uploading thousands of entries for mueseum objects to this github repo, so that has been ommited. For your purposes I would suggest making a copy of the test data for objects to use as dev data, or use the data collection functions available in my data collection repo to obtain a set of data for yourself.

Data Collection repo: https://github.com/lgb94/museum-project-data-collection

    - Met API: https://metmuseum.github.io/
    
    - Harvard API: https://github.com/harvardartmuseums/api-docs?tab=readme-ov-file

# REQUIREMENTS

You'll need the latest versions of Node.js and Postgres in order for this thing to run properly, at the time of this projects last update. At present (25/10/2024) these are:

Node.js v22.2.0
Postgres v14.13
