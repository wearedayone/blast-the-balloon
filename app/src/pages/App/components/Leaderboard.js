import { useMemo, useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';

const tabs = [
  { id: 'pumpers', title: 'TOP PUMPERS' },
  { id: 'last-purchase', title: 'LAST PURCHASE' },
];
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
      width={400}
      display="flex"
      flexDirection="column"
      gap={0.5}
      sx={{ aspectRatio: '473/670', backgroundImage: 'url(/images/leaderboard-frame.png)', backgroundSize: 'contain' }}>
      <Box bgcolor="#DFFF00" p={1}>
        <Typography color="#12140D" align="center">
          LEADERBOARD
        </Typography>
      </Box>
      <Box display="flex" gap={0.5} position="relative">
        {tabs.map((item) => (
          <Box
            key={item.id}
            px={2}
            pt={0.75}
            pb={1.25}
            flex={1}
            sx={{
              cursor: 'pointer',
              backgroundImage:
                tab === item.id
                  ? 'linear-gradient(0deg, #DFFF00 -25%, rgba(223, 255, 0, 0) 100%)'
                  : 'linear-gradient(0deg, #979000 -185%, rgba(151, 144, 0, 0) 100%);',
            }}
            onClick={() => setTab(item.id)}>
            <Typography fontSize={13} color={tab === item.id ? '#DFFF00' : '#979000'} align="center">
              {item.title}
            </Typography>
          </Box>
        ))}
        <Box position="absolute" sx={{ bottom: 10 }}>
          <TableHeader title="Name" sx={{ left: 50 }} />
          <TableHeader title="Nodes" sx={{ left: 137 }} />
          <TableHeader title="Profit" sx={{ left: 240 }} />
        </Box>
      </Box>
      <Box sx={{ overflowY: 'scroll', height: 375 }}>
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

const TableHeader = ({ title, sx }) => (
  <Box
    sx={{
      position: 'absolute',
      width: 40,
      borderBottom: '12px solid #1b1f1d',
      borderLeft: '5px solid transparent',
      borderRight: '5px solid transparent',
      height: 0,
      ...sx,
    }}>
    <Typography color="#979000" fontSize={7} align="center" lineHeight={2} textTransform="uppercase">
      {title}
    </Typography>
  </Box>
);

export default Leaderboard;
