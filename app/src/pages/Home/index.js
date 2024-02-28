import { Box, Button, Typography } from '@mui/material';

import useAppContext from '../../hooks/useAppContext';

const Home = () => {
  const {
    walletState: { loading, connectWallet },
  } = useAppContext();

  return (
    <Box minHeight="100vh" bgcolor="#1b1b1b">
      <Box
        minHeight="100vh"
        p={2}
        display="flex"
        flexDirection="column"
        alignItems="center"
        sx={{
          background: 'url(/images/background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        position="relative">
        <Box width="100%" py={1} px={3}>
          <img src="/images/uncharted.png" alt="Uncharted" width={200} />
        </Box>
        <img
          src="/images/blast-balloon.png"
          alt="Blast the balloon"
          width={700}
          style={{ marginTop: -100, marginBottom: -80 }}
        />
        <img src="/images/wave.png" alt="Blast the balloon" width={900} style={{ position: 'absolute', top: 400 }} />
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          gap={1}
          px={9}
          width={500}
          height={350}
          sx={{
            backgroundImage: 'url(/images/login-frame.svg)',
            backgroundSize: 'contain',
            '& .MuiButton-root': {
              borderRadius: 0,
              boxShadow: 'none',
              backgroundColor: '#DFFF00',
              color: '#12140D',
              letterSpacing: 3.5,
              fontWeight: 400,
              fontSize: 22,
              justifyContent: 'flex-start',
              transition: 'all 0.3s ease',
              '&:hover': {
                opacity: 0.8,
                backgroundColor: '#DFFF00',
                boxShadow: 'none',
              },
              '& .MuiButton-startIcon': { marginRight: 0 },
            },
          }}>
          <Typography fontSize={25} color="white">
            Connect wallet
          </Typography>
          <Button
            variant="contained"
            disabled={loading}
            onClick={connectWallet}
            startIcon={<img src="/images/metamask.svg" alt="" width={40} />}
            sx={{ mb: 1 }}>
            {loading ? 'Connecting...' : 'Metamask'}
          </Button>
          <Button
            variant="contained"
            disabled={loading}
            onClick={connectWallet}
            startIcon={<img src="/images/wallet-connect.svg" alt="" width={40} />}>
            {loading ? 'Connecting...' : 'WalletConnect'}
          </Button>
          <Typography fontSize={12} fontFamily="Oswald" fontWeight={200} color="white">
            By using Blast the Balloon you agree to our{' '}
            <a
              href="/terms-of-service"
              target="_blank"
              style={{ color: '#DFFF00', fontWeight: 400, textDecoration: 'none' }}>
              TERMS OF SERVICE
            </a>{' '}
            and{' '}
            <a
              href="/privacy-policy"
              target="_blank"
              style={{ color: '#DFFF00', fontWeight: 400, textDecoration: 'none' }}>
              PRIVACY POLICY
            </a>
            .
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Home;
