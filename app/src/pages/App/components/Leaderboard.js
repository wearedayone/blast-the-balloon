import { useMemo, useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';

const tabs = [
  { id: 'pumpers', title: 'TOP PUMPERS' },
  { id: 'last-purchase', title: 'LAST PURCHASE' },
];
const aspectRatio = 949 / 1340;
const VERTICAL_BOUND = window.screen.height * 0.4;
const HORIZONTAL_BOUND = window.screen.width * 0.3;
const WIDTH = Math.max(VERTICAL_BOUND * aspectRatio, HORIZONTAL_BOUND);
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
      position="relative"
      sx={{
        aspectRatio: '949/1340',
        backgroundImage: 'url(/images/leaderboard-frame.png)',
        backgroundSize: 'contain',
      }}>
      <img
        src="/images/benefits.svg"
        alt=""
        width={WIDTH * 0.4}
        style={{ position: 'absolute', bottom: 0, left: 0, transform: 'translateX(-105%)' }}
      />
      <Box pb={`${WIDTH * 0.01}px`}>
        <Typography fontSize={18} sx={{ mr: 1 }} color="white" align="center">
          LEADERBOARD
        </Typography>
      </Box>
      <Box display="flex" gap={0.5} position="relative">
        {tabs.map((item) => (
          <Box
            key={item.id}
            px={2}
            py={0.5}
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
      <Box
        sx={{
          position: 'relative',
          overflowX: 'visible',
          height: 18,
          '& .MuiTypography-root': {
            position: 'absolute',
            fontFamily: 'Oswald',
            color: 'white',
            fontSize: 12,
            textTransform: 'uppercase',
          },
        }}>
        <Typography sx={{ left: WIDTH * 0.06 }}>Name</Typography>
        <Typography sx={{ left: WIDTH * 0.37 }}>Nodes</Typography>
        <Typography sx={{ left: WIDTH * 0.67 }}>Profit</Typography>
      </Box>
      <Box
        mx={-3}
        px={3}
        sx={{
          overflowY: 'scroll',
          height: WIDTH * 0.91,
        }}>
        <Box position="relative" height="inherit">
          <Box
            position="absolute"
            sx={{
              left: 0,
              top: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'linear-gradient(0deg, #191B11 0%, rgba(25, 27, 17, 0) 100%)',
            }}
          />
          {data.map((gamePlay, index) => (
            <Grid
              container
              key={gamePlay.id}
              p={0.5}
              mb={0.5}
              display="flex"
              alignItems="center"
              sx={{
                position: 'relative',
                backgroundImage: gamePlay.isUser
                  ? 'linear-gradient(90deg, #FFFFFF 0%, rgba(151, 144, 0, 0) 100%)'
                  : 'linear-gradient(90deg, #979000 0%, rgba(151, 144, 0, 0) 100%)',
                '& .MuiTypography-root': { fontFamily: 'Oswald', color: 'white' },
              }}>
              {gamePlay.isUser && <StarIcon htmlColor="white" sx={{ position: 'absolute', zIndex: 10, left: -26 }} />}
              <Grid item xs={5}>
                <Box display="flex" gap={1} alignItems="center" pl={2}>
                  <Typography color={`${gamePlay.isUser ? 'black' : 'white'} !important`} fontSize={15}>
                    {gamePlay.username}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={2}>
                <Typography align="center" fontSize={15} fontWeight={500}>
                  {gamePlay.numberOfPump}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Box display="flex" alignItems="flex-end" justifyContent="flex-end">
                  <Typography fontSize={15} lineHeight="20px" align="center" fontWeight={500}>
                    {rewards[index] ?? 0}
                  </Typography>
                  <Typography fontSize={12} align="center" fontWeight={300}>
                    eth
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Leaderboard;
