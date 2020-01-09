const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const PORT = 3001
const db = require('./queries')

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)

app.get('/', (request, response) => {
    response.json({ info: 'API for attendance app for Flatiron School Austin' })
})
app.get('/cohorts', db.getCohorts)
app.get('/cohorts/:id', db.getCohortById)
app.post('/cohorts', db.createCohort)
app.delete('/cohorts/:id', db.deleteCohort)

app.listen(PORT, () => {
    console.log(`App running on port ${PORT}.`)
})
