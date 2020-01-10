require('dotenv').config()

const Pool = require('pg').Pool
const pool = new Pool({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.PORT,
})

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

module.exports = {
    getCohorts,
    getCohortById,
    createCohort,
    deleteCohort,
    createStudent,
    getStudentByCohortId,
    deleteStudent,
    getStudents,
    getStudentById
}
