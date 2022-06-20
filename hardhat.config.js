require("dotenv").config()
require("@nomiclabs/hardhat-etherscan")
require("@nomiclabs/hardhat-ethers")
require("@nomiclabs/hardhat-waffle")
require("hardhat-gas-reporter")
require("hardhat-deploy")
require("solidity-coverage")

module.exports = {
    solidity: {
        compilers: [
            {
                version: "0.8.8"
            },
            {
                version: "0.6.12"
            },
            {
                version: "0.4.19"
            }
        ]
    },
    networks: {
        hardhat: {
            chainId: 31337,
            forking: {
                url: process.env.MAINNET_RPC_URL
            }
        },
        rinkeby: {
            url: process.env.RINKEBY_URL,
            accounts: [process.env.PRIVATE_KEY],
            chainId: 4,
            blockConfirmation: 6
        },
        kovan: {
            url: process.env.KOVAN_URL,
            accounts: [process.env.PRIVATE_KEY],
            chainId: 42,
            blockConfirmations: 6
        }
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "INR",
        coinmarketcap: process.env.COINMARKETCAP_API_KEY,
        token: "ETH"
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY
    },
    namedAccounts: {
        deployer: {
            default: 0, // here this will by default take the first account as deployer
            1: 0 // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
        }
    },
    mocha: {
        timeout: 2000000
    }
}
