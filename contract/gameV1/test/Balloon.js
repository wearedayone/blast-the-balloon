const { ethers } = require('hardhat');
const { loadFixture } = require('@nomicfoundation/hardhat-toolbox/network-helpers');
const { anyValue } = require('@nomicfoundation/hardhat-chai-matchers/withArgs');
const { PANIC_CODES } = require('@nomicfoundation/hardhat-chai-matchers/panic');
const { expect } = require('chai');
require('chai').use(require('chai-as-promised')).should();
const bytes32 = ethers.encodeBytes32String('');

const getPrice = ({ amount, current }) => {
  const BASE_18 = 1000000000000000000n;
  const basePrice = 1000000000000000n;
  const k = 200000n;
  let price = 0n;

  for (let i = 0n; i < amount; i++) {
    price += basePrice + ((current + i) * (current + i) * BASE_18) / k;
  }

  console.log({ amount, current, price });
  return price;
};
const validateRoundData = async ({
  balloonContract,
  rID_,
  strT,
  endT,
  maxET,
  pumpB,
  pumpS,
  opFee,
  eJackpot,
  prizePool,
  llPID,
  holReward,
  accHolPerPump,
}) => {
  const roundData = await balloonContract.round_(rID_);
  console.log({ roundData });
  if (strT) expect(roundData[0]).to.be.equal(strT);
  if (endT) expect(roundData[1]).to.be.equal(endT);
  if (maxET) expect(roundData[2]).to.be.equal(maxET);
  if (pumpB) expect(roundData[3]).to.be.equal(pumpB);
  if (pumpS) expect(roundData[4]).to.be.equal(pumpS);
  if (opFee) expect(roundData[5]).to.be.equal(opFee);
  if (eJackpot) expect(roundData[6]).to.be.equal(eJackpot);
  if (prizePool) expect(roundData[7]).to.be.equal(prizePool);
  if (llPID) expect(roundData[8]).to.be.equal(llPID);
  if (holReward) expect(roundData[9]).to.be.equal(holReward);
  if (accHolPerPump) expect(roundData[10]).to.be.equal(accHolPerPump);
};

const validatePlayerData = async ({
  balloonContract,
  pID,
  addr,
  name,
  laff,
  refReward,
  holReward,
  winReward,
  withdrawed,
  refC,
  lRID,
}) => {
  const playerData = await balloonContract.plyr_(pID);
  console.log({ playerData });
  if (addr) expect(playerData[0]).to.be.equal(addr);
  if (name) expect(playerData[1]).to.be.equal(name);
  if (laff) expect(playerData[2]).to.be.equal(laff);
  if (refReward) expect(playerData[3]).to.be.equal(refReward);
  if (holReward) expect(playerData[4]).to.be.equal(holReward);
  if (winReward) expect(playerData[5]).to.be.equal(winReward);
  if (withdrawed) expect(playerData[6]).to.be.equal(withdrawed);
  if (refC) expect(playerData[7]).to.be.equal(refC);
  if (lRID) expect(playerData[8]).to.be.equal(lRID);
};

