const { ethers, upgrades, network } = require('hardhat')
const { expect } = require('chai')
const { formOrderByTxHash } = require('./order')
const Web3 = require('web3')
const { Wallet, Contract } = require('ethers')

let MockERC721Factory
let WyvernExchangeFactory
let MerkleValidatorFactory
describe('opensea', () => {
    before(async () => {
        signers = await ethers.getSigners()
        this.owner = signers[0]
        const chainId = (await this.owner.getChainId()).toString()
        console.log('chainId: ', chainId)

        const TestToken = await ethers.getContractFactory('TestToken')
        this.testToken = await TestToken.deploy()
        this.testToken = await this.testToken.deployed()

        const WyvernProxyRegistry = await ethers.getContractFactory(
            'WyvernProxyRegistry'
        )
        this.wyvernProxyRegistry = await WyvernProxyRegistry.deploy()
        this.wyvernProxyRegistry.deployed()

        const WyvernTokenTransferProxy = await ethers.getContractFactory(
            'WyvernTokenTransferProxy'
        )
        this.wyvernTokenTransferProxy = await WyvernTokenTransferProxy.deploy(
            this.wyvernProxyRegistry.address
        )
        await this.wyvernTokenTransferProxy.deployed()

        MockERC721Factory = await ethers.getContractFactory('MockERC721')
        this.mockERC721 = await MockERC721Factory.deploy(
            'Mock_name',
            'Mock_symbol'
        )
        this.mockERC721 = await this.mockERC721.deployed()

        console.log('001')

        WyvernExchangeFactory = await ethers.getContractFactory(
            'WyvernExchange'
        )
        console.log(
            this.wyvernProxyRegistry.address,
            this.wyvernTokenTransferProxy.address,
            this.testToken.address,
            this.owner.address
        )
        this.wyvernExchange = await WyvernExchangeFactory.deploy(
            this.wyvernProxyRegistry.address,
            this.wyvernTokenTransferProxy.address,
            this.testToken.address,
            this.owner.address
        )
        this.wyvernExchange = await this.wyvernExchange.deployed()

        console.log(
            'this.wyvernExchange.address = ',
            this.wyvernExchange.address
        )

        MerkleValidatorFactory = await ethers.getContractFactory(
            'MerkleValidator'
        )
        this.merkleValidator = await MerkleValidatorFactory.deploy()
        this.merkleValidator = await this.merkleValidator.deployed()
    })
    beforeEach(async () => {
        const ret = await formOrderByTxHash()
        this.buyOrder = ret.buyOrder
        this.sellOrder = ret.sellOrder
        this.buySig = ret.buySig
        this.sellSig = ret.sellSig
        this.metadata = ret.metadata
        this.rawdata = ret.rawdata
        console.log('this.buyOrder : ', JSON.stringify(this.buyOrder))
        console.log('this.sellOrder : ', JSON.stringify(this.sellOrder))
        let blockNumber = await network.provider.send('eth_blockNumber', []) // number
        console.log('block number : ', blockNumber)
        // let blockNumberHex = ethers.BigNumber.from(blockNumber).toHexString()

        let code = await network.provider.send(
            'eth_getCode',
            [this.wyvernExchange.address, blockNumber]
            // {
            //     jsonrpc: '2.0',
            //     method: 'eth_getCode',
            //     params: [this.wyvernExchange.address, blockNumber],
            //     id: 1,
            // }
        )

        // console.log('exchange code is ', code)
        // mock opensea exchange so as to have the same exchange address in local node
        await network.provider.send('hardhat_setCode', [
            this.buyOrder.exchange,
            code,
        ])
        // set this.wyvernExchange's storage into this.buyOrder.exchange storage with https://hardhat.org/hardhat-network/reference/#hardhat-setstorageat

        {
            console.log('-----------------------------------------------')
            {
                console.log(
                    'this.buyerOrder.exchange.owner : ',
                    await (
                        await WyvernExchangeFactory.attach(
                            this.buyOrder.exchange
                        )
                    ).owner()
                )
                let exchangeS0 = await network.provider.send(
                    'eth_getStorageAt',
                    [this.wyvernExchange.address, '0x0', blockNumber]
                )
                // 0x0000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb9226600
                console.log(
                    'exchange slot 0 storage = ',
                    exchangeS0, // including bool for reentrancyGuard
                    ' should be owner + reentrancyLock = ',
                    this.owner.address + '00'
                )
                newEchangeS0 =
                    '0x' +
                    exchangeS0.substring(2, 24) +
                    this.owner.address.substring(2, 44) +
                    '00'
                console.log('new storage 0 will be ', newEchangeS0)
                await network.provider.send('hardhat_setStorageAt', [
                    this.buyOrder.exchange,
                    '0x0',
                    newEchangeS0,
                ])
                console.log(
                    'this.buyerOrder.exchange.owner : ',
                    await (
                        await WyvernExchangeFactory.attach(
                            this.buyOrder.exchange
                        )
                    ).owner()
                )
            }
            console.log('-----------------------------------------------')
            {
                console.log(
                    'this.buyerOrder.exchange.exchangeToken : ',
                    await (
                        await WyvernExchangeFactory.attach(
                            this.buyOrder.exchange
                        )
                    ).exchangeToken()
                )
                let exchangeS1 = await network.provider.send(
                    'eth_getStorageAt',
                    [this.wyvernExchange.address, '0x1', blockNumber]
                )
                console.log(
                    'exchange slot 1 storage = ',
                    exchangeS1.substring(24, 64),
                    ' should be testToken = ',
                    this.testToken.address
                )
                newEchangeS1 =
                    '0x' +
                    exchangeS1.substring(2, 26) +
                    this.testToken.address.substring(2, 42)
                console.log('new storage 1 will be ', newEchangeS1)
                await network.provider.send('hardhat_setStorageAt', [
                    this.buyOrder.exchange,
                    '0x1',
                    newEchangeS1,
                ])
                console.log(
                    'this.buyerOrder.exchange.exchangeToken : ',
                    await (
                        await WyvernExchangeFactory.attach(
                            this.buyOrder.exchange
                        )
                    ).exchangeToken()
                )
            }
            console.log('-----------------------------------------------')
            {
                console.log(
                    'this.buyerOrder.exchange.registry : ',
                    await (
                        await WyvernExchangeFactory.attach(
                            this.buyOrder.exchange
                        )
                    ).registry()
                )
                let exchangeS2 = await network.provider.send(
                    'eth_getStorageAt',
                    [this.wyvernExchange.address, '0x2', blockNumber]
                )
                console.log(
                    'exchange slot 2 storage = ',
                    exchangeS2.substring(24, 64),
                    ' should be wyvernProxyRegistry = ',
                    this.wyvernProxyRegistry.address
                )
                newEchangeS2 =
                    '0x' +
                    exchangeS2.substring(2, 26) +
                    this.wyvernProxyRegistry.address.substring(2, 42)
                console.log('new storage 2 will be ', newEchangeS2)
                await network.provider.send('hardhat_setStorageAt', [
                    this.buyOrder.exchange,
                    '0x2',
                    newEchangeS2,
                ])
                console.log(
                    'this.buyerOrder.exchange.registry : ',
                    await (
                        await WyvernExchangeFactory.attach(
                            this.buyOrder.exchange
                        )
                    ).registry()
                )
            }
            console.log('-----------------------------------------------')
            {
                console.log(
                    'this.buyerOrder.exchange.tokenTransferProxy : ',
                    await (
                        await WyvernExchangeFactory.attach(
                            this.buyOrder.exchange
                        )
                    ).tokenTransferProxy()
                )
                let exchangeS3 = await network.provider.send(
                    'eth_getStorageAt',
                    [this.wyvernExchange.address, '0x3', blockNumber]
                )
                console.log(
                    'exchange slot 3 storage = ',
                    exchangeS3.substring(24, 64),
                    ' should be wyvernTokenTransferProxy = ',
                    this.wyvernTokenTransferProxy.address
                )
                newEchangeS3 =
                    '0x' +
                    exchangeS3.substring(2, 26) +
                    this.wyvernTokenTransferProxy.address.substring(2, 42)
                console.log('new storage 3 will be ', newEchangeS3)
                await network.provider.send('hardhat_setStorageAt', [
                    this.buyOrder.exchange,
                    '0x3',
                    newEchangeS3,
                ])
                console.log(
                    'this.buyerOrder.exchange.tokenTransferProxy : ',
                    await (
                        await WyvernExchangeFactory.attach(
                            this.buyOrder.exchange
                        )
                    ).tokenTransferProxy()
                )
            }
            console.log('-----------------------------------------------')
            {
                // should be 0x8 slot for protocolFeeRecipient variable, let's verify
                // for (i = 4; i < 10; i++) {
                //     let bn = ethers.BigNumber.from(i).toHexString()
                //     bn = bn.substring(2, bn.length)
                //     if (bn.substring(0, 1) == '0') {
                //         bn = bn.substring(1, bn.length)
                //     }
                //     bn = '0x' + bn
                //     console.log('i -- ', i, ', bn -- ', bn)
                //     let exchangeS4 = await network.provider.send(
                //         'eth_getStorageAt',
                //         [this.wyvernExchange.address, bn, blockNumber]
                //     )
                //     console.log(
                //         'exchange slot ',
                //         i,
                //         ' storage = ',
                //         exchangeS4,
                //         ' should be owner = ',
                //         this.owner.address
                //     )
                // }
                console.log(
                    'this.buyerOrder.exchange.protocolFeeRecipient : ',
                    await (
                        await WyvernExchangeFactory.attach(
                            this.buyOrder.exchange
                        )
                    ).protocolFeeRecipient()
                )
                let exchangeS8 = await network.provider.send(
                    'eth_getStorageAt',
                    [this.wyvernExchange.address, '0x8', blockNumber]
                )
                console.log(
                    'exchange slot 3 storage = ',
                    exchangeS8.substring(24, 64),
                    ' should be owner = ',
                    this.owner.address
                )
                newEchangeS8 =
                    '0x' +
                    exchangeS8.substring(2, 26) +
                    this.owner.address.substring(2, 42)
                console.log('new storage 8 will be ', newEchangeS8)
                await network.provider.send('hardhat_setStorageAt', [
                    this.buyOrder.exchange,
                    '0x8',
                    newEchangeS8,
                ])
                console.log(
                    'this.buyerOrder.exchange.protocolFeeRecipient : ',
                    await (
                        await WyvernExchangeFactory.attach(
                            this.buyOrder.exchange
                        )
                    ).protocolFeeRecipient()
                )
            }
            console.log('-----------------------------------------------')
        }
        // grant authentication to the initial exchange protocol Contract
        await this.wyvernProxyRegistry
            .connect(this.owner)
            .grantInitialAuthentication(this.buyOrder.exchange)

        // set merkleValidator's logic to order.target
        {
            let code = await network.provider.send('eth_getCode', [
                this.merkleValidator.address,
                blockNumber,
            ])

            // console.log('exchange code is ', code)
            // mock opensea exchange so as to have the same exchange address in local node
            await network.provider.send('hardhat_setCode', [
                this.buyOrder.target,
                code,
            ])
        }
        // attach this.buyOrder.exchange to this.wyvernExchange object
        this.wyvernExchange = await WyvernExchangeFactory.attach(
            this.buyOrder.exchange
        )

        // mock maker as the order maker
        let makerAddr =
            this.sellOrder.feeRecipient != ethers.constants.AddressZero
                ? this.sellOrder.maker
                : this.buyOrder.maker
        let takerAddr =
            this.sellOrder.feeRecipient == ethers.constants.AddressZero
                ? this.sellOrder.maker
                : this.buyOrder.maker
        await network.provider.request({
            method: 'hardhat_impersonateAccount',
            params: [makerAddr],
        })
        await network.provider.send('hardhat_setBalance', [
            makerAddr,
            ethers.utils.parseEther('10').toHexString(),
        ])
        await network.provider.request({
            method: 'hardhat_impersonateAccount',
            params: [takerAddr],
        })
        await network.provider.send('hardhat_setBalance', [
            takerAddr,
            ethers.utils.parseEther('10').toHexString(),
        ])
        this.maker = await ethers.getSigner(makerAddr)
        this.taker = await ethers.getSigner(takerAddr)

        // mock nft as if NFT's real address exists in local network
        let nftAddr = '0x' + this.buyOrder.calldata.substring(162, 202)
        console.log('nftAddr : ', nftAddr)
        // 0xcb4307f1c3b5556256748ddf5b86e81258990b3c
        let nftcode = await network.provider.send('eth_getCode', [
            this.mockERC721.address,
            blockNumber,
        ])

        // console.log('nft code is ', nftcode)
        await network.provider.send('hardhat_setCode', [nftAddr, nftcode])
        // TODO: set this.MockERC721's storage into nftAddr storage
        {
            console.log('-----------------------------------------------')
            {
                console.log(
                    'nft.name : ',
                    await (await MockERC721Factory.attach(nftAddr)).name()
                )
                let exchangeS0 = await network.provider.send(
                    'eth_getStorageAt',
                    [this.mockERC721.address, '0x0', blockNumber]
                )
                // 0x4d6f636b5f6e616d650000000000000000000000000000000000000000000012
                const hex = require('string-hex')
                console.log(
                    'exchange slot 1 storage = ',
                    exchangeS0,
                    ' should be "hex(Mock_name)" = ',
                    hex('Mock_name')
                )
                newEchangeS0 = exchangeS0
                console.log('new storage 0 will be ', newEchangeS0)
                await network.provider.send('hardhat_setStorageAt', [
                    nftAddr,
                    '0x0',
                    newEchangeS0,
                ])
                console.log(
                    'nft.name : ',
                    await (await MockERC721Factory.attach(nftAddr)).name()
                )
            }
            console.log('-----------------------------------------------')
        }

        // attach this.buyOrder.exchange to this.wyvernExchange object
        this.mockERC721 = await MockERC721Factory.attach(nftAddr)
        // sell order maker invoke ProxyRegistry.registerProxy() method
        await this.wyvernProxyRegistry.connect(this.maker).registerProxy()
        // buy order maker invoke ProxyRegistry.registerProxy() method
        await this.wyvernProxyRegistry.connect(this.taker).registerProxy()
        this.buyer =
            this.sellOrder.feeRecipient == ethers.constants.AddressZero
                ? this.maker
                : this.taker
        this.seller =
            this.sellOrder.feeRecipient != ethers.constants.AddressZero
                ? this.maker
                : this.taker
        // sell order maker approve his NFTs to the exchange
        // mint NFT
        {
            let tokenIdStr = this.buyOrder.calldata.substring(202, 266) // in hex
            this.tokenId = ethers.BigNumber.from('0x' + tokenIdStr).toString()
            console.log('tokenId : ', this.tokenId) // 1081
            console.log('mockERC721.name : ', await this.mockERC721.name())
            await this.mockERC721
                .connect(this.seller)
                .mint(this.seller.address, this.tokenId)
        }
        // sell order maker approve NFT to this.wyvernProxyRegistry.proxies[this.maker.address]
        // get this.wyvernProxyRegistry.proxies[this.maker.address]
        let proxyOfSeller = await this.wyvernProxyRegistry.proxies(
            this.seller.address
        )
        console.log(
            'this.wyvernProxyRegistry.proxies(seller) : ',
            proxyOfSeller
        )
        // approve all his NFT to his  proxy
        await this.mockERC721
            .connect(this.seller)
            .setApprovalForAll(proxyOfSeller, true)

        // buy order maker approve his ERC20s to the exchange, or no need to approve if it's ether

        // increaseTime to ensure maker's order is valid now
        // ensure taker's order is valid
        let sl = ethers.BigNumber.from(this.sellOrder.listingTime).toNumber()
        let bl = ethers.BigNumber.from(this.buyOrder.listingTime).toNumber()
        let nextBlockTime = sl > bl ? sl + 10 : bl + 10
        console.log('nextBlockTime : ', nextBlockTime)
        await network.provider.send('evm_setNextBlockTimestamp', [
            nextBlockTime,
        ])
        await network.provider.send('evm_mine')
        {
            const blockNumBefore = await ethers.provider.getBlockNumber()
            const blockBefore = await ethers.provider.getBlock(blockNumBefore)
            const timestampBefore = blockBefore.timestamp
            console.log('timestampBefore : ', timestampBefore)
        }
    })
    it('replay', async () => {
        console.log('starting replay.....')
        console.log(
            this.buyOrder.calldata,
            this.buyOrder.replacementPattern,
            this.sellOrder.calldata,
            this.sellOrder.replacementPattern
        )
        // check orderCalldataCanMatch
        let ret = await this.wyvernExchange.orderCalldataCanMatch(
            this.buyOrder.calldata,
            this.buyOrder.replacementPattern,
            this.sellOrder.calldata,
            this.sellOrder.replacementPattern
        )
        console.log('orderCalldataCanMatch : ', ret)
        console.log(
            'this.wyvernExchange.protocolFeeRecipient : ',
            await this.wyvernExchange.protocolFeeRecipient()
        )
        await network.provider.send('evm_mine')
        console.log('this.rawdata is ', this.rawdata)
        // check ordersCanMatch_
        let ifOrdersCanMatch_ = await this.wyvernExchange.ordersCanMatch_(
            this.rawdata.addrs,
            this.rawdata.uints,
            this.rawdata.feeMethodsSidesKindsHowToCalls,
            this.rawdata.calldataBuy,
            this.rawdata.calldataSell,
            this.rawdata.replacementPatternBuy,
            this.rawdata.replacementPatternSell,
            '0x00',
            '0x00'
        )
        console.log('ifOrdersCanMatch_ : ', ifOrdersCanMatch_)

        await this.wyvernExchange.connect(this.taker).atomicMatch_(
            this.rawdata.addrs,
            this.rawdata.uints,
            this.rawdata.feeMethodsSidesKindsHowToCalls,
            this.rawdata.calldataBuy,
            this.rawdata.calldataSell,
            this.rawdata.replacementPatternBuy,
            this.rawdata.replacementPatternSell,
            // this.rawdata.staticExtradataBuy,
            '0x',
            // this.rawdata.staticExtradataSell,
            '0x',
            this.rawdata.vs,
            this.rawdata.rssMetadata,
            { value: ethers.utils.parseEther('1') }
        )
    })
})
