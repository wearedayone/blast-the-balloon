import { Box, CircularProgress, Modal, Typography, alpha } from '@mui/material';

const Loading = ({ open, onClose }) => {
  return (
    <Modal open={open} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
      <Box
        position="absolute"
        top="50%"
        left="50%"
        width={500}
        bgcolor="white"
        p={4}
        pt={3}
        borderRadius="10px"
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={3}
        sx={{
          transform: 'translate(-50%, -50%)',
        }}>
        <Box width="100%" height={100} display="flex" justifyContent="center" alignItems="center" position="relative">
          <CircularProgress color="warning" size={96} sx={{ position: 'absolute' }} />
          <img src="/images/metamask.webp" alt="metamask" width={50} height={50} />
        </Box>
        <Typography align="center">Processing transaction...</Typography>
      </Box>
    </Modal>
  );
};

export default Loading;
