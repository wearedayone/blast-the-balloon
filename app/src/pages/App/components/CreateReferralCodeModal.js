import { useEffect, useState } from 'react';
import { Dialog, Box, Typography, Button, alpha } from '@mui/material';
import { useSnackbar } from 'notistack';

import useAppContext from '../../../hooks/useAppContext';

const CreateReferralCodeModal = ({ open, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();
  const {
    userState,
    smartContractState: { createReferralCode },
  } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    inviteCode: userState.user?.inviteCode || '',
    username: userState.user?.username || '',
    referralCode: userState.user?.referralCode || '',
  });

  const updateData = (obj) =>
    setData({
      ...data,
      ...obj,
    });

  const submit = async () => {
    if (loading || !data.username.trim() || !data.referralCode.trim()) return;
    setLoading(true);

    try {
      await createReferralCode(data);
      onClose();
      enqueueSnackbar('Register code successfully', { variant: 'success' });
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  useEffect(() => {
    setData({
      inviteCode: userState.user?.inviteCode || '',
      username: userState.user?.username || '',
      referralCode: userState.user?.referralCode || '',
    });
  }, [userState.user?.inviteCode, userState.user?.username, userState.user?.referralCode]);

  return (
    <Dialog open={open} onClose={onClose}>
      <Box
        p={2}
        display="flex"
        gap={1}
        bgcolor="black"
        sx={{
          // background:
          //   'linear-gradient(0deg, rgba(90,0,255,1) 0%, rgba(0,0,0,1) 0%, rgba(68,77,14,1) 5%, rgba(226,255,45,1) 100%, rgba(255,148,252,1) 100%)',
          '& input': {
            bgcolor: 'transparent',
            px: 2,
            py: 1,
            border: '1px solid #F0FF92',
            borderRadius: 1,
            outline: 'none',
            height: 34,
            minWidth: 0,
            color: '#F0FF92',
          },
        }}>
        <Box width="35%" display="flex" flexDirection="column" justifyContent="flex-end" gap={1}>
          <Typography color="#F0FF92">Your username</Typography>
          <input
            value={data.username}
            onChange={(e) => updateData({ username: e.target.value.trim() })}
            placeholder="Username"
          />
        </Box>
        <Box width="35%" display="flex" flexDirection="column" justifyContent="flex-end" gap={1}>
          <Typography color="#F0FF92">Your referral code</Typography>
          <input
            value={data.referralCode}
            onChange={(e) => updateData({ referralCode: e.target.value.trim() })}
            placeholder="Referral code"
          />
        </Box>
        <Box flex={1} display="flex" flexDirection="column" justifyContent="flex-end" gap={1}>
          <Button
            variant="outlined"
            sx={{
              height: 34,
              color: '#F0FF92',
              borderColor: '#F0FF92',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
                borderColor: '#F0FF92',
                bgcolor: alpha('#F0FF92', 0.4),
              },
              '&:active': { boxShadow: 'none', borderColor: '#F0FF92' },
              '&:disabled': { color: '#F0FF92', borderColor: '#F0FF92', opacity: 0.4 },
            }}
            disabled={loading || !data.username.trim() || !data.referralCode.trim()}
            onClick={submit}>
            {loading ? 'Loading...' : 'Create'}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default CreateReferralCodeModal;
