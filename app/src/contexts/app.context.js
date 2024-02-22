import { createContext } from 'react';

import useWallet from '../hooks/useWallet';
import useSmartContract from '../hooks/useSmartContract';
import useSeason from '../hooks/useSeason';
import useUserData from '../hooks/useUserData';
import useLeaderboard from '../hooks/useLeaderboard';

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const walletState = useWallet();
  const seasonState = useSeason();
  const userState = useUserData({
    uid: walletState.address,
    seasonId: seasonState.season?.id,
    createUserRecord: walletState.createUserRecord,
  });
  const leaderboardState = useLeaderboard({
    uid: walletState.address,
    seasonId: seasonState.season?.id,
    gameEndConfig: seasonState.season?.gameEndConfig,
    prizePool: seasonState.season?.prizePool,
  });
  const smartContractState = useSmartContract({
    provider: walletState.provider,
    checkNetwork: walletState.checkNetwork,
    user: userState.user,
  });

  return (
    <AppContext.Provider value={{ walletState, seasonState, userState, leaderboardState, smartContractState }}>
      {children}
    </AppContext.Provider>
  );
};
