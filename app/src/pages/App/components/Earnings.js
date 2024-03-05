import { useMemo, useState } from 'react';
import { Box, Button, IconButton, Menu, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useSnackbar } from 'notistack';

import { customFormat } from '../../../utils/numbers';
import useAppContext from '../../../hooks/useAppContext';

const isBigScreen = window.screen.height > 1000;

ChartJS.register(ArcElement, Tooltip, Legend);

const Earnings = ({ referralReward, holderReward, lockedValue = Math.random(), address, ethPriceInUsd }) => {
  const total = useMemo(() => referralReward + holderReward + lockedValue, [referralReward, holderReward, lockedValue]);

  const gap = useMemo(() => total * 0.01, [total]);

  const data = useMemo(
    () => [referralReward, gap, holderReward, gap, lockedValue, gap],
    [gap, referralReward, holderReward, lockedValue]
  );

  const getStyledDonutSections = ({ density }) =>
    Array.from({ length: density }, (_, index) => {
      const getPartialLine = (sectionStart, sectionWeight, percentStart, percentEnd) =>
        index >= ((sectionStart + sectionWeight * percentStart) / total) * density &&
        index + 2 < ((sectionStart + sectionWeight * percentEnd) / total) * density;
      const dashedLine = index % 2;

      const referralSection =
        getPartialLine(0, referralReward, 0, 0.05) ||
        (dashedLine && getPartialLine(0, referralReward, 0.15, 0.6)) ||
        getPartialLine(0, referralReward, 0.7, 1);
      const holderSection = getPartialLine(referralReward, holderReward, 0, 1);
      const lockedSection =
        getPartialLine(referralReward + holderReward, lockedValue, 0, 0.1) ||
        (dashedLine && getPartialLine(referralReward + holderReward, lockedValue, 0.2, 0.6)) ||
        getPartialLine(referralReward + holderReward, lockedValue, 0.7, 1);

      return referralSection || holderSection || lockedSection ? '#7c8e0b' : 'transparent';
    });

  return (
    <Box position="relative" p={2} sx={{ '& canvas': { width: '30vh !important', height: '30vh !important' } }}>
      <Doughnut
        data={{
          labels: ['Referral', "Holder's", 'Locked'],
          datasets: [
            {
              data,
              backgroundColor: getDonutRingColors('#dfff02'),
              borderWidth: 0,
              weight: 5,
            },
            getDonutRingSpacer(),
            {
              data,
              backgroundColor: getDonutRingColors('white'),
              borderWidth: 0,
            },
            getDonutRingSpacer(),
            {
              data,
              backgroundColor: getDonutRingColors('#dfff02'),
              borderWidth: 0,
            },
            getDonutRingSpacer(5),
            {
              data: Array.from({ length: 200 }, (_, index) => (index % 2 ? 1 : 1)),
              backgroundColor: getStyledDonutSections({ density: 200 }),
              borderWidth: 0,
              weight: 8,
            },
            getDonutRingSpacer(8),
            {
              data,
              backgroundColor: getDonutRingColors('#979000'),
              borderWidth: 0,
              weight: 3,
            },
            getDonutRingSpacer(5),
            {
              data: Array.from({ length: 100 }, (_, index) => (index % 2 ? 1 : 3)),
              backgroundColor: Array.from({ length: 100 }, (_, index) =>
                index % 2 &&
                index + 2 !== Math.round((referralReward / total) * 100) &&
                index + 2 !== Math.round(((referralReward + gap + holderReward) / total) * 100) &&
                index !== 99
                  ? '#7c8e0b'
                  : 'transparent'
              ),
              borderWidth: 0,
              weight: 20,
            },
          ],
        }}
        options={{
          cutout: isBigScreen ? '55%' : 75,
          animation: false,
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
          },
        }}
      />
      <Doughnut
        style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        data={{
          labels: ['Referral', '', "Holder's", '', 'Locked'],
          datasets: [
            {
              data: [
                { id: 'referral-1', value: referralReward },
                { id: 'gap-1-1', value: gap },
                { id: 'holder-1', value: holderReward },
                { id: 'gap-1-2', value: gap },
                { id: 'locked-1', value: lockedValue },
                { id: 'gap-1-3', value: gap },
              ],
              backgroundColor: [
                'rgba(255, 255, 255, 0)',
                'transparent',
                'rgba(151, 144, 0, 0.4)',
                'transparent',
                'rgba(223, 255, 0, 0.4)',
                'transparent',
              ],
              borderWidth: 0,
            },
          ],
        }}
        options={{
          cutout: isBigScreen ? '50%' : 70,
          animation: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#979000',
              displayColors: false,
              cornerRadius: 5,
              titleColor: 'white',
              titleFont: { family: 'Oswald', weight: 400, size: 13 },
              bodyFont: { family: 'Oswald', weight: 500, size: 14 },
              bodyAlign: 'center',
            },
          },
        }}
      />
      <Box
        sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        display="flex"
        flexDirection="column"
        gap={0.5}>
        <Box position="relative" px={3}>
          <Typography fontSize={30} color="#DFFF00" align="center">
            {customFormat(total, 3)}
          </Typography>
          <EarningsInfo />
        </Box>
        <Typography fontSize={10} color="#979000" align="center" fontFamily="Oxygen">
          TOTAL EARNINGS
        </Typography>
        <Withdraw address={address} total={total} ethPriceInUsd={ethPriceInUsd} />
      </Box>
    </Box>
  );
};

