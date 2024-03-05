import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';

import { customFormat } from '../../../utils/numbers';

const Winner = ({
  ended,
  winners,
  season,
  ethPriceInUsd,
  topHoldersRewards,
  lastPurchaseRewards,
  playerLeaderboardIndex,
}) => {
  const [timer, setTimer] = useState({
    h: 0,
    m: 0,
    s: 0,
  });
  const interval = useRef();
  const playerRank = useMemo(() => {
    if (playerLeaderboardIndex === -1) return null;
    let rankSuffix = 'th';
    const rank = playerLeaderboardIndex + 1;
    if ([11, 12, 13].includes(rank)) return `${rank}${rankSuffix}`;
    switch (rank % 10) {
      case 1:
        rankSuffix = 'st';
        break;
      case 2:
        rankSuffix = 'nd';
        break;
      case 3:
        rankSuffix = 'rd';
        break;
      default:
        break;
    }

    return `${rank}${rankSuffix}`;
  }, [playerLeaderboardIndex]);
  const playerRewards = useMemo(
    () => (topHoldersRewards[playerLeaderboardIndex] || 0) + (lastPurchaseRewards[playerLeaderboardIndex] || 0),
    [topHoldersRewards, lastPurchaseRewards, playerLeaderboardIndex]
  );
  const nextSeasonStartTime = useMemo(() => {
    if (!season?.estimatedEndTime || !season?.pauseBetweenSeason) return null;

    return season.estimatedEndTime.toDate().getTime() + season.pauseBetweenSeason * 1000;
  }, [season?.estimatedEndTime, season?.pauseBetweenSeason]);
  const jackpot = useMemo(() => {
    if (!season?.prizePool || !season?.gameEndConfig) return 0;

    return season.prizePool * season.gameEndConfig.lastLuckyW;
  }, [season?.prizePool, season?.gameEndConfig]);

  const countdownTimer = useMemo(() => `${timer.h}:${timer.m}:${timer.s}`, [timer]);

  const countdown = () => {
    if (!nextSeasonStartTime) return;

    const now = Date.now();
    const diffInSeconds = (nextSeasonStartTime - now) / 1000;
    const h = parseInt(diffInSeconds / (60 * 60));
    const m = parseInt((diffInSeconds - h * 60 * 60) / 60);
    const s = parseInt(diffInSeconds % 60);

    setTimer({
      h: h > 9 ? h : `0${h}`,
      m: m > 9 ? m : `0${m}`,
      s: s > 9 ? s : `0${s}`,
    });
  };

  useEffect(() => {
    interval.current && clearInterval(interval.current);

    interval.current = setInterval(countdown, 1000);

    return () => interval.current && clearInterval(interval.current);
  }, [nextSeasonStartTime]);

  if (!ended) return;

  return (
    <Box
      position="absolute"
      top="calc(50% + 30px)"
      left="50%"
      sx={{ transform: 'translate(-50%, -50%)', '&>img': { height: `70vh` } }}>
      <img src="/images/winner.png" alt="winner" />
      <Box
        position="absolute"
        top="5%"
        left={0}
        p={0.5}
        width="100%"
        height="100%"
        display="flex"
        flexDirection="column"
        justifyContent="space-between">
        <Box display="flex">
          <Box flex={3} display="flex" flexDirection="column" justifyContent="center">
            <Typography
              fontSize={28}
              color="white"
              fontWeight={500}
              lineHeight={1}
              textAlign="center"
              textTransform="uppercase">
              Next round <br />
              starts in:
            </Typography>
            <Typography
              fontSize={40}
              fontFamily="Oswald"
              fontWeight={500}
              textAlign="center"
              textTransform="uppercase"
              sx={{ mt: -1 }}>
              {countdownTimer}
            </Typography>
          </Box>
          {playerRank && (
            <Box flex={2}>
              <Typography fontSize={15} fontWeight={600} textAlign="center" textTransform="uppercase">
                You place
              </Typography>
              <Typography
                fontSize={40}
                fontFamily="Oswald"
                color="#DFFF00"
                fontWeight={500}
                textAlign="center"
                textTransform="uppercase"
                sx={{ mt: -2 }}>
                {playerRank}
              </Typography>
              <Typography fontSize={15} fontWeight={600} textAlign="center" textTransform="uppercase">
                You won
              </Typography>
              <Typography
                fontSize={40}
                fontFamily="Oswald"
                color="#DFFF00"
                fontWeight={500}
                textAlign="center"
                textTransform="uppercase"
                sx={{ mt: -2 }}>
                {customFormat(playerRewards, 3)}ETH
              </Typography>
              <Typography fontSize={20} fontWeight={600} textAlign="center" textTransform="uppercase" sx={{ mt: -1.5 }}>
                {customFormat(playerRewards * ethPriceInUsd, 1)}
              </Typography>
            </Box>
          )}
        </Box>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Box display="flex" flexDirection="column">
            <Typography fontFamily="Oswald" fontSize={35}>
              {winners[0]?.username}
            </Typography>
            <Typography
              fontSize={80}
              fontWeight={500}
              fontFamily="Oswald, sans-serif"
              color="white"
              align="center"
              lineHeight="60px">
              {customFormat(jackpot, 3)}
              <span style={{ fontSize: 60 }}>ETH</span>
            </Typography>
          </Box>
          <Typography
            fontSize={40}
            fontWeight={600}
            fontFamily="Oswald, sans-serif"
            color="white"
            align="center"
            lineHeight="40px">
            CONGRATULATIONS!
          </Typography>
        </Box>
        <Box pt={1} pl="3.5%" pr="2.5%" display="flex" alignItems="center" justifyContent="center" gap="10%">
          {winners.slice(1).map((item, index) => (
            <Box
              key={item.id}
              display="flex"
              flexDirection="column"
              alignItems="center"
              sx={{
                '& img': {
                  display: 'block',
                  borderRadius: '50%',
                  width: '5vw',
                  aspectRatio: '1/1',
                  objectFit: 'cover',
                  objectPosition: 'center',
                },
              }}>
              <Box>
                <Typography
                  fontSize={60}
                  fontWeight={600}
                  lineHeight={1}
                  fontFamily="Oswald, sans-serif"
                  align="center">
                  {index + 2}
                </Typography>
                <Typography fontSize={22} fontFamily="Oswald, sans-serif" color="white" align="center">
                  {item.username}
                </Typography>
                <Typography
                  fontSize={25}
                  fontWeight={500}
                  fontFamily="Oswald, sans-serif"
                  align="center"
                  lineHeight={1}>
                  {topHoldersRewards[index - 1]} ETH
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
        <Box ml="17%" mb="14%" width="42%" display="flex" justifyContent="center" alignItems="flex-end">
          <img
            src="/images/blast-balloon.png"
            alt="Blast The Balloon"
            style={{ objectFit: 'contain', margin: '-12% 0', height: '17vh' }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Winner;
