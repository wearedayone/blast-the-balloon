import api from './api';

export const createUser = ({ message, signature }) => api.post('/api/v1/users/connect', { message, signature });
