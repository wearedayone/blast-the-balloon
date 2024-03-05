import { Box, Typography } from '@mui/material';

import { customFormat } from '../../../utils/numbers';

const Winner = ({ ended, winners, rewards }) => {
  if (!ended) return;

  return (
    <Box
      position="absolute"
      top="calc(50% + 30px)"
      left="50%"
      sx={{
        transform: 'translate(-50%, -50%)',
        '& img': {
          width: `32vw`,
        },
      }}>
      <img src="/images/winner.png" alt="winner" />
      <Box
        position="absolute"
        top={0}
        left={0}
        p={0.5}
        width="100%"
        height="100%"
        display="flex"
        flexDirection="column"
        gap={1}>
        <Box display="flex" pt="0.5%">
          <Box width="45%" />
          <Box flex={1}>
            <Typography fontSize={16} align="center">
              {winners[0]?.username}
            </Typography>
          </Box>
          <Box width="20%" />
        </Box>
        <Box
          pt="5%"
          flex={1}
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={1}
          sx={{
            '& img': {
              borderRadius: '50%',
              width: '30%',
              aspectRatio: '1/1',
              objectFit: 'cover',
              objectPosition: 'center',
            },
          }}>
          <img src={winners[0]?.avatarURL} alt="avt" />
          <Box>
            <Typography fontSize={40} align="center" lineHeight="40px">
              CONGRATULATIONS!
            </Typography>
            <Typography
              fontSize={60}
              fontWeight={500}
              fontFamily="Oswald, sans-serif"
              color="#DFFF00"
              align="center"
              lineHeight="60px">
              {customFormat(rewards[0] || 0, 6)}ETH
            </Typography>
          </Box>
        </Box>
        <Box flex={1} pl="3.5%" pr="2.5%" pb="20%" display="flex" alignItems="center" justifyContent="center" gap="10%">
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
              <img src={item.avatarURL} alt="avatar" />
              <Box>
                <Typography
                  fontSize={15}
                  fontFamily="Oswald, sans-serif"
                  color="#DFFF00"
                  align="center"
                  lineHeight="15px">
                  {item.username}
                </Typography>
                <Typography
                  fontSize={15}
                  fontFamily="Oswald, sans-serif"
                  color="#DFFF00"
                  align="center"
                  lineHeight="15px">
                  {customFormat(rewards[index + 1] || 0, 6)}ETH
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Winner;
