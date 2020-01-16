require('dotenv').config()
const randomWords = require('random-words')

let setCode

let now = new Date()
let millisTill12 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0) - now
if (millisTill12 < 0) {
     millisTill12 += 43200000
}
setTimeout(function(){
    setCode = randomWords()
}, millisTill12)

console.log(setCode)

const Pool = require('pg').Pool
const pool = new Pool({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.PORT,
})

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
    }
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
    }
}

let handleTardy = (student_id) => {
    pool.query('UPDATE students SET tardies = tardies + 1 WHERE id = $1', [student_id], (error) => {
        if (error) {
            throw error
        } 
    })
}

module.exports = {
    getCode,
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
    studentSignOut
}
