const students = function() {
    pool.query(
        `CREATE TABLE IS NOT EXISTS students (
            ID SERIAL PRIMARY KEY,
            name VARCHAR(30) NOT NULL, 
            email VARCHAR(100) NOT NULL, 
            cohort_id INTEGER NOT NULL,
            tardies INTEGER 0,
            absences INTEGER 0
        )`
    , (error) => {
        if (error) {
            throw error  
        } console.log(`students table created.`)
    })
}

export default students 
