const Web3 = require('web3')

const mainfunc = async (infura, txLink) => {
    let splitted = txLink.split('/')
    let txHash = splitted[splitted.length - 1]
    let body = {
        jsonrpc: '2.0',
        method: 'eth_getTransactionByHash',
        params: [txHash],
        id: 1,
    }
    let resp
    resp = await myfetch3(infura, txHash)
    const utils = require('./utils')
    utils.saveConfig(resp)
}

async function myfetch3(url, hash) {
    console.log('myfetch3_001')
    const web3 = new Web3(new Web3.providers.HttpProvider(url))
    let resp
    console.log('myfetch3_002')
    console.log('hash : ', hash)
    resp = await web3.eth.getTransaction(hash)
    console.log('myfetch3_004')
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
