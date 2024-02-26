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
  const [confirming, setConfirming] = useState(true);
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
        }}>
        <Typography fontSize={25} fontWeight={700} fontFamily="Oxygen, sans-serif" color="#fff" align="center">
          Confirmed
        </Typography>
      </Box>
    );
  }

  if (confirming) {
    return (
      <Box display="flex" flexDirection="column" gap={1}>
        <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
          <RemoveCircleOutlineIcon
            sx={{ color: '#DFFF00', cursor: canDecrease ? 'pointer' : 'default', opacity: canDecrease ? 1 : 0.5 }}
            onClick={decrease}
          />
          <Box px={2} py={0.5} bgcolor="#DFFF00" display="flex" flexDirection="column" gap={1}>
            <Typography fontSize={35} fontWeight={500} align="center" lineHeight="30px">
              {quantity}
            </Typography>
            <Typography fontSize={20} align="center" lineHeight="20px">
              PUMP
            </Typography>
          </Box>
          <AddCircleOutlineIcon
            sx={{ color: '#DFFF00', cursor: canIncrease ? 'pointer' : 'default', opacity: canIncrease ? 1 : 0.5 }}
            onClick={increase}
          />
        </Box>
        <Box px={4} py={0.5} display="flex" alignItems="center" justifyContent="center" bgcolor="#DFFF00">
          <Typography fontSize={12} align="center" color="#12140D">
            PRICE: {customFormat(totalPrice, 5)} ETH
          </Typography>
        </Box>
        <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
          <Box
            position="relative"
            width={mode === 'buy' ? '55px' : '28px'}
            borderRadius="50%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            sx={{ aspectRatio: '1/1', cursor: 'pointer', ...buyBtnStyle }}
            onClick={() => (mode !== 'buy' ? setMode('buy') : makeTxn())}>
            <Typography fontSize={mode === 'buy' ? 17 : 9} fontWeight={600}>
              BUY
            </Typography>
          </Box>
          <Box
            position="relative"
            width={mode === 'sell' ? '55px' : '28px'}
            borderRadius="50%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            sx={{ aspectRatio: '1/1', cursor: 'pointer', ...sellBtnStyle }}
            onClick={() => (mode !== 'sell' ? setMode('sell') : makeTxn())}>
            <Typography fontSize={mode === 'sell' ? 17 : 9} fontWeight={600}>
              SELL
            </Typography>
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
