import { useMemo, useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';

const tabs = [
  { id: 'pumpers', title: 'TOP PUMPERS' },
  { id: 'last-purchase', title: 'LAST PURCHASE' },
];
const WIDTH = 450;
const Leaderboard = ({ leaderboardData, topHoldersRewards, lastPurchaseRewards }) => {
  const [tab, setTab] = useState('pumpers');

  const data = useMemo(() => {
    const sortFnc = (a, b) =>
      tab === 'pumpers' ? b.numberOfPump - a.numberOfPump : b.lastPurchaseTime - a.lastPurchaseTime;
    return leaderboardData.sort(sortFnc);
  }, [tab, leaderboardData]);

  const rewards = useMemo(
    () => (tab === 'pumpers' ? topHoldersRewards : lastPurchaseRewards),
    [tab, topHoldersRewards, lastPurchaseRewards]
  );

  return (
    <Box
      pt={11}
      pl={5}
      pr={6}
      pb={1}
      width={WIDTH}
      display="flex"
      flexDirection="column"
      gap={0.5}
      sx={{
        aspectRatio: '949/1340',
        backgroundImage: 'url(/images/leaderboard-frame.png)',
        backgroundSize: 'contain',
      }}>
      <Box pt={`${WIDTH * 0.04}px`} pb={`${WIDTH * 0.02}px`}>
        <Typography fontSize={18} color="#979000" align="center">
          LEADERBOARD
        </Typography>
      </Box>
      <Box display="flex" gap={0.5} position="relative">
        {tabs.map((item) => (
          <Box
            key={item.id}
            px={2}
            py={0.75}
            flex={1}
            sx={{
              cursor: 'pointer',
              backgroundColor: tab === item.id ? '#DFFF00' : '#979000',
            }}
            onClick={() => setTab(item.id)}>
            <Typography fontSize={13} color="#12140D" align="center">
              {item.title}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{ position: 'relative', height: 14 }}>
        <Typography
          color="#DFFF00"
          fontSize={7}
          align="center"
          lineHeight={2}
          textTransform="uppercase"
          sx={{ position: 'absolute', left: 60 }}>
          Name
        </Typography>
        <Typography
          color="#DFFF00"
          fontSize={7}
          align="center"
          lineHeight={2}
          textTransform="uppercase"
          sx={{ position: 'absolute', left: 146 }}>
          Nodes
        </Typography>
        <Typography
          color="#DFFF00"
          fontSize={7}
          align="center"
          lineHeight={2}
          textTransform="uppercase"
          sx={{ position: 'absolute', left: 256 }}>
          Profit
        </Typography>
      </Box>
      <Box
        mx={-0.5}
        px={0.5}
        sx={{
          overflowY: 'scroll',
          height: WIDTH * 0.93,
          backgroundImage: 'linear-gradient(0deg, #191B11 0%, rgba(25, 27, 17, 0) 100%)',
        }}>
        {data.map((gamePlay, index) => (
          <Grid
            container
            key={gamePlay.id}
            p={0.5}
            mb={0.5}
            display="flex"
            alignItems="center"
            sx={{
              backgroundImage: gamePlay.isUser
                ? 'linear-gradient(90deg, #DFFF00 0%, rgba(151, 144, 0, 0) 100%, rgba(223, 255, 0, 0) 100%)'
                : 'linear-gradient(90deg, #979000 0%, rgba(151, 144, 0, 0) 100%)',
            }}>
            <Grid item xs={5}>
              <Box display="flex" gap={1} alignItems="center">
                <img
                  src={gamePlay.avatarURL}
                  width={40}
                  height={40}
                  alt={gamePlay.username}
                  style={{ objectFit: 'cover', border: '1px solid black' }}
                />
                <Typography color="#DFFF00" fontSize={15}>
                  {gamePlay.username}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={2}>
              <Typography color="#DFFF00" align="center" fontSize={15}>
                {gamePlay.numberOfPump}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Box display="flex" alignItems="flex-end" justifyContent="flex-end">
                <Typography color="#DFFF00" fontSize={15} lineHeight="20px" align="center">
                  {rewards[index] ?? 0}
                </Typography>
                <Typography fontSize={9} color="#DFFF00" align="center" sx={{ alignSelf: 'flex-end' }}>
                  ETH
                </Typography>
              </Box>
            </Grid>
          </Grid>
        ))}
      </Box>
    </Box>
  );
};

export default Leaderboard;
