const Web3 = require('web3')

const mainfunc = async () => {
    const config = getConfig()
    const infura = config.infura
    const txLink = config.tx.link
    let splitted = txLink.split('/')
    let txHash = splitted[splitted.length - 1]
    const resp = await myfetch3(config.infura, txHash)
    config.tx.detail = resp
    saveConfig(config)
}

async function myfetch3(url, hash) {
    const web3 = new Web3(new Web3.providers.HttpProvider(url))
    let resp
    console.log('hash : ', hash)
    resp = await web3.eth.getTransaction(hash)

    console.log('myfetch3 : ', JSON.stringify(resp))

    return resp
}

const fs = require('fs')

function getConfig() {
    return JSON.parse(
        fs.readFileSync(`${process.cwd()}/config/config.json`).toString()
    )
}

function saveConfig(contractAddresses) {
    fs.writeFileSync(
        `${process.cwd()}/config/config.json`,
        JSON.stringify(contractAddresses, null, 4) // Indent 4 spaces
    )
}

module.exports = {
    getConfig,
    saveConfig,
    mainfunc,
}
