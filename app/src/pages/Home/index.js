import { Box, Button } from '@mui/material';

import useAppContext from '../../hooks/\buseAppContext';

const Home = () => {
  const {
    walletState: { loading, connectWallet },
  } = useAppContext();

  return (
    <Box
      minHeight="100vh"
      p={2}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <Button variant="contained" disabled={loading} onClick={connectWallet}>
        {loading ? 'Connecting...' : 'Connect wallet'}
      </Button>
    </Box>
  );
};

export default Home;
