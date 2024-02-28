import axios from 'axios';

import environments from '../utils/environments';

const { API_URL } = environments;

console.log({ API_URL });

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (err) => {
    console.log({ err });
    const error = (err.response && err.response.data) || err.message;
    const message = error.startsWith('API error') ? error.replace('API error: ', '') : error;
    throw new Error(message);
  }
);

export default api;
