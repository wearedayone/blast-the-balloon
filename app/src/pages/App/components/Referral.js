import { useState } from 'react';
import { Box, Grid, Typography, Button } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SendIcon from '@mui/icons-material/Send';

import CreateReferralCodeModal from './CreateReferralCodeModal';

const Referral = ({ referrals, refCode }) => {
  const [open, setOpen] = useState(false);

  return (
    <Box display="flex" flexDirection="column">
      <CreateReferralCodeModal open={open} onClose={() => setOpen(false)} />
      <Box position="relative">
        <img src="/images/ref-container.png" alt="ref-container" />
        <Box position="absolute" top={0} left={0} width="100%" height="100%" display="flex" flexDirection="column">
          <Box height="13%" display="flex" alignItems="center" gap={2}>
            <Box width="40%" pl="9%" display="flex" alignItems="center" justifyContent="center">
              <Typography fontSize={12}>REFERRALS ({referrals.length})</Typography>
              <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />
            </Box>
            <Box
              flex={1}
              display="flex"
              alignItems="center"
              pr={2}
              sx={{
                '& input': {
                  flex: 1,
                  fontSize: 8,
                  bgcolor: 'transparent',
                  border: 'none',
                  outline: 'none',
                },
              }}>
              <input placeholder="Enter referral code here..." />
              <SendIcon sx={{ fontSize: 14, color: 'black', cursor: 'pointer' }} />
            </Box>
          </Box>
          <Box flex={1} pb={1} display="flex" flexDirection="column" overflow="auto">
            <Box pt={0.5} px={1} pb={1} flex={1} overflow="auto" display="flex" flexDirection="column" gap={0.5}>
              {referrals.map((item) => (
                <Box
                  key={item.id}
                  height="45px"
                  display="flex"
                  alignItems="center"
                  p={0.5}
                  sx={{
                    background: 'linear-gradient(90deg, #979000 0%, rgba(151, 144, 0, 0) 100%)',
                  }}>
                  <Grid container>
                    <Grid item xs={6}>
                      <Box height="100%" display="flex" alignItems="center" gap={0.5}>
                        <Box
                          height="40px"
                          sx={{
                            aspectRatio: '1/1',
                            '& img': {
                              width: '100%',
                              height: '100%',
                              display: 'block',
                              objectPosition: 'center',
                              objectFit: 'cover',
                              border: '1px solid #12140D',
                            },
                          }}>
                          <img src={item.avatarURL} alt="avatar" />
                        </Box>
                        <Box height="100%" display="flex" flexDirection="column" justifyContent="center">
                          <Typography fontSize={8} fontWeight={200} color="#DFFF00" lineHeight="8px">
                            Name
                          </Typography>
                          <Typography color="#DFFF00" lineHeight="14px">
                            {item.username}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={3}>
                      <Box height="100%" display="flex" flexDirection="column" justifyContent="center">
                        <Typography fontSize={8} fontWeight={200} color="#DFFF00" lineHeight="8px" align="center">
                          Nodes
                        </Typography>
                        <Typography color="#DFFF00" lineHeight="14px" align="center">
                          {item.numberOfPump}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={3}>
                      <Box height="100%" display="flex" flexDirection="column" justifyContent="center">
                        <Typography fontSize={8} fontWeight={200} color="#DFFF00" lineHeight="8px" align="center">
                          Profit
                        </Typography>
                        <Box display="flex" justifyContent="center">
                          <Typography color="#DFFF00" lineHeight="14px" align="center">
                            {item.profit}
                          </Typography>
                          <Typography fontSize={10} color="#DFFF00" align="center" sx={{ alignSelf: 'flex-end' }}>
                            ETH
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
      {refCode ? (
        <Box display="flex" alignItems="center" gap={1}>
          <Box px={1} py={0.5} bgcolor="#DFFF00" display="flex" alignItems="center" gap={0.5}>
            <Typography fontSize={9} fontWeight={500}>
              REF CODE:
            </Typography>
            <Typography fontSize={8} color="#12140D">
              uponly.gg/{refCode}
            </Typography>
            <ContentCopyIcon
              sx={{ ml: 1, fontSize: 14, cursor: 'pointer' }}
              onClick={() => navigator.clipboard.writeText(refCode)}
            />
          </Box>
          <Typography fontSize={11} color="#DFFF00">
            Earn 10% On All Purchase
          </Typography>
        </Box>
      ) : (
        <Box>
          <Button
            sx={{
              px: 1,
              py: 0.5,
              bgcolor: '#DFFF00',
              borderRadius: 0,
              '&:active': {
                bgcolor: '#DFFF00',
              },
              '&:hover': {
                bgcolor: '#DFFF00',
              },
            }}
            onClick={() => setOpen(true)}>
            <Typography fontSize={9} fontWeight={500} color="black">
              CREATE REFERRAL CODE
            </Typography>
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Referral;
