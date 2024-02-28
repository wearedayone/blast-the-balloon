import { useEffect, useState } from 'react';
import { Box, Grid } from '@mui/material';

import Balloon from './components/Balloon';
import Earnings from './components/Earnings';
import LastPurchase from './components/LastPurchase';
import Leaderboard from './components/Leaderboard';
import Logo from './components/Logo';
import MainButton from './components/MainButton';
import Referral from './components/Referral';
import Timer from './components/Timer';
import UserInfo from './components/UserInfo';
import Winner from './components/Winner';
import useAppContext from '../../hooks/useAppContext';

const App = () => {
  const { userState, seasonState, marketState, leaderboardState, walletState } = useAppContext();
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    if (seasonState.season) {
      const now = Date.now();
      const endTime = seasonState.season.estimatedEndTime.toDate().getTime();
      setEnded(now >= endTime);
    }
  }, [seasonState.season]);

  return (
    <Box minHeight="100vh" bgcolor="#1b1b1b">
      <Winner
        ended={ended}
        season={seasonState.season}
        topHoldersRewards={leaderboardState.topHoldersRewards}
        lastPurchaseRewards={leaderboardState.lastPurchaseRewards}
        playerLeaderboardIndex={leaderboardState.gamePlays.findIndex(({ isUser }) => isUser)}
        ethPriceInUsd={marketState.market?.ethPriceInUsd}
        winners={leaderboardState.gamePlays.sort((a, b) => b.numberOfPump - a.numberOfPump)}
      />
      <Box
        minHeight="100vh"
        p={2}
        display="flex"
        sx={{
          background: 'url(/images/balloon.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>
        <Grid container spacing={1}>
          <Grid item xs={4} sx={{ height: '100%' }}>
            <Box height="100%" display="flex" flexDirection="column" alignItems="flex-start">
              <Box pt={2}>
                <Logo />
              </Box>
              <Box flex={1}>
                <Referral refCode={userState?.user?.referralCode || ''} referrals={userState?.referralUsers || []} />
              </Box>
              <Earnings
                referralReward={userState?.user?.referralReward}
                holderReward={userState?.user?.holderReward}
                address={walletState.address}
                ethPriceInUsd={marketState.market?.ethPriceInUsd}
              />
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box height="100%" display="flex" flexDirection="column" alignItems="center">
              <Timer
                ended={ended}
                setEnded={setEnded}
                endTime={
                  ended
                    ? seasonState.season?.estimatedEndTime.toDate().getTime() +
                      seasonState.season?.pauseBetweenSeason * 1000
                    : seasonState.season?.estimatedEndTime
                    ? seasonState.season?.estimatedEndTime.toDate().getTime()
                    : Date.now()
                }
              />
              <Box flex={1} display="flex" flexDirection="column" justifyContent="center"></Box>
              <MainButton />
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box
              height="100%"
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
              alignItems="flex-end">
              <UserInfo
                address={walletState.address}
                numberOfPump={userState?.gamePlay?.numberOfPump || 0}
                disconnect={walletState.logout}
              />
              <LastPurchase
                season={seasonState.season}
                address={walletState.address}
                numberOfPump={userState?.gamePlay?.numberOfPump || 0}
                disconnect={walletState.logout}
                latestPurchase={leaderboardState.gamePlays.sort((a, b) => b.lastPurchaseTime - a.lastPurchaseTime)[0]}
              />
              <Leaderboard
                leaderboardData={leaderboardState.gamePlays}
                topHoldersRewards={leaderboardState.topHoldersRewards}
                lastPurchaseRewards={leaderboardState.lastPurchaseRewards}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default App;
