const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors') 
const app = express()
const PORT = 3001
const db = require('./queries')

app.use(cors())
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
app.get('/cohortstudents/:id', db.getStudentByCohortId)
app.get('/students/:id', db.getStudentById)
app.post('/students', db.createStudent)
app.get('/students', db.getStudents)
app.delete('/students/:id', db.deleteStudent)
app.post('/signins', db.studentSignin)
app.post('/signouts', db.studentSignOut)
app.get('/code', db.getCode)
app.get('/signins/:id', db.getStudentSigninsById)
app.delete('/signins/:id', db.deleteSignin)
app.post('/newcode', db.newCode)
app.post('/attendancecheck', db.checkAbsenceWeekendDaysAndHolidays)

app.listen(PORT, () => {
    console.log(`App running on port ${PORT}.`)
})
