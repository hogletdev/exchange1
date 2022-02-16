require('@nomiclabs/hardhat-waffle')
module.exports = {
    networks: {
        hardhat: {
            mining: {
                auto: true,
            },
            allowUnlimitedContractSize: true,
            initialDate: '2011-10-10T14:48:00.000+09:00',
        },
    },

    mocha: {
        timeout: 200000,
    },
    solidity: {
        compilers: [
            {
                version: '0.4.23',
            },
            {
                version: '0.4.24',
            },
            {
                version: '0.8.11',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
}
