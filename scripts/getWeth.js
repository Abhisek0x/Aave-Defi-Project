const { getNamedAccounts, ethers, network } = require("hardhat")
const { networkConfig } = require("../helper-hardhat-config")

const amount = ethers.utils.parseEther("0.1")

async function getWeth() {
    const { deployer } = await getNamedAccounts()
    //0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
    const iweth = await ethers.getContractAt(
        "IWeth",
        networkConfig[network.config.chainId].wethToken,
        deployer
    )

    const tx = await iweth.deposit({ value: amount })
    await tx.wait(1)
    const wethBalance = await iweth.balanceOf(deployer)
    console.log(`Got ${wethBalance.toString()} wETH`)
}

module.exports = { getWeth, amount }
