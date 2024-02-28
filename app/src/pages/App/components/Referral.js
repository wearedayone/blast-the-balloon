import { useState } from 'react';
import { Box, Grid, Typography, Button } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SendIcon from '@mui/icons-material/Send';
import { useSnackbar } from 'notistack';

import CreateReferralCodeModal from './CreateReferralCodeModal';
import useAppContext from '../../../hooks/useAppContext';
import { customFormat } from '../../../utils/numbers';

const Referral = ({ referrals, refCode }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [openInstruction, setOpenInstruction] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const {
    walletState: { addUserInviteCode },
  } = useAppContext();

  const submit = async () => {
    if (loading || !inviteCode.trim()) return;
    setLoading(true);

    try {
      await addUserInviteCode({ inviteCode });
      enqueueSnackbar('Add invite code successfully', { variant: 'success' });
    } catch (err) {
      console.error(err);
      enqueueSnackbar(err.message, { variant: 'error' });
    }

    setLoading(false);
  };

  return (
    <Box width="100%" display="flex" flexDirection="column">
      <Box position="relative">
        <img src="/images/ref-container.png" alt="ref-container" style={{ maxWidth: '100%' }} />
        <Box position="absolute" top="-20px" left="100%" sx={{ '& img': { cursor: 'pointer' } }}>
          <img src="/images/info-btn.png" alt="info" onClick={() => setOpenInstruction(!openInstruction)} />
        </Box>
        {openInstruction && (
          <Box
            position="absolute"
            top="-20px"
            left="calc(100% + 20px)"
            p={1}
            width="288px"
            sx={{ background: 'linear-gradient(180deg, #979000 0%, rgba(151, 144, 0, 0) 100%)' }}>
            <Typography fontSize={13} fontWeight={500} fontFamily="Oswald, sans-serif" color="white">
              REFERRAL
            </Typography>
            <Typography fontSize={12} fontWeight={200} fontFamily="Oswald, sans-serif" color="white">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
              ea commodo consequat
            </Typography>
          </Box>
        )}
        <Box position="absolute" top={0} left={0} width="100%" height="100%" display="flex" flexDirection="column">
          <Box height="13%" display="flex" alignItems="center" gap={2}>
            <Box width="40%" pl="9%" display="flex" alignItems="center" justifyContent="center">
              <Typography fontFamily="'Palanquin Dark', sans-serif" fontSize={12}>
                REFERRALS ({referrals.length})
              </Typography>
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
              <input
                placeholder="Enter referral code here..."
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.trim())}
              />
              <SendIcon sx={{ fontSize: 14, color: 'black', cursor: 'pointer' }} onClick={submit} />
            </Box>
          </Box>
          <Box>
            <Grid container>
              <Grid item xs={5}>
                <Box>
                  <Typography fontSize={12} fontFamily="Oswald" color="white" align="center">
                    NAME
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box>
                  <Typography fontSize={12} fontFamily="Oswald" color="white" align="center">
                    NODES
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box>
                  <Typography fontSize={12} fontFamily="Oswald" color="white" align="center">
                    PROFIT
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
          <Box flex={1} pb={1} display="flex" flexDirection="column" overflow="auto">
            <Box pt={0.5} px={1} pb={1} flex={1} overflow="auto" display="flex" flexDirection="column" gap={0.5}>
              {!!referrals.length &&
                referrals.map((item) => (
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
                      <Grid item xs={5}>
                        <Box>
                          <Typography fontSize={15} color="white" align="center">
                            {item.username}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={3}>
                        <Box>
                          <Typography fontSize={15} color="white" align="center">
                            {item.numberOfPump}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box>
                          <Typography fontSize={15} color="white" align="center">
                            {customFormat(item.profit, 5)} ETH
                          </Typography>
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
        <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
          <Box px={1} py={0.5} bgcolor="white" display="flex" alignItems="center" gap={0.5}>
            <Typography fontSize={12} fontWeight={500} color="#12140D">
              REF CODE:
            </Typography>
            <Typography fontSize={12} color="#12140D">
              uponly.gg/{refCode}
            </Typography>
            <ContentCopyIcon
              sx={{ ml: 1, fontSize: 14, cursor: 'pointer' }}
              onClick={() => navigator.clipboard.writeText(refCode)}
            />
          </Box>
          <Typography fontSize={12} fontFamily="Oxygen, sans-serif" color="#DFFF00">
            Earn 10% On All Purchase
          </Typography>
        </Box>
      ) : (
        <Box
          position="relative"
          display="flex"
          alignItems={open ? 'flex-start' : 'center'}
          justifyContent="space-between"
          gap={1}>
          <Button
            sx={{
              px: 1,
              py: 0.5,
              bgcolor: 'white',
              borderRadius: 0,
              '&:active': {
                bgcolor: 'white',
              },
              '&:hover': {
                bgcolor: 'white',
              },
            }}
            onClick={() => setOpen(!open)}>
            <Typography fontSize={12} fontWeight={500} color="#12140D">
              CREATE REFERRAL CODE
            </Typography>
          </Button>
          {open ? (
            <CreateReferralCodeModal onClose={() => setOpen(false)} />
          ) : (
            <Typography fontSize={12} fontFamily="Oxygen, sans-serif" color="#DFFF00">
              Earn 10% On All Purchase
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Referral;
