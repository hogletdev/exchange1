const utils = require('./utils')

utils
    .mainfunc()
    .then(() => {
        console.log('\n fetching data successfully ✓')
        process.exit(0)
    })
    .catch((error) => {
        console.log('\n fetching data failed ✗')
        console.error(error)
        process.exit(1)
    })