describe('Lock', function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployBallonFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, acc1, acc2, acc3, others] = await ethers.getSigners();

    const Balloon = await ethers.getContractFactory('Balloon');
    const balloonContract = await Balloon.deploy(owner.address);
    const balloonContractAddress = await balloonContract.getAddress();
    return { balloonContract, owner, acc1, acc2, acc3, others };
  }

  describe('Deployment', function () {
    it('Deploy contract', async function () {
      const { balloonContract, owner, acc1, acc2, acc3, others } = await loadFixture(deployBallonFixture);
    });
  });
  describe('Game Process', function () {
    it('Register', async function () {
      const { balloonContract, owner, acc1, acc2, acc3, others } = await loadFixture(deployBallonFixture);

      // formatBytes32String
      await balloonContract.registerXID(0, ethers.encodeBytes32String('brian'), ethers.encodeBytes32String('0001'));

      // Test after first user register

      // validate:
      // register same address
      await balloonContract
        .registerXID(0, ethers.encodeBytes32String('brian1'), ethers.encodeBytes32String('0002'))
        .should.be.revertedWith('User registered');

      // register invalid affCode
      await balloonContract
        .connect(acc1)
        .registerXID(2, ethers.encodeBytes32String('brian1'), ethers.encodeBytes32String('0002'))
        .should.be.revertedWith('Invalid affID');
      // register same name
      await balloonContract
        .connect(acc1)
        .registerXID(0, ethers.encodeBytes32String('brian'), ethers.encodeBytes32String('0002'))
        .should.be.revertedWith('Name registered');

      // register same refCode
      await balloonContract
        .connect(acc1)
        .registerXID(0, ethers.encodeBytes32String('brian1'), ethers.encodeBytes32String('0001'))
        .should.be.revertedWith('RefCode registered');

      // registered success:
      await balloonContract
        .connect(acc1)
        .registerXID(0, ethers.encodeBytes32String('brian1'), ethers.encodeBytes32String('0002'));

      // Test after 2nd user register:
    });

    it('Buy Pump', async function () {
      const { balloonContract, owner, acc1, acc2, acc3, others } = await loadFixture(deployBallonFixture);
      await balloonContract.registerXID(0, bytes32, bytes32);
      await balloonContract
        .connect(acc1)
        .registerXID(0, ethers.encodeBytes32String('brian1'), ethers.encodeBytes32String('0002'));
      const basePrice = 1000000000000000n;
      const k = 200000n;

      await balloonContract.buyPumpXID(1, 0, 1, {
        from: owner.address,
        value: basePrice,
      });

      await balloonContract
        .buyPumpXID(2, 0, 1, {
          from: owner.address,
          value: basePrice + (1000000000000000000n * (1n * 1n)) / k,
        })
        .should.be.revertedWith('Invalid PID');
    });

    it('Sell Pump', async function () {
      const { balloonContract, owner, acc1, acc2, acc3, others } = await loadFixture(deployBallonFixture);
      // await balloonContract.registerXID(0, '0x', '0x');
    });

    it('Full Flow', async function () {
      const { balloonContract, owner, acc1, acc2, acc3, others } = await loadFixture(deployBallonFixture);
      await balloonContract.registerXID(0, ethers.encodeBytes32String('brian'), ethers.encodeBytes32String('0000'));

      await balloonContract
        .connect(acc1)
        .registerXID(1, ethers.encodeBytes32String('brian1'), ethers.encodeBytes32String('0001'));

      await balloonContract
        .connect(acc2)
        .registerXID(2, ethers.encodeBytes32String('brian2'), ethers.encodeBytes32String('0002'));
      await balloonContract
        .connect(acc3)
        .registerXID(3, ethers.encodeBytes32String('brian3'), ethers.encodeBytes32String('0003'));

      // Start buyPump
      let price = getPrice({ amount: 1n, current: 0n });
      await balloonContract.buyPumpXID(1, 0, 1, {
        from: owner.address,
        value: price,
      });
      let balance = await ethers.provider.getBalance(await balloonContract.getAddress());
      expect(balance).to.be.equal(1000000000000000n);
      price = getPrice({ amount: 1n, current: 1n });

      await balloonContract.buyPumpXID(1, 0, 1, {
        from: owner.address,
        value: price,
      });
      balance = await ethers.provider.getBalance(await balloonContract.getAddress());
      let refRewardUser1 = await balloonContract.getUserReferralReward(1);
      console.log({ balance, refRewardUser1 });

      price = getPrice({ amount: 1n, current: 2n });

      await balloonContract.connect(acc1).buyPumpXID(2, 0, 1, {
        from: acc1.address,
        value: price,
      });

      balance = await ethers.provider.getBalance(await balloonContract.getAddress());
      refRewardUser1 = await balloonContract.getUserReferralReward(1);
      console.log({ balance, refRewardUser1 });
      const timeGap = 2 * 24 * 60 * 60;

      await ethers.provider.send('evm_increaseTime', [timeGap]);
      await ethers.provider.send('evm_mine');
      price = getPrice({ amount: 1n, current: 0n });
      await balloonContract.buyPumpXID(1, 0, 1, {
        from: owner.address,
        value: price,
      });
      price = getPrice({ amount: 10n, current: 1n });

      await balloonContract.buyPumpXID(1, 0, 10, {
        from: owner.address,
        value: price,
      });
      balance = await ethers.provider.getBalance(await balloonContract.getAddress());
      refRewardUser1 = await balloonContract.getUserReferralReward(1);
      console.log({ balance, refRewardUser1 });

      price = getPrice({ amount: 5n, current: 11n });
      let estimatePrice = await balloonContract.connect(acc1).estimatePrice(5n);
      // expect(price).to.be.equal(estimatePrice);
      await balloonContract.connect(acc1).buyPumpXID(2, 0, 5, {
        from: acc1.address,
        value: estimatePrice,
      });
      await validateRoundData({ balloonContract, rID_: 2, pumpB: 1 });
      await validatePlayerData({
        balloonContract,
        pID: 1,
        addr: owner.address,
        name: ethers.encodeBytes32String('brian'),
        laff: 0,
      });
      await validatePlayerData({
        balloonContract,
        pID: 2,
        addr: acc1.address,
        name: ethers.encodeBytes32String('brian1'),
        laff: 1,
      });
    });
  });
});
