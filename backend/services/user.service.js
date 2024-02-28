import { verifyMessage } from '@ethersproject/wallet';
import { faker } from '@faker-js/faker';

import admin, { firestore } from '../configs/firebase.config.js';
import { getActiveSeasonId } from './season.service.js';

export const createUserRecord = async ({ message, signature }) => {
  const recoveredAddress = verifyMessage(message, signature).toLowerCase();

  const snapshot = await firestore.collection('user').doc(recoveredAddress).get();
  if (!snapshot.exists) {
    let validUsername = false;
    let username = faker.internet.userName();
    while (!validUsername) {
      const existedSnapshot = await firestore.collection('user').where('username', '==', username).limit(1).get();
      if (existedSnapshot.empty) {
        validUsername = true;
      } else {
        username = faker.internet.userName();
      }
    }

    await firestore
      .collection('user')
      .doc(recoveredAddress)
      .set({
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        username,
        avatarURL: faker.image.url({ width: 400, height: 400 }),
        address: recoveredAddress,
        referralCode: '',
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

export const addUserRefCode = async ({ message, signature, inviteCode }) => {
  const recoveredAddress = verifyMessage(message, signature).toLowerCase();

  const snapshot = await firestore.collection('user').where('referralCode', '==', inviteCode).limit(1).get();
  if (snapshot.empty) throw new Error('Invalid invite code');
  if (snapshot.docs[0].id === recoveredAddress) throw new Error('Invalid invite code');

  await firestore.collection('user').doc(recoveredAddress).set({ inviteCode }, { merge: true });
};
