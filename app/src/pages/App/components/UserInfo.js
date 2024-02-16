import { Box, Typography } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';

const UserInfo = ({ username, avatarURL, address, numberOfPump }) => {
  return (
    <Box display="flex" gap={0.5} sx={{ transform: 'translateX(-10px)' }}>
      <Box position="relative">
        <img src="/images/profile-container.png" alt="profile-container" />
        <Box
          position="absolute"
          width="100%"
          height="100%"
          top={0}
          left={0}
          px="7%"
          display="flex"
          alignItems="center"
          gap="17%"
          sx={{
            '& .avatar': {
              display: 'block',
              width: 75,
              aspectRatio: '1/1',
              clipPath: 'polygon(100% 0, 100% 60%, 60% 100%, 0 100%, 0 0)',
            },
          }}>
          <img className="avatar" src={avatarURL || '/images/default-avatar.jpeg'} alt="avatar" />
          <Box mt="5%" flex={1} display="flex" flexDirection="column" gap={0.5}>
            <Box position="relative">
              <img src="/images/user-info-container.png" alt="user-info-container" />
              <Box
                position="absolute"
                top={0}
                left={0}
                width="100%"
                height="100%"
                pb={1}
                display="flex"
                alignItems="center"
                gap={1}>
                <PersonOutlineIcon sx={{ fontSize: 20, color: '#F0FF92' }} />
                <Box flex={1} display="flex" alignItems="center">
                  <Typography fontSize={20} color="#F0FF92">
                    {username || 'Unknown user'}
                  </Typography>
                </Box>
                <ArrowForwardIosIcon sx={{ fontSize: 14, color: '#F0FF92' }} />
              </Box>
            </Box>
            <Box position="relative">
              <img src="/images/user-info-container.png" alt="user-info-container" />
              <Box
                position="absolute"
                top={0}
                left={0}
                width="100%"
                height="100%"
                pb={1}
                display="flex"
                alignItems="center"
                gap={1}>
                <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 20, color: '#F0FF92' }} />
                <Box flex={1} display="flex" alignItems="center">
                  <Typography fontSize={20} color="#F0FF92">
                    {address.slice(0, 4)}...{address.slice(-4)}
                  </Typography>
                </Box>
                <ArrowForwardIosIcon sx={{ fontSize: 14, color: '#F0FF92' }} />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box mt="21px" position="relative">
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
          <Typography fontSize={14} color="#979000" align="center" lineHeight="14px">
            PUMPS
          </Typography>
          <Typography
            fontSize={numberOfPump < 100 ? 40 : 30}
            fontWeight={700}
            color="#DFFF00"
            align="center"
            lineHeight="30px">
            {numberOfPump}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default UserInfo;
