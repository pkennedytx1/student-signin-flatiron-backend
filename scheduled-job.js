const updateAttendanceData = () => {
    console.log('hello')
}

updateAttendanceData()

// pseudo code: 
// This function will run at 11:59 am every night. 
// 1. Detrmine if it is a Holiday, Saturday, or Sunday
// 2. If its not => Need to iterate over every student from the previous day and compile data.
//      a. Go through all the signins: 
//          'SELECT * FROM signins WHERE date = $1'
//      b. Then go through that date and update each students tardy total

