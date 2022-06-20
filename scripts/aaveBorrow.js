const { getNamedAccounts, ethers } = require("hardhat")
const { getWeth, amount } = require("../scripts/getWeth")
const { BigNumber } = require("@ethersproject/bignumber")
const { networkConfig } = require("../helper-hardhat-config")

async function main() {
    const wethTokenAddress = networkConfig[network.config.chainId].wethToken
    await getWeth()
    const { deployer } = await getNamedAccounts()

    const lendingPool = await getLendingpool(deployer)
    console.log(`Lending Pool Address: ${lendingPool.address}`)

    await approveErc20(wethTokenAddress, lendingPool.address, amount, deployer)
    console.log("Depositing")
    await lendingPool.deposit(wethTokenAddress, amount, deployer, 0)
    console.log("Deposited")

    //Borrow Function Starts here
    let { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(lendingPool, deployer)
    const daiPrice = await getDaiPrice()
    const amountDAItoBorrow = availableBorrowsETH.toString() * 0.95 * (1 / daiPrice.toNumber())
    console.log(`You can borrow ${amountDAItoBorrow} DAI for the deposited ETH`)
    const amountToBorrowWei = ethers.utils.parseEther(amountDAItoBorrow.toString())

    const daiTokenAddress = "0x6b175474e89094c44da98b954eedeac495271d0f"
    console.log("Borrowing......")
    console.log("____________________________________________________")
    await borrowDAI(daiTokenAddress, lendingPool, amountToBorrowWei, deployer)
    await getBorrowUserData(lendingPool, deployer)

    console.log("Repaying")
    console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
    await repay(amountToBorrowWei, daiTokenAddress, lendingPool, deployer)
    await getBorrowUserData(lendingPool, deployer)
}

async function repay(amount, daiAddress, lendingPool, account) {
    await approveErc20(daiAddress, lendingPool.address, amount, account)
    const repayTx = await lendingPool.repay(daiAddress, amount, 1, account)
    await repayTx.wait(1)
    console.log("Repayed")
}

async function borrowDAI(daiAddress, lendingPool, amountToBorrowWei, account) {
    const borrowTx = await lendingPool.borrow(daiAddress, amountToBorrowWei, 1, 0, account)
    await borrowTx.wait(1)
    console.log("You have borrowed DAI")
}

async function getDaiPrice() {
    const daiETHPriceFeed = await ethers.getContractAt(
        "AggregatorV3Interface",
        "0x773616E4d11A78F511299002da57A0a94577F1f4"
    )
    const price = (await daiETHPriceFeed.latestRoundData())[1]
    console.log(`Price of ETH to DAI: ${price.toString()}`)
    return price
}

async function getBorrowUserData(lendingPool, account) {
    const {
        totalCollateralETH,
        totalDebtETH,
        availableBorrowsETH
    } = await lendingPool.getUserAccountData(account)
    console.log(`You have ${totalCollateralETH} worth of ETH deposited`)
    console.log(`You have ${totalDebtETH} worth of ETH Borrowed`)
    console.log(`You have total ${availableBorrowsETH} worth of ETH you can borrow`)
    return { availableBorrowsETH, totalDebtETH }
}

async function getLendingpool(account) {
    const lendingPoolAddressProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
        networkConfig[network.config.chainId].lendingPoolAddressesProvider,
        account
    )
    const lendingPoolAddress = await lendingPoolAddressProvider.getLendingPool()
    const lendingPool = await ethers.getContractAt("ILendingPool", lendingPoolAddress, account)
    return lendingPool
}

async function approveErc20(erc20Address, spenderAddress, amountToSpend, account) {
    const erc20Token = await ethers.getContractAt("IERC20", erc20Address, account)
    const tx = await erc20Token.approve(spenderAddress, amountToSpend)
    await tx.wait(1)
    console.log("approved")
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.log(error)
        process.exit(1)
    })
