import { useState, useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';

const MainButton = () => {
  const [mode, setMode] = useState('sell');
  const [confirming, setConfirming] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [mouseDown, setMouseDown] = useState(false);
  const [left, setLeft] = useState(0);
  const [loading, setLoading] = useState(false);

  const toggleMode = () => setMode(mode === 'buy' ? 'sell' : 'buy');

  const mainBtnText = mode === 'buy' ? 'Buy' : 'Sell';
  const secondBtnText = mode === 'buy' ? 'Sell' : 'Buy';
  const mainBtnStyle =
    mode === 'buy'
      ? {
          background: 'linear-gradient(129.55deg, #F69B23 1.85%, #EB3624 50.42%, #F01B7E 97.21%)',
        }
      : { bgcolor: '#DFFF00' };

  const secondBtnStyle =
    mode === 'buy'
      ? { bgcolor: '#DFFF00' }
      : { background: 'linear-gradient(129.55deg, #F69B23 1.85%, #EB3624 50.42%, #F01B7E 97.21%)' };

  const makeTxn = async () => {
    setLoading(true);
    try {
      console.log('makeTxn here', { mode, quantity });
      setConfirmed(true);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const timeout = useRef();
  const confirmTxn = async () => {
    if (timeout.current) {
      clearTimeout(timeout.current);
      timeout.current = null;
    }

    timeout.current = setTimeout(makeTxn, 300);
  };

  useEffect(() => {
    setLeft(0);
    canTriggerOnClick.current = true;
  }, [mode, confirming, confirmed]);

  useEffect(() => {
    window.addEventListener('mouseup', () => setMouseDown(false));
  }, []);

  const canTriggerOnClick = useRef(true);
  useEffect(() => {
    const onMouseMove = (e) => {
      const buttonSize = 70;
      const windowWidth = window.innerWidth;
      const sliderWidth = 240;
      const startX = windowWidth / 2 - sliderWidth / 2;
      if (startX > e.clientX) {
        setLeft(0);
        return;
      }

      setLeft(Math.min(e.clientX - startX - buttonSize / 2, sliderWidth - buttonSize / 2));
      if (e.clientX - startX - buttonSize / 2 >= sliderWidth - buttonSize / 2) {
        canTriggerOnClick.current = false;
        confirmTxn();
      } else {
        canTriggerOnClick.current = true;
      }
    };

    if (mouseDown && !loading) {
      window.addEventListener('mousemove', onMouseMove, false);

      return () => window.removeEventListener('mousemove', onMouseMove, false);
    } else {
      window.removeEventListener('mousemove', onMouseMove, false);
    }
  }, [mouseDown, loading]);

  if (confirmed) {
    if (mode === 'buy') {
      return (
        <Box
          width="240px"
          height="50px"
          borderRadius="90px"
          bgcolor="#DFFF00"
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{ cursor: 'pointer' }}
          onClick={() => {
            setConfirmed(false);
            setConfirming(false);
            setQuantity(1);
            canTriggerOnClick.current = true;
          }}>
          <Typography fontSize={25} fontWeight={700} fontFamily="Oxygen, sans-serif" color="#2A2A2A" align="center">
            Confirmed
          </Typography>
        </Box>
      );
    }

    return (
      <Box
        width="240px"
        height="50px"
        borderRadius="90px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{ cursor: 'pointer', background: 'linear-gradient(180deg, #F27824 0%, #EF2560 100%)' }}
        onClick={() => {
          setConfirmed(false);
          setConfirming(false);
          setQuantity(1);
          canTriggerOnClick.current = true;
        }}>
        <Typography fontSize={25} fontWeight={700} fontFamily="Oxygen, sans-serif" color="#fff" align="center">
          Confirmed
        </Typography>
      </Box>
    );
  }

  if (confirming) {
    if (mode === 'buy') {
      return (
        <Box
          pr={2}
          height="52px"
          width="240px"
          bgcolor="#DFFF00"
          borderRadius="90px"
          position="relative"
          display="flex"
          alignItems="center">
          <Box
            position="absolute"
            top="50%"
            left={`${left}px`}
            width="70px"
            borderRadius="50%"
            display="flex"
            flexDirection="column"
            gap={0.5}
            sx={{
              transform: 'translate(-10%, -50%)',
              cursor: 'pointer',
              aspectRatio: '1/1',
              background: 'linear-gradient(129.55deg, #F69B23 1.85%, #EB3624 50.42%, #F01B7E 97.21%)',
            }}
            onClick={() => !loading && canTriggerOnClick.current && setQuantity(quantity + 1)}
            onMouseDown={() => setMouseDown(true)}>
            <Typography
              fontSize={45}
              fontWeight={500}
              color="#12140D"
              align="center"
              lineHeight="45px"
              sx={{ userSelect: 'none' }}>
              {quantity}
            </Typography>
            <Typography
              fontSize={20}
              color="#12140D"
              align="center"
              lineHeight="22px"
              sx={{ transform: 'translateY(-10px)', userSelect: 'none' }}>
              PUMP
            </Typography>
          </Box>
          <Box width="70px" />
          <Box flex={1} ml={1.5}>
            <Typography fontSize={12} color="#12140D">
              DRAG TO CONFIRM
            </Typography>
          </Box>
          <ShoppingCartOutlinedIcon sx={{ color: '#EE265B' }} />
        </Box>
      );
    }

    return (
      <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
        <Box ml={3}>
          <Typography fontSize={20} color="#DFFF00" lineHeight="20px">
            ARE YOU SURE?
          </Typography>
          <Typography
            fontSize={14}
            fontWeight={300}
            fontFamily="Oswald, sans-serif"
            color="white"
            lineHeight="14px"
            letterSpacing="-2%">
            Sales are subject to 40% tax !
          </Typography>
        </Box>
        <Box
          pr={2}
          height="52px"
          width="240px"
          borderRadius="90px"
          position="relative"
          display="flex"
          alignItems="center"
          sx={{ background: 'linear-gradient(180deg, #DFFF00 0%, #979000 100%)' }}>
          <Box
            position="absolute"
            top="50%"
            left={`${left}px`}
            width="70px"
            borderRadius="50%"
            display="flex"
            flexDirection="column"
            gap={0.5}
            bgcolor="#DFFF00"
            sx={{
              cursor: 'pointer',
              aspectRatio: '1/1',
              transform: 'translate(-10%, -50%)',
            }}
            onClick={() => !loading && canTriggerOnClick.current && setQuantity(quantity + 1)}
            onMouseDown={() => setMouseDown(true)}>
            <Typography
              fontSize={45}
              fontWeight={500}
              color="#12140D"
              align="center"
              lineHeight="45px"
              sx={{ userSelect: 'none' }}>
              {quantity}
            </Typography>
            <Typography
              fontSize={20}
              color="#12140D"
              align="center"
              lineHeight="22px"
              sx={{ transform: 'translateY(-10px)', userSelect: 'none' }}>
              PUMP
            </Typography>
          </Box>
          <Box width="70px" />
          <Box flex={1} ml={1.5}>
            <Typography fontSize={12} color="#12140D">
              DRAG TO CONFIRM
            </Typography>
          </Box>
          <Typography fontSize={13} fontWeight={500}>
            SELL
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        position="relative"
        width="150px"
        borderRadius="50%"
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{ aspectRatio: '1/1', cursor: 'pointer', ...mainBtnStyle }}
        onClick={() => setConfirming(true)}>
        <Typography fontSize={40} fontWeight={600}>
          {mainBtnText}
        </Typography>
        <Box
          width="50px"
          position="absolute"
          top={0}
          right={0}
          borderRadius="50%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{ aspectRatio: '1/1', cursor: 'pointer', ...secondBtnStyle }}
          onClick={(e) => {
            e.stopPropagation();
            toggleMode();
          }}>
          <Typography fontWeight={36}>{secondBtnText}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default MainButton;
