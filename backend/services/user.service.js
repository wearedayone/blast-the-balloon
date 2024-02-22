import { verifyMessage } from '@ethersproject/wallet';
import { faker } from '@faker-js/faker';

import admin, { firestore } from '../configs/firebase.config.js';
import { getActiveSeasonId } from './season.service.js';

const CODE_LENGTH = 8;

export const generateCode = (length) => {
  const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let retVal = '';
  for (let i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n)).toLowerCase();
  }
  return retVal;
};

export const createUserRecord = async ({ message, signature }) => {
  const recoveredAddress = verifyMessage(message, signature).toLowerCase();

  const snapshot = await firestore.collection('user').doc(recoveredAddress).get();
  if (!snapshot.exists) {
    let validReferralCode = false;
    let referralCode = generateCode(CODE_LENGTH);
    while (!validReferralCode) {
      const code = await firestore.collection('user').where('referralCode', '==', referralCode).limit(1).get();
      if (code.empty) {
        validReferralCode = true;
      } else {
        referralCode = generateCode(CODE_LENGTH);
      }
    }

    const username = faker.internet.userName();
    await firestore
      .collection('user')
      .doc(recoveredAddress)
      .set({
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        username,
        avatarURL: `https://placehold.co/400x400/1e90ff/FFF?text=${username[0].toUpperCase()}`,
        address: recoveredAddress,
        referralCode,
        inviteCode: '',
        referralReward: 0,
        holderReward: 0,
      });

    const activeSeasonId = await getActiveSeasonId();
    await firestore.collection('gamePlay').add({
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      userId: recoveredAddress,
      seasonId: activeSeasonId,
      numberOfPump: 0,
      lastPurchaseTime: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
};

export const addUserRefCode = async ({ message, signature, refCode }) => {
  const recoveredAddress = verifyMessage(message, signature).toLowerCase();

  // add refCode for user with uid === recoveredAddress
};
