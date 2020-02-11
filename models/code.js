(function() {
    pool.query(
        `CREATE TABLE IS NOT EXISTS codes (
            ID SERIAL PRIMARY KEY,
            code VARCHAR(30)
        )`
    , (error) => {
        if (error) {
            throw error  
        } console.log(`code table created.`)
    })
})()