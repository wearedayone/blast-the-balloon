import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';

import { customFormat } from '../../../utils/numbers';

const LastPurchase = ({ latestPurchase, season }) => {
  const [timer, setTimer] = useState({
    h: 0,
    m: 0,
    s: 0,
  });

  const interval = useRef();
  const countdown = () => {
    if (!latestPurchase) return;

    const now = Date.now();
    const diffInSeconds = (now - latestPurchase.lastPurchaseTime.toDate().getTime()) / 1000;
    const d = parseInt(diffInSeconds / (60 * 60 * 24));
    const h = parseInt((diffInSeconds - d * 60 * 60 * 24) / (60 * 60));
    const m = parseInt((diffInSeconds - d * 60 * 60 * 24 - h * 60 * 60) / 60);
    const s = parseInt(diffInSeconds % 60);

    setTimer({
      d: d > 9 ? d : `0${d}`,
      h: h > 9 ? h : `0${h}`,
      m: m > 9 ? m : `0${m}`,
      s: s > 9 ? s : `0${s}`,
    });
  };

  console.log('latestPurchase', latestPurchase);

  useEffect(() => {
    interval.current && clearInterval(interval.current);

    interval.current = setInterval(countdown, 1000);

    return () => interval.current && clearInterval(interval.current);
  }, [latestPurchase?.lastPurchaseTime]);

  const jackpot = useMemo(() => {
    if (!season?.prizePool || !season?.gameEndConfig) return 0;

    return season.prizePool * season.gameEndConfig.lastLuckyW;
  }, [season?.prizePool, season?.gameEndConfig]);

  const countdownTimer = useMemo(() => `${timer.d > 0 ? `${timer.d}:` : ''}${timer.h}:${timer.m}:${timer.s}`, [timer]);

  if (!latestPurchase) return null;

  return (
    <Box display="flex" gap={1} sx={{ transform: 'translateX(-10px)' }}>
      <Box position="relative">
        <img src="/images/last-purchase-frame.svg" alt="" />
        <Box position="absolute" top="45%" left="5%" sx={{ transform: 'translateY(-50%)' }}>
          <Typography fontSize={13} color="white" textTransform="uppercase" align="center">
            Last Purchase:
          </Typography>
          <Typography
            fontFamily="Oswald"
            fontSize={30}
            color="white"
            textTransform="uppercase"
            align="center"
            width={countdownTimer.length * 15}
            sx={{ mt: -1 }}>
            {countdownTimer}
          </Typography>
        </Box>
        <Box position="absolute" top="0" right="5%">
          <Typography fontSize={28} color="white" textAlign="right">
            {latestPurchase.username}
          </Typography>
          <Typography sx={{ mt: -1 }} fontFamily="Oswald" color="#DFFF00" textAlign="right" textTransform="uppercase">
            is about to win
          </Typography>
        </Box>
        <Box px={0.5} position="absolute" top="17%" right="7%" display="flex" alignItems="flex-end">
          <Typography fontSize={80} color="#DFFF00">
            {customFormat(jackpot, 3)}
          </Typography>
          <Typography fontSize={40} color="white" sx={{ mb: 2 }}>
            ETH
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default LastPurchase;
