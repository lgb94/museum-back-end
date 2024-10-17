const express = require('express');
const cors = require('cors');
const app = express()


app.use(cors())
app.use(express.json());

const apiRouter = require(`./routes/api-router`)

app.use('/api', apiRouter)

const {handleCustomErrors, handlePSQLErrors, handleServerErrors} = require(`${__dirname}/controllers/errors-controller`)

app.use(handleCustomErrors);

app.use(handlePSQLErrors);

app.use(handleServerErrors);

module.exports = app;