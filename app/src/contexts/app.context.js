import { createContext } from 'react';

import useWallet from '../hooks/useWallet';
import useSmartContract from '../hooks/useSmartContract';
import useSeason from '../hooks/useSeason';
import useMarket from '../hooks/useMarket';
import useUserData from '../hooks/useUserData';
import useLeaderboard from '../hooks/useLeaderboard';
import useUserRewards from '../hooks/useUserRewards';

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const walletState = useWallet();
  const seasonState = useSeason();
  const marketState = useMarket();
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
    season: seasonState.season,
  });
  const userRewardsState = useUserRewards({
    address: walletState.address,
    getUserReferralReward: smartContractState.getUserReferralReward,
    getUserHolderReward: smartContractState.getUserHolderReward,
    getUserLockedValue: smartContractState.getUserLockedValue,
  });

  return (
    <AppContext.Provider
      value={{
        walletState,
        seasonState,
        marketState,
        userState,
        userRewardsState,
        leaderboardState,
        smartContractState,
      }}>
      {children}
    </AppContext.Provider>
  );
};
