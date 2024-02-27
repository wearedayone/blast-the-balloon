import { useEffect, useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useSnackbar } from 'notistack';

import useAppContext from '../../../hooks/useAppContext';

const CreateReferralCodeModal = ({ onClose }) => {
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
    <Box flex={1} position="absolute" bottom={0} left="45%" sx={{ transform: 'translateY(calc(100% - 25px))' }}>
      <img src="/images/create-referral-container.png" alt="container" />
      <Box
        position="absolute"
        p={1}
        top={0}
        left={0}
        width="100%"
        height="100%"
        display="flex"
        flexDirection="column"
        jsutifyContent="center"
        gap={1}
        sx={{
          '& input': {
            minWidth: 0,
            width: '120px',
            border: 'none',
            outline: 'none',
            bgcolor: 'transparent',
            borderBottom: '2px solid white',
            color: 'white',
          },
        }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
          <Typography fontSize={12} fontWeight={500} color="white">
            ENTER YOUR USERNAME
          </Typography>
          <input
            value={data.username}
            onChange={(e) => updateData({ username: e.target.value.trim() })}
            placeholder="Username"
          />
        </Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
          <Typography fontSize={12} fontWeight={500} color="white">
            ENTER YOUR CODE
          </Typography>
          <input
            value={data.referralCode}
            onChange={(e) => updateData({ referralCode: e.target.value.trim() })}
            placeholder="Referral code"
          />
        </Box>
        <Box display="flex" justifyContent="center">
          <Button
            disabled={loading || !data.username.trim() || !data.referralCode.trim()}
            sx={{
              width: '85px',
              height: '20px',
              bgcolor: '#979000',
              outline: 'none',
              border: 'none',
              boxShadow: 'none',
              fontSize: 10,
              fontWeight: 700,
              fontFamily: 'Oswald, sans-serif',
              color: '#43411C',
              '&:active': {
                bgcolor: '#979000',
              },
              '&:focus': {
                bgcolor: '#979000',
              },
              '&:disabled': {
                opacity: 0.5,
              },
            }}
            onClick={submit}>
            {loading ? 'Loading...' : 'Create'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default CreateReferralCodeModal;
