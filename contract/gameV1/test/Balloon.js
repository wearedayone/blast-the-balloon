const { loadFixture } = require('@nomicfoundation/hardhat-toolbox/network-helpers');
const { anyValue } = require('@nomicfoundation/hardhat-chai-matchers/withArgs');
const { expect } = require('chai');
const { ethers } = require('hardhat');
const bytes32 = ethers.encodeBytes32String('');
describe('Lock', function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployBallonFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const Balloon = await ethers.getContractFactory('Balloon');
    const balloonContract = await Balloon.deploy(owner.address);
    const balloonContractAddress = await balloonContract.getAddress();
    return { balloonContract, owner, otherAccount };
  }

  describe('Deployment', function () {
    it('Deploy contract', async function () {
      const { balloonContract, owner, otherAccount } = await loadFixture(deployBallonFixture);
    });
  });
  describe('Game Process', function () {
    it('Register', async function () {
      const { balloonContract, owner, otherAccount } = await loadFixture(deployBallonFixture);

      // formatBytes32String
      await balloonContract.registerXID(0, bytes32, bytes32);
    });

    it('Buy Pump', async function () {
      const { balloonContract, owner, otherAccount } = await loadFixture(deployBallonFixture);
      await balloonContract.registerXID(0, bytes32, bytes32);

      const basePrice = 1000000000000000n;
      const k = 200000;

      await balloonContract.buyPumpXID(1, 0, 1, {
        from: owner.address,
        value: basePrice,
      });
    });

    it('Sell Pump', async function () {
      const { balloonContract, owner, otherAccount } = await loadFixture(deployBallonFixture);
      // await balloonContract.registerXID(0, '0x', '0x');
    });
  });
});
