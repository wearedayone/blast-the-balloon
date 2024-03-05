import { Web3Provider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { formatBytes32String } from '@ethersproject/strings';
import { formatEther, parseEther } from '@ethersproject/units';

import environments from '../utils/environments';
import { calculateNextPumpBuyPriceBatch } from '../utils/formulas';
import Game from '../assets/abis/Game.json';

const { GAME_ADDRESS } = environments;

const useSmartContract = ({ provider, checkNetwork, user, season }) => {
  const getSigner = () => {
    if (!provider) return null;

    const web3Provider = new Web3Provider(provider);
    const signer = web3Provider.getSigner();
    return signer;
  };

  const getGameContract = () => {
    const signer = getSigner();
    if (!signer) return null;

    return new Contract(GAME_ADDRESS, Game.abi, signer);
  };

  const createReferralCode = async ({ username, referralCode }) => {
    await checkNetwork();
    const gameContract = getGameContract();
    let inviterId = 0;
    if (user?.inviteCode) {
      inviterId = await gameContract.pIDxRefC_(formatBytes32String(user.inviteCode));
    }
    console.log('registerXID', { inviterId, username, referralCode });
    await gameContract.registerXID(
      Number(inviterId.toString()),
      formatBytes32String(username),
      formatBytes32String(referralCode)
    );

    // TODO: implement backend listener to update user code in firestore
  };

  const buy = async ({ amount }) => {
    console.log('buy', { amount, user });
    if (!season) return;
    const { pumpBought, pumpSold, pumpPrice } = season;

    await checkNetwork();
    const gameContract = getGameContract();
    const basePrice = await gameContract.bPrice_();
    const k = await gameContract.k_();
    console.log({ k, basePrice });

    const total = calculateNextPumpBuyPriceBatch(pumpPrice.basePrice, pumpPrice.k, pumpBought - pumpSold, amount);
    const ethValue = await gameContract.estimatePrice(amount);
    let inviterId = 0;
    if (user?.inviteCode) {
      inviterId = await gameContract.pIDxRefC_(formatBytes32String(user.inviteCode));
    }

    const pID = await gameContract.pIDxAddr_(user?.id);
    console.log({
      userId: Number(pID.toString()),
      inviterId,
      amount,
      value: ethValue,
    });
    const tx = await gameContract.buyPumpXID(Number(pID.toString()), inviterId, amount, {
      // value: parseEther(`${total}`),
      value: ethValue,
    });
    const receipt = await tx.wait();

    console.log({ receipt });
    if (receipt.status !== 1) throw new Error('Something wrong');

    // TODO: implement backend listener to update gamePlay in firestore
  };

  const getUserReferralReward = async (address) => {
    await checkNetwork();
    const gameContract = getGameContract();
    const pID = await gameContract.pIDxAddr_(address);
    const reward = await gameContract.getUserReferralReward(Number(pID.toString()));
    console.log('referral reward', formatEther(reward));
    return Number(formatEther(reward))
  };

  const getUserHolderReward = async (address) => {
    await checkNetwork();
    const gameContract = getGameContract();
    const pID = await gameContract.pIDxAddr_(address);
    const reward = await gameContract.getUserHolderReward(pID);
    console.log('holder reward', formatEther(reward));
    return Number(formatEther(reward))
  };

  const getUserLockedValue = async (address) => {
    await checkNetwork();
    const gameContract = getGameContract();
    const pID = await gameContract.pIDxAddr_(address);
    const reward = await gameContract.getUserPendingReward(pID);
    console.log('locked value', formatEther(reward));
    return Number(formatEther(reward))
  };

  const sell = async ({ amount }) => {
    console.log('Sell', { amount });
    await checkNetwork();
    const gameContract = getGameContract();
    await gameContract.sell(amount);

    // TODO: implement backend listener to update gamePlay in firestore
  };

  const withdraw = async () => {
    await checkNetwork();
    const gameContract = getGameContract();
    await gameContract.withdraw();

    // TODO: implement backend listener to update gamePlay in firestore
  };

  const getRoundTimeInSecs = async () => {
    await checkNetwork();
    const gameContract = getGameContract();
    const res = await gameContract.dRTime_();

    return Number(res.toString());
  };

  return {
    createReferralCode,
    buy,
    sell,
    withdraw,
    getRoundTimeInSecs,
    getUserReferralReward,
    getUserHolderReward,
    getUserLockedValue,
  };
};

export default useSmartContract;
