// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const fs = require('fs');
const { ethers, run } = require('hardhat');

async function main() {
  const _defaultAdmin = '0x890611302Ee344d5bD94DA9811C18e2De5588077';
  const Balloon = await ethers.getContractFactory('Balloon');
  const BalloonContract = await Balloon.deploy(_defaultAdmin);
  const BalloonContractAddress = await BalloonContract.getAddress();
  console.log(`Game contract is deployed to ${BalloonContractAddress}`);

  const contracts = [
    {
      address: BalloonContractAddress,
      args: [_defaultAdmin],
    },
  ];

  for (const contract of contracts) {
    try {
      await run('verify:verify', {
        address: contract.address,
        constructorArguments: contract.args,
      });
    } catch (err) {
      console.error(err.message);
    }
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
