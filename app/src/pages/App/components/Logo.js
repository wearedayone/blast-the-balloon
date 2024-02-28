import { Box } from '@mui/material';

const Logo = () => {
  return (
    <Box sx={{ transform: 'translateY(-15%)' }}>
      <img src="/images/blast-balloon.png" alt="logo" width={264} height={100} style={{ objectFit: 'cover' }} />
    </Box>
  );
};

export default Logo;
