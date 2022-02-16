const utils = require('./utils')

let config = utils.getConfig()

utils
    .mainfunc(config.infura, config.tx.link)
    .then(() => {
        console.log('\n fetching data successfully ✓')
        process.exit(0)
    })
    .catch((error) => {
        console.log('\n fetching data failed ✗')
        console.error(error)
        process.exit(1)
    })
