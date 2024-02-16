import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material';
import { SnackbarProvider } from 'notistack';

import './index.css';
import App from './App';
import { AppContextProvider } from './contexts/app.context';

const theme = createTheme({
  typography: {
    fontFamily: "'Palanquin Dark', sans-serif",
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}>
        <ThemeProvider theme={theme}>
          <AppContextProvider>
            <App />
          </AppContextProvider>
        </ThemeProvider>
      </SnackbarProvider>
    </BrowserRouter>
  </React.StrictMode>
);
