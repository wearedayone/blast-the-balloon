import { useState, useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

const Timer = ({ endTime, ended, setEnded }) => {
  const [timer, setTimer] = useState({
    h: 0,
    m: 0,
    s: 0,
  });

  const interval = useRef();
  const countdown = () => {
    const now = Date.now();
    if (endTime < now) {
      setTimer({
        h: 0,
        m: 0,
        s: 0,
      });
      setEnded(true);
      interval.current && clearInterval(interval.current);
      return;
    }
    const diffInSeconds = (endTime - now) / 1000;
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
  }, [endTime, ended]);

  return (
    <Box position="relative">
      <img src={ended ? '/images/timer-end-container.png' : '/images/timer-container.png'} alt="timer-container" />
      <Box
        position="absolute"
        p={1.5}
        top={0}
        left={0}
        width="100%"
        height="100%"
        display="flex"
        flexDirection="column">
        <Typography
          fontSize={ended ? 15 : 22}
          color={ended ? '#F0FF92' : '#979000'}
          align="center"
          lineHeight={ended ? '15px' : '22px'}>
          {ended ? 'NEXT ROUND STARTS IN:' : 'ROUND ENDS IN'}
        </Typography>
        <Typography
          fontSize={40}
          fontWeight={500}
          color="#F0FF92"
          align="center"
          lineHeight="32px">{`${timer.h}:${timer.m}:${timer.s}`}</Typography>
      </Box>
    </Box>
  );
};

export default Timer;
