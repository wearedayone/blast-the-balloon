import { useEffect, useState, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

import useAppContext from '../../../hooks/useAppContext';
import { customFormat } from '../../../utils/numbers';
import { calculateNextPumpBuyPriceBatch, calculateNextPumpSellPriceBatch } from '../../../utils/formulas';

const MainButton = () => {
  const {
    userState: { gamePlay },
    smartContractState: { buy, sell },
    seasonState: { season },
  } = useAppContext();
  const [mode, setMode] = useState('buy');
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const toggleMode = () => setMode(mode === 'buy' ? 'sell' : 'buy');

  const mainBtnText = mode === 'buy' ? 'Buy' : 'Sell';
  const secondBtnText = mode === 'buy' ? 'Sell' : 'Buy';
  const buyBtnStyle = {
    background: 'linear-gradient(129.55deg, #F69B23 1.85%, #EB3624 50.42%, #F01B7E 97.21%)',
  };
  const sellBtnStyle = { bgcolor: '#DFFF00' };
  const mainBtnStyle = mode === 'buy' ? buyBtnStyle : sellBtnStyle;

  const secondBtnStyle =
    mode === 'buy'
      ? { bgcolor: '#DFFF00' }
      : { background: 'linear-gradient(129.55deg, #F69B23 1.85%, #EB3624 50.42%, #F01B7E 97.21%)' };

  const max = mode === 'buy' ? Infinity : gamePlay?.numberOfPump || 0;
  const canDecrease = quantity > 1;
  const canIncrease = quantity < max;
  const decrease = () => canDecrease && setQuantity(quantity - 1);
  const increase = () => canIncrease && setQuantity(quantity + 1);

  const totalPrice = useMemo(() => {
    if (!quantity || !season) return 0;

    const { pumpBought, pumpSold, pumpPrice, buyConfig } = season;
    const n = pumpBought - pumpSold;
    const total =
      mode === 'buy'
        ? calculateNextPumpBuyPriceBatch(pumpPrice.basePrice, pumpPrice.k, n, quantity)
        : calculateNextPumpSellPriceBatch(pumpPrice.basePrice, pumpPrice.k, n, quantity, buyConfig.prizePool);
    return total;
  }, [season, quantity, mode]);

  useEffect(() => {
    setQuantity(mode === 'buy' ? 1 : 0);
  }, [mode]);

  const makeTxn = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const fn = mode === 'buy' ? buy : sell;
      await fn({ amount: quantity });
      setConfirmed(true);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  if (confirmed) {
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
        }}>
        <Typography fontSize={25} fontWeight={700} fontFamily="Oxygen, sans-serif" color="#fff" align="center">
          Confirmed
        </Typography>
      </Box>
    );
  }

  if (confirming) {
    return (
      <Box position="relative">
        <img src="/images/action-container.png" alt="container" />
        {mode === 'sell' && (
          <Box
            position="absolute"
            top={0}
            left={0}
            width="100%"
            sx={{ transform: 'translate(20px, calc(-100% + 5px))' }}>
            <Typography fontSize={20} align="center" color="#DFFF00" lineHeight="20px">
              ARE YOU SURE?
            </Typography>
            <Typography fontSize={14} fontWeight={300} fontFamily="Oswald, sans-serif" align="center" color="white">
              Sales are subject to 40% tax !
            </Typography>
          </Box>
        )}
        <Box position="absolute" top={0} left={0} width="100%" height="100%" px={2} py={1}>
          <Box display="flex" flexDirection="column" gap={1.25}>
            <Typography fontSize={17} fontWeight={600} align="center" color="white">
              {mode === 'buy' ? 'BUY' : 'SELL'} PUMPS
            </Typography>
            <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
              <RemoveCircleOutlineIcon
                sx={{ color: '#DFFF00', cursor: canDecrease ? 'pointer' : 'default', opacity: canDecrease ? 1 : 0.5 }}
                onClick={decrease}
              />
              <Box
                height="32px"
                width="84px"
                px={2}
                pb={1}
                bgcolor="#DFFF00"
                display="flex"
                justifyContent="center"
                flexDirection="column"
                gap={1}>
                <Typography fontSize={35} fontWeight={500} align="center">
                  {quantity}
                </Typography>
              </Box>
              <AddCircleOutlineIcon
                sx={{ color: '#DFFF00', cursor: canIncrease ? 'pointer' : 'default', opacity: canIncrease ? 1 : 0.5 }}
                onClick={increase}
              />
            </Box>
            <Box display="flex" justifyContent="center">
              <Box width="70%" py={0.5} display="flex" alignItems="center" justifyContent="center" bgcolor="#DFFF00">
                <Typography
                  fontSize={12}
                  fontWeight={700}
                  fontFamily="Oxygen, sans-serif"
                  align="center"
                  color="#12140D">
                  PRICE: {customFormat(totalPrice, 5)} ETH
                </Typography>
              </Box>
            </Box>
            <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
              <Box
                position="relative"
                width="55px"
                borderRadius="50%"
                display="flex"
                alignItems="center"
                justifyContent="center"
                sx={{ aspectRatio: '1/1', cursor: 'pointer', ...(mode === 'buy' ? buyBtnStyle : sellBtnStyle) }}
                onClick={makeTxn}>
                <Typography fontSize={17} fontWeight={600}>
                  {mode === 'buy' ? 'BUY' : 'SELL'}
                </Typography>
              </Box>
            </Box>
          </Box>
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
