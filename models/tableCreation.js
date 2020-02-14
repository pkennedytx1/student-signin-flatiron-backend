const Pool = require('pg').Pool
const pool = new Pool({
    user: process.env.USER,
    host: process.env.HOST,
    database: 'signin_api',
    password: process.env.PASSWORD,
    port: process.env.PORT,
})

const cohorts = function() {
    pool.query(
        `CREATE TABLE IF NOT EXISTS cohorts (
            ID SERIAL PRIMARY KEY,
            name VARCHAR(30)
        )`
    , (error) => {
        if (error) {
            throw error  
        } console.log(`cohorts table created.`)
    })
}

const code = function() {
    pool.query(
        `CREATE TABLE IF NOT EXISTS codes (
            ID SERIAL PRIMARY KEY,
            code VARCHAR(30)
        )`
    , (error) => {
        if (error) {
            throw error  
        } console.log(`code table created.`)
    })
}

const students = function() {
    pool.query(
        `CREATE TABLE IF NOT EXISTS students (
            ID SERIAL PRIMARY KEY,
            name VARCHAR(30) NOT NULL, 
            email VARCHAR(100) NOT NULL, 
            cohort_id INTEGER NOT NULL,
            tardies INTEGER,
            absences INTEGER
        )`
    , (error) => {
        if (error) {
            throw error  
        } console.log(`students table created.`)
    })
}

const signins = function() {
    pool.query(
        `CREATE TABLE IF NOT EXISTS signins (
            ID SERIAL PRIMARY KEY,
            student_id INTEGER NOT NULL, 
            date DATE,
            in_status VARCHAR(30), 
            out_status VARCHAR(30)
        )`
    , (error) => {
        if (error) {
            throw error  
        } console.log(`signins table created.`)
    })
}

code()
cohorts()
students()
signins()
