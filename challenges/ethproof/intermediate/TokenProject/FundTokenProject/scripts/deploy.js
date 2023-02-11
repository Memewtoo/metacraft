const hre = require("hardhat");

async function main() {
  const FundToken = await hre.ethers.getContractFactory("FundToken");

  /** Deploys FundToken contract with 10,000,000 token */
  const fundToken = await FundToken.deploy(10000000);

  await fundToken.deployed();

  console.log("fundToken deployed at adress: ", fundToken.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
