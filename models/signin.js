(function() {
    pool.query(
        `CREATE TABLE IS NOT EXISTS signins (
            ID SERIAL PRIMARY KEY,
            student_id INTEGER NOT NULL, 
            date DATE,
            in_status NULL, 
            out_status NULL
        )`
    , (error) => {
        if (error) {
            throw error  
        } console.log(`signins table created.`)
    })
})()