const EarningsInfo = () => {
  const [tooltipAnchorEl, setTooltipAnchorEl] = useState(null);

  const onCloseToolTip = () => setTooltipAnchorEl(null);

  return (
    <>
      <IconButton
        id="earnings-info-button"
        onClick={(e) => setTooltipAnchorEl(e.currentTarget)}
        sx={{ position: 'absolute', right: 0, top: 0 }}>
        <InfoOutlinedIcon sx={{ fontSize: 16 }} htmlColor="#DFFF00" />
      </IconButton>
      <Menu
        id="earnings-info-menu"
        aria-labelledby="earnings-info-button"
        anchorEl={tooltipAnchorEl}
        open={Boolean(tooltipAnchorEl)}
        onClose={onCloseToolTip}
        onClick={(e) => {
          if (!e.target.className.includes('earnings-info-content')) onCloseToolTip();
        }}
        anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        PaperProps={{
          sx: {
            boxShadow: 'none',
            backgroundColor: 'transparent',
            '& ul': { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' },
          },
        }}>
        <Box
          className="earnings-info-content"
          width={300}
          p={0.5}
          sx={{
            backgroundImage: 'linear-gradient(180deg, #979000 0%, rgba(151, 144, 0, 0) 100%)',
            '& .MuiTypography-root': { color: 'white', fontFamily: 'Oswald' },
          }}>
          <Typography className="earnings-info-content" fontSize={13} fontWeight={500} textTransform="uppercase">
            Referral
          </Typography>
          <Typography className="earnings-info-content" fontSize={11} fontWeight={200} sx={{ mt: -0.25, mb: 0.25 }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
            ea commodo consequat
          </Typography>
          <Typography className="earnings-info-content" fontSize={13} fontWeight={500} textTransform="uppercase">
            Holder&apos;s
          </Typography>
          <Typography className="earnings-info-content" fontSize={11} fontWeight={200} sx={{ mt: -0.25, mb: 0.25 }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
            ea commodo consequat
          </Typography>
          <Typography className="earnings-info-content" fontSize={13} fontWeight={500} textTransform="uppercase">
            Locked
          </Typography>
          <Typography className="earnings-info-content" fontSize={11} fontWeight={200} sx={{ mt: -0.25, mb: 0.25 }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
            ea commodo consequat
          </Typography>
        </Box>
        <img src="/images/connector-long.png" alt="" width={400} />
      </Menu>
    </>
  );
};

const Withdraw = ({ address, total, ethPriceInUsd }) => {
  const { enqueueSnackbar } = useSnackbar();
  const {
    smartContractState: { withdraw },
  } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [tooltipAnchorEl, setTooltipAnchorEl] = useState(null);

  const onCloseToolTip = () => setTooltipAnchorEl(null);
  const submit = async () => {
    if (loading) return;
    setLoading(true);

    try {
      await withdraw();
      enqueueSnackbar('Withdrawed successfully', { variant: 'success' });
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <>
      <Button
        variant="contained"
        size="small"
        sx={{
          borderRadius: 40,
          fontFamily: 'Oxygen',
          backgroundColor: '#DFFF00',
          color: '#12140D',
          '&:hover': { backgroundColor: '#c8e500' },
        }}
        onClick={(e) => setTooltipAnchorEl(e.currentTarget)}>
        Withdraw
      </Button>
      <Menu
        id="withdraw-info-menu"
        aria-labelledby="withdraw-info-button"
        anchorEl={tooltipAnchorEl}
        open={Boolean(tooltipAnchorEl)}
        onClose={onCloseToolTip}
        onClick={(e) => {
          if (!e.target.className.includes('withdraw-info-content')) onCloseToolTip();
        }}
        anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        PaperProps={{
          sx: {
            boxShadow: 'none',
            backgroundColor: 'transparent',
            '& ul': { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' },
          },
        }}>
        <Box
          className="withdraw-info-content"
          width={300}
          p={0.5}
          sx={{
            backgroundImage: 'linear-gradient(180deg, #979000 0%, rgba(151, 144, 0, 0) 100%)',
            // '& .MuiTypography-root': { color: 'white', fontFamily: 'Oswald' },
          }}>
          <Typography className="withdraw-info-content" color="white" fontWeight={500} textTransform="uppercase">
            WITHDRAW YOUR FUNDS
          </Typography>
          <Typography className="withdraw-info-content" fontSize={12} color="#DFFF00">
            YOUR WALLET
          </Typography>
          <Box bgcolor="#DFFF00" p={0.5} mb={1}>
            <Typography className="withdraw-info-content" fontFamily="Oswald" fontSize={15}>
              {address}
            </Typography>
          </Box>
          <Typography
            className="withdraw-info-content"
            fontFamily="Oswald"
            color="white"
            fontSize={11}
            fontWeight={200}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
            ea commodo consequat
          </Typography>
          <Typography
            className="withdraw-info-content"
            color="white"
            fontSize={12}
            fontWeight={500}
            textTransform="uppercase">
            You will receive:{' '}
            <span style={{ fontFamily: 'Oswald', color: '#DFFF00' }}>
              {customFormat(ethPriceInUsd * total, 1)} DOLLARS ({customFormat(total, 3)}ETH){' '}
            </span>
          </Typography>
          <Button
            className="withdraw-info-content"
            variant="contained"
            size="small"
            sx={{
              px: 3,
              mt: 1,
              mb: 2,
              borderRadius: 0,
              backgroundColor: '#DFFF00',
              color: '#12140D',
              '&:hover': { backgroundColor: '#c8e500' },
            }}
            onClick={submit}>
            {loading ? 'Processing...' : 'Withdraw'}
          </Button>
        </Box>
        <img src="/images/connector-long.png" alt="" width={400} />
      </Menu>
    </>
  );
};

export default Earnings;

// helpers

const getDonutRingColors = (color) => [color, 'transparent', color, 'transparent', color, 'transparent'];
const getDonutRingSpacer = (weight = 3) => ({
  data: [1],
  backgroundColor: ['transparent'],
  borderWidth: 0,
  weight,
});
