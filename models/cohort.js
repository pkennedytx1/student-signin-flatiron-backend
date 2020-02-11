(function() {
    pool.query(
        `CREATE TABLE IS NOT EXISTS cohorts (
            ID SERIAL PRIMARY KEY,
            name VARCHAR(30)
        )`
    , (error) => {
        if (error) {
            throw error  
        } console.log(`cohorts table created.`)
    })
})()