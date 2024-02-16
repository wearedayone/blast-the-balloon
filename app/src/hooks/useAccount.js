import { useState, useEffect, useCallback } from 'react';
import {
  signInWithCustomToken,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import { Web3Provider } from '@ethersproject/providers';
import { useSnackbar } from 'notistack';

import { auth } from '../configs/firebase.config';
import { getAuthToken } from '@/services/auth.service';

const { ethereum } = window || {};

const signMessage = async (message) => {
  try {
    if (!ethereum) {
      return;
    }

    const provider = new Web3Provider(ethereum);
    const signer = provider.getSigner();

    const signature = await signer.signMessage(message);
    return signature;
  } catch (err) {
    console.error(err);
  }
};

const MISMATCH_ACCOUNT_ERROR =
  'Please change to the wallet address that match your account to do transaction';

const useAccount = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [account, setAccount] = useState(null);
  const [user, setUser] = useState(null);
  const [isInitializedAuth, setInitializedAuth] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setInitializedAuth(true);
    });

    return unsubscribe;
  }, []);

  const signInWithFirebase = async () => {
    setIsAuthenticating(true);
    try {
      const message = `Welcome to Blast the Balloon!\n\nThis request will not trigger a blockchain transaction or cost any gas fees.`;
      const signature = await signMessage(message);

      const {
        data: { token },
      } = await getAuthToken({
        message,
        signature,
      });

      await signInWithCustomToken(auth, token);
    } catch (error) {
      console.error(error);
    }
    setIsAuthenticating(false);
  };

  const connectMetamaskWallet = async (path) => {
    if (!ethereum) return;

    setIsAuthenticating(true);

    try {
      let metamaskProvider = ethereum;
      // edge case if MetaMask and CoinBase are both installed
      if (ethereum.providers?.length)
        metamaskProvider = ethereum.providers.find((p) => p.isMetaMask);
      const accounts = await metamaskProvider.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts.length) throw new Error('No authorized account found');
      const newAccount = accounts[0].toLowerCase();

      if (!user) {
        await signInWithFirebase({ currentAccount: newAccount });
      } else {
        if (newAccount !== user.uid) {
          throw new Error(MISMATCH_ACCOUNT_ERROR);
        }
      }
      setAccount(accounts[0].toLowerCase());
    } catch (err) {
      console.error(err);
      if (err.message === MISMATCH_ACCOUNT_ERROR) {
        throw new Error(MISMATCH_ACCOUNT_ERROR);
      }

      if (!err.message.includes('rejected')) {
        enqueueSnackbar(err.message, { variant: 'error' });
      }
    }

    setIsAuthenticating(false);
  };

  const logout = async () => {
    setAccount(null);
    signOut(auth);
  };

  const init = useCallback(async () => {
    if (!ethereum) return;

    ethereum.on('accountsChanged', onWeb3AccountsChanged);

    ethereum.on('chainChanged', (networkId) => {
      console.log({ networkId });
    });

    return () =>
      ethereum.removeListener('accountsChanged', onWeb3AccountsChanged);
  }, []);

  const onWeb3AccountsChanged = async (accounts) => {
    if (accounts[0]) {
      const newAccount = accounts[0].toLowerCase();
      setAccount(newAccount);
    } else {
      setAccount(null);
    }
  };

  useEffect(() => {
    if (isInitializedAuth) init();
  }, [isInitializedAuth, init]);

  return {
    isInitializedAuth,
    isAuthenticating,
    isUserDoneTriggerAuth,
    account,
    user,
    connectMetamaskWallet,
    signInWithFirebase,
    logout,
  };
};

export default useAccount;
