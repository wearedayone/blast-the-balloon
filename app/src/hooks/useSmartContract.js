import { Web3Provider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { formatBytes32String } from '@ethersproject/strings';
import { parseEther } from '@ethersproject/units';

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

    await gameContract.registerXID(
      Number(inviterId.toString()),
      formatBytes32String(username),
      formatBytes32String(referralCode)
    );

    // TODO: implement backend listener to update user code in firestore
  };

  const buy = async ({ amount }) => {
    if (!season) return;
    const { pumpBought, pumpSold, pumpPrice } = season;
    const total = calculateNextPumpBuyPriceBatch(pumpPrice.basePrice, pumpPrice.k, pumpBought - pumpSold, amount);

    await checkNetwork();
    const gameContract = getGameContract();

    let inviterId = 0;
    if (user?.inviteCode) {
      inviterId = await gameContract.pIDxRefC_(formatBytes32String(user.inviteCode));
    }

    const userId = await gameContract.pIDxAddr_(user?.address);
    console.log({
      userId: Number(userId.toString()),
      inviterId,
      amount,
      value: parseEther(`${total}`),
    });
    const tx = await gameContract.buyPumpXID(Number(userId.toString()), inviterId, amount, {
      value: parseEther(`${total}`),
    });
    const receipt = await tx.wait();

    console.log({ receipt });
    if (receipt.status !== 1) throw new Error('Something wrong');

    // TODO: implement backend listener to update gamePlay in firestore
  };

  const sell = async ({ amount }) => {
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

  return { createReferralCode, buy, sell, withdraw };
};

export default useSmartContract;
