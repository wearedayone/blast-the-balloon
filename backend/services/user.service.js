import { verifyMessage } from '@ethersproject/wallet';

import { firestore } from '../configs/firebase.config.js';

export const addUserRefCode = async ({ message, signature, refCode }) => {
  const recoveredAddress = verifyMessage(message, signature).toLowerCase();

  // add refCode for user with uid === recoveredAddress
};
