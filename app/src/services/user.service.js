import api from './api';

export const createUser = ({ message, signature }) => api.post('/api/v1/users/connect', { message, signature });

export const addInviteCode = ({ message, signature, inviteCode }) =>
  api.post('/api/v1/users/invite-code', { message, signature, inviteCode });
