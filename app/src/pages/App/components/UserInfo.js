import { Box, Typography } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';

const UserInfo = ({ address, numberOfPump, disconnect }) => {
  return (
    <Box width="100%" display="flex" justifyContent="flex-end" gap={1}>
      <Box flexShrink={0} mt="12px" position="relative">
        <img src="/images/pump-container.png" alt="pump-container" />
        <Box
          position="absolute"
          top={0}
          left={0}
          p={1}
          width="100%"
          height="100%"
          display="flex"
          flexDirection="column">
          <Typography fontSize={14} color="#DFFF00" align="center" lineHeight="18px">
            PUMPS
          </Typography>
          <Typography
            fontSize={numberOfPump < 100 ? 40 : 30}
            fontWeight={700}
            fontFamily="Open Sans, sans-serif"
            color="white"
            align="center"
            lineHeight="30px">
            {numberOfPump}
          </Typography>
        </Box>
      </Box>
      <Box flexShrink={1} position="relative">
        <img src="/images/profile-container.png" alt="profile-container" style={{ maxWidth: '100%' }} />
        <Box position="absolute" top="5%" left="42%" display="flex" alignItems="center">
          <Typography fontSize={14} fontWeight={300} fontFamily="Oswald, sans-serif" color="#DFFF00">
            YOUR WALLET
          </Typography>
        </Box>
        <Box
          px={0.5}
          position="absolute"
          top="18%"
          left="3%"
          width="60%"
          // bgcolor="red"
          display="flex"
          alignItems="center"
          justifyContent="space-between">
          <Typography fontSize={20} fontFamily="Oswald, sans-serif" color="white">
            {address.slice(0, 4)}...{address.slice(-4)}
          </Typography>
          <LogoutIcon sx={{ fontSize: 20, color: 'white', cursor: 'pointer' }} onClick={disconnect} />
        </Box>
      </Box>
    </Box>
  );
};

export default UserInfo;
