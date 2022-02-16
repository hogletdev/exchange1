const Web3 = require('web3')
const utils = require('../scripts/utils')
const abiDecoder = require('abi-decoder')
const abijson = require('../artifacts/contracts/WyvernExchange.sol/WyvernExchange.json')
class Sig {
    v
    r
    s
    constructor(v, r, s) {
        this.v = v
        this.r = r
        this.s = s
    }
}

class Order {
    exchange
    maker
    taker
    makerRelayerFee
    takerRelayerFee
    makerProtocolFee
    takerProtocolFee
    feeRecipient
    feeMethod
    side
    saleKind
    target
    howToCall
    calldata
    replacementPattern
    staticTarget
    staticExtradata
    paymentToken
    basePrice
    extra
    listingTime
    expirationTime
    salt
    constructor(
        exchange,
        maker,
        taker,
        makerRelayerFee,
        takerRelayerFee,
        makerProtocolFee,
        takerProtocolFee,
        feeRecipient,
        feeMethod,
        side,
        saleKind,
        target,
        howToCall,
        calldata,
        replacementPattern,
        staticTarget,
        staticExtradata,
        paymentToken,
        basePrice,
        extra,
        listingTime,
        expirationTime,
        salt
    ) {
        this.exchange = exchange
        this.maker = maker
        this.taker = taker
        this.makerRelayerFee = makerRelayerFee
        this.takerRelayerFee = takerRelayerFee
        this.makerProtocolFee = makerProtocolFee
        this.takerProtocolFee = takerProtocolFee
        this.feeRecipient = feeRecipient
        this.feeMethod = feeMethod
        this.side = side
        this.saleKind = saleKind
        this.target = target
        this.howToCall = howToCall
        this.calldata = calldata
        this.replacementPattern = replacementPattern
        this.staticTarget = staticTarget
        this.staticExtradata = staticExtradata
        this.paymentToken = paymentToken
        this.basePrice = basePrice
        this.extra = extra
        this.listingTime = listingTime
        this.expirationTime = expirationTime
        this.salt = salt
    }
}
class AtomicMatchParams {
    buyOrder
    sellOrder
    buySig
    sellSig
    metadata
    rawdata
    constructor(bo, so, bs, ss, md, rd) {
        this.buyOrder = bo
        this.sellOrder = so
        this.buySig = bs
        this.sellSig = ss
        this.metadata = md
        this.rawdata = rd
    }
}

async function formOrderByTxHash() {
    // if (txHashLink == '') {
    //   txHashLink = 'https://etherscan.io/tx/0x59d629dc85c2d07d32e8e545f29e69cf40a02b27e9f47bf275fe9c10737afb79'
    // }

    // return 1

    // await save(txHash)
    // resp = await get()

    const config = utils.getConfig()

    abiDecoder.addABI(abijson.abi)

    const decodeData = abiDecoder.decodeMethod(config.tx.detail.input)

    // console.log('decodeData : ', decodeData)
    console.log('json : ', JSON.stringify(decodeData))
    const params = decodeData['params']
    const addrs = params[0]['value']
    const uints = params[1]['value']
    const feeMethodsSidesKindsHowToCalls = params[2]['value']
    const calldataBuy = params[3]['value']
    const calldataSell = params[4]['value']
    const replacementPatternBuy = params[5]['value']
    const replacementPatternSell = params[6]['value']
    const staticExtradataBuy = params[7]['value']
    const staticExtradataSell = params[8]['value']
    const vs = params[9]['value']
    const rssMetadata = params[10]['value']

    let buyOrder = new Order(
        addrs[0],
        addrs[1],
        addrs[2],
        uints[0],
        uints[1],
        uints[2],
        uints[3],
        addrs[3],
        feeMethodsSidesKindsHowToCalls[0],
        feeMethodsSidesKindsHowToCalls[1],
        feeMethodsSidesKindsHowToCalls[2],
        addrs[4],
        feeMethodsSidesKindsHowToCalls[3],
        calldataBuy,
        replacementPatternBuy,
        addrs[5],
        staticExtradataBuy,
        addrs[6],
        uints[4],
        uints[5],
        uints[6],
        uints[7],
        uints[8]
    )
    let sellOrder = new Order(
        addrs[7],
        addrs[8],
        addrs[9],
        uints[9],
        uints[10],
        uints[11],
        uints[12],
        addrs[10],
        feeMethodsSidesKindsHowToCalls[4],
        feeMethodsSidesKindsHowToCalls[5],
        feeMethodsSidesKindsHowToCalls[6],
        addrs[11],
        feeMethodsSidesKindsHowToCalls[7],
        calldataSell,
        replacementPatternSell,
        addrs[12],
        staticExtradataSell,
        addrs[13],
        uints[13],
        uints[14],
        uints[15],
        uints[16],
        uints[17]
    )
    let buySig = new Sig(vs[0], rssMetadata[0], rssMetadata[1])
    let sellSig = new Sig(vs[1], rssMetadata[2], rssMetadata[3])

    // console.log('buyOrder : ', JSON.stringify(buyOrder))
    let rawdata = {
        addrs: addrs,
        uints: uints,
        feeMethodsSidesKindsHowToCalls: feeMethodsSidesKindsHowToCalls,
        calldataBuy: calldataBuy,
        calldataSell: calldataSell,
        replacementPatternBuy: replacementPatternBuy,
        replacementPatternSell: replacementPatternSell,
        staticExtradataBuy: staticExtradataBuy,
        staticExtradataSell: staticExtradataSell,
        vs: vs,
        rssMetadata: rssMetadata,
    }
    const atomicMatchParams = new AtomicMatchParams(
        buyOrder,
        sellOrder,
        buySig,
        sellSig,
        rssMetadata[4],
        rawdata
    )

    return atomicMatchParams
}

module.exports = {
    Sig,
    Order,
    AtomicMatchParams,
    formOrderByTxHash,
}
