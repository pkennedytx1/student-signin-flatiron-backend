require('dotenv').config()
const randomWords = require('random-words')
const nodemailer = require('nodemailer')
let moment = require('moment')

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS
    }
})

let mailOptions = {
    from: process.env.EMAIL,
    to: '',
    subject: 'Notice of Abscent - Flatiron School',
    text: 'By reading this email you acknowledge that you have recieved and absence at Flatiron School. If you have any questions please conect your SEM. \n Thanks and have a good day! \n Flatiron Austin Staff'
}

// transporter.sendMail(mailOptions, function(error, info){
//     if (error) {
//         console.log(error)
//     } else {
//         console.log('Email sent!')
//     }
// })

const Pool = require('pg').Pool
const pool = new Pool({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.PORT,
})

let setCode

(function() {
    pool.query('SELECT code FROM codes WHERE id = 1', (error, results) => {
        setCode = results.rows[0].code
    })
})()

const newCode = (request, response) => {
    let newCode = randomWords()
    pool.query('UPDATE codes SET code = $1 WHERE id = 1', [newCode], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(newCode)
    })
    pool.query('SELECT code FROM codes WHERE id = 1', (error, results) => {
        setCode = results.rows[0].code
    })
    
}


const getCode = (request, response) => {
    response.status(201).send(setCode)
}

const getCohorts = (request, response) => {
    pool.query('SELECT * FROM cohorts ORDER BY id ASC', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getCohortById = (request, response) => {
    const id = parseInt(request.params.id)

    pool.query('SELECT * FROM cohorts WHERE id = $1', [id], (error, results) => {
        if (error) {
        throw error
        }
        response.status(200).json(results.rows)
    })
}

const createCohort = (request, response) => {
    const { name } = request.body

    pool.query('INSERT INTO cohorts (name) VALUES ($1)', [name], (error, results) => {
        if (error) {
            throw error
        }
        response.status(201).send(`Cohort added with ID: ${results.insertId}`)
    })
}

const deleteCohort = (request, response) => {
    const id = parseInt(request.params.id)

    pool.query('DELETE FROM cohorts WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(`Cohort deleted with ID: ${id}`)
    })
}

const deleteSignin = (request, response) => {
    const id = parseInt(request.params.id)

    pool.query('DELETE FROM signins WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(`Signin deleted with ID: ${id}`)
    })
}

const getStudentById = (request, response) => {
    const id = parseInt(request.params.id)

    pool.query('SELECT * FROM students WHERE id = $1', [id], (error, results) => {
        if (error) {
        throw error
        }
        response.status(200).json(results.rows)
    })
}

const getStudents = (request, response) => {
    pool.query('SELECT * FROM students ORDER BY id ASC', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const deleteStudent = (request, response) => {
    const id = parseInt(request.params.id)

    pool.query('DELETE FROM students WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(`Student deleted with ID: ${id}`)
    })
}

const createStudent = (request, response) => {
    const { name, email, cohort_id, tardies, absences } = request.body

    pool.query('INSERT INTO students (name, email, cohort_id, tardies, absences) VALUES ($1, $2, $3, $4, $5)', [name, email, cohort_id, tardies, absences], (error, results) => {
        if (error) {
            throw error
        }
        response.status(201).send(`Student added with ID: ${results.insertId}`)
    })
}

const getStudentByCohortId = (request, response) => {
    const id = parseInt(request.params.id)

    pool.query('SELECT * FROM students WHERE cohort_id = $1', [id], (error, results) => {
        if (error) {
        throw error
        }
        response.status(200).json(results.rows)
    })
}

const studentSignin = (request, response) => {
    const { code, student_id, date, in_status, out_status } = request.body

    pool.query('SELECT * FROM signins WHERE student_id = $1 AND date = $2', [student_id, date], (error, results) => {
        if (results.rows.length === 0) {
            if (code === setCode) {
                pool.query('INSERT INTO signins (student_id, date, in_status, out_status) VALUES ($1, $2, $3, $4)', [student_id, date, in_status, out_status], (error, results) => {
                    if (error) {
                        throw error
                    }
                    response.status(200).json(results.rows)
                })
            
                if (in_status === 'late') {
                    handleTardy(student_id, response)
                } 
            } else {
                response.status(200).send('Invalid Code.')
            }
        } else {
            response.status(200).send('You already signed in.')
        }
    })
}

const getStudentSigninsById = (request, response) => {
    const id = parseInt(request.params.id)

    pool.query('SELECT * FROM signins WHERE student_id = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const studentSignOut = (request, response) => {
    const { code, student_id, date, out_status} = request.body

    if ( code === setCode) {
        pool.query('UPDATE signins SET out_status = $1 WHERE student_id = $2 AND date = $3', [out_status, student_id, date], (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows)
        })

        if (out_status === 'early_leave') {
            handleTardy(student_id, response)
        }
    } else {
        response.status(200).send('Invalid Code.')
    }
}

let handleTardy = (student_id) => {
    pool.query('UPDATE students SET tardies = tardies + 1 WHERE id = $1', [student_id], (error) => {
        if (error) {
            throw error
        } 
    })
}

// need a function that will handle multiple things on signin. 

// 1. Check the last signin date
// 2. determine the number of days between that date
// 3. Out of those days determine if the date happened on a Sat or Sun
// 4. Calculate number of days - okay days = absent.
// 5. handle current signin

let lastSigninDate
const checkAbsenceWeekendDaysAndHolidays = (request, response) => {
    const { student_id, date } = request.body
    let todaysDate = date
    findLastSigninDate(student_id)
    response.status(200).send(`The last signin date was determined`)
}

let findLastSigninDate = (student_id, date) => {
    pool.query('SELECT date FROM signins WHERE student_id = $1 ORDER BY date DESC LIMIT 1', [student_id], (error, results) => {
        if (error) {
            throw error
        }
        if (results.rows[0] !== undefined) {
            lastSigninDate = results.rows[0].date
            calculateDays(student_id, date, lastSigninDate)
        }
    })
}

let calculateDays = (student_id, date, lastSigninDate) => {
    console.log(moment(date).format('X'), moment(lastSigninDate, 'MM/DD/YYYY').format('X'))
    console.log(student_id)
}

module.exports = {
    getCode,
    newCode,
    getCohorts,
    getCohortById,
    createCohort,
    deleteCohort,
    createStudent,
    getStudentByCohortId,
    deleteStudent,
    getStudents,
    getStudentById,
    studentSignin,
    studentSignOut,
    getStudentSigninsById,
    deleteSignin,
    checkAbsenceWeekendDaysAndHolidays
}
