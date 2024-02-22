import { useState } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { formatBytes32String } from '@ethersproject/strings';
import { useSnackbar } from 'notistack';

import environments from '../utils/environments';
import Game from '../assets/abis/Game.json';

const { GAME_ADDRESS } = environments;

const useSmartContract = ({ provider, checkNetwork, user }) => {
  const { enqueueSnackbar } = useSnackbar();

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
    await checkNetwork();
    const gameContract = getGameContract();

    let inviterId = 0;
    if (user?.inviteCode) {
      inviterId = await gameContract.pIDxRefC_(formatBytes32String(user.inviteCode));
    }

    const userId = await gameContract.pIDxAddr_(user?.address);
    await gameContract.buyPumpXID(Number(userId.toString()), inviterId, amount);
  };

  const sell = async ({ amount }) => {
    await checkNetwork();
    const gameContract = getGameContract();
    await gameContract.sell(amount);
  };

  return { createReferralCode, buy, sell };
};

export default useSmartContract;
