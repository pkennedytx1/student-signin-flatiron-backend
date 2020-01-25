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

    pool.query('INSERT INTO students (name, email, cohort_id, tardies, absences) VALUES ($1, $2, $3, $4, $5) RETURNING id', [name, email, cohort_id, tardies, absences], (error, results) => {
        if (error) {
            throw error
        }

        // need to get insertId working
        response.status(201).send(`Student added with ID: ${results.rows[0].id}`)
        generateSignins(results.rows[0].id, cohort_id)
    })
    // trigger the creation of 75 entries based upon the start date.
    // need to skip Saturday, Sunday, and Holidays
}

let generateSignins = (id, cohort_id) => {
    // get cohort start date
    let cohort
    pool.query('SELECT name FROM cohorts WHERE id = $1', [cohort_id], (error, results) => {
        if (error) {
            throw error
        }
        cohort = results.rows[0].name
        console.log(cohort)
        generateCohortDateArray(id, cohort)
    })
    // generate an array using a for loop with all the dates for the cohort
    // skip using day() number 6 and 0 for sat and sun
    // for loop using this date array to generate pre defined entries to be updated 
}

let generateCohortDateArray = (id, cohort) => {
    let startDate = moment(cohort).format('MM/DD/YYYY')
    let cohortDateArray = []
    for (i = 0; i < 105; i++) {
        if (moment(startDate).add(i, 'days').day() === 6 || moment(startDate).add(i, 'days').day() === 0) {
        } else {
            cohortDateArray.push(moment(startDate).add(i, 'days').format('MM/DD/YYYY'))

        }
    }
    console.log(cohortDateArray)
    console.log(cohortDateArray.length)
    console.log(id)
    for (i = 0; i < cohortDateArray.length; i++) {
        pool.query('INSERT INTO signins (student_id, date, in_status, out_status) VALUES ($1, $2, NULL, NULL)', [id, cohortDateArray[i]])
    }

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
    } else {
        response.status(200).send('Invalid Code.')
    }
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
    deleteSignin
}
