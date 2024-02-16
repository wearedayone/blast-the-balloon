import { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { Web3Provider } from '@ethersproject/providers';

import environments from '../utils/environments';

const { NETWORK_ID } = environments;

const { ethereum } = window;
const provider =
  ethereum.providers?.find((item) => item.isMetaMask) || ethereum.providers[0];

const useWallet = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState(null);

  const checkNetwork = async () => {
    if (!ethereum) return;

    if (provider.chainId !== NETWORK_ID) {
      await window.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NETWORK_ID }],
      });
    }
  };

  const signMessage = async (message = '') => {
    try {
      if (!provider) {
        return;
      }

      const web3Provider = new Web3Provider(provider);
      const signer = web3Provider.getSigner();

      const signature = await signer.signMessage(message);
      return signature;
    } catch (err) {
      console.error(err);
    }
  };

  // console.log(ethereum, ethereum.networkVersion, NETWORK_ID);

  const connectWallet = async () => {
    if (!ethereum) return;

    setLoading(true);

    try {
      const accounts = await provider?.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts.length) throw new Error('No authorized account found');
      const newAddress = accounts[0].toLowerCase();

      setAddress(newAddress);
      await checkNetwork();
    } catch (err) {
      console.error(err);
      if (!err.message.includes('rejected')) {
        enqueueSnackbar(err.message, { variant: 'error' });
      }
    }

    setLoading(false);
  };

  const logout = () => setAddress(null);

  const init = async () => {
    if (!ethereum) {
      setInitialized(true);
      return;
    }

    const accounts = await provider?.request({
      method: 'eth_accounts',
    });
    if (accounts[0]) {
      setAddress(accounts[0].toLowerCase());
    }
    setInitialized(true);

    provider?.on('accountsChanged', onWeb3AccountsChanged);

    provider?.on('chainChanged', (networkId) => {
      console.log({ networkId });
    });

    return () =>
      provider?.removeListener('accountsChanged', onWeb3AccountsChanged);
  };

  const onWeb3AccountsChanged = (accounts) => {
    if (accounts[0]) {
      const newAddress = accounts[0].toLowerCase();
      setAddress(newAddress);
    } else {
      setAddress(null);
    }
  };

  useEffect(() => {
    init();
  }, []);

  return {
    initialized,
    loading,
    address,
    connectWallet,
    logout,
    signMessage,
  };
};

export default useWallet;
