import axios from 'axios';

import admin, { firestore } from '../configs/firebase.config.js';
import gameConfigs from '../configs/game.config.js';

const main = async () => {
  const seasonId = '1';

  // system
  await firestore.collection('system').doc('config').set({ activeSeasonId: seasonId });
  const ethPriceRes = await axios.get('https://api.coinbase.com/v2/exchange-rates?currency=ETH');
  await firestore.collection('system').doc('market').set({ ethPriceInUsd: ethPriceRes.data.data.rates.USD });

  // season
  const now = Date.now();
  await firestore
    .collection('season')
    .doc(seasonId)
    .set({
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      startTime: admin.firestore.Timestamp.fromMillis(startTimeUnix * 1000),
      estimatedEndTime: admin.firestore.Timestamp.fromMillis(endTimeUnix * 1000),
      maxEndTime: admin.firestore.Timestamp.fromMillis(maxEndTimeUnix * 1000),
      pauseBetweenSeason: gameConfigs.pauseBetweenSeason,
      prizePool,
      endGameJackpot: eJackpot,
      pumpBought: pumpB,
      pumpSold: pumpS,
      buyConfig: gameConfigs.buyConfig,
      gameEndConfig: gameConfigs.gameEndConfig,
      pumpPrice: gameConfigs.pumpPrice,
    });

  // user && gamePlay
  await firestore.collection('user').doc('0x76b324285a71d345e159ff17918fb4119e611338').set({
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    username: 'allyday',
    avatarURL:
      'https://image-cdn.hypb.st/https%3A%2F%2Fhypebeast.com%2Fimage%2F2021%2F10%2Fbored-ape-yacht-club-nft-3-4-million-record-sothebys-metaverse-0.jpg?w=960&cbr=1&q=90&fit=max',
    address: '0x76b324285a71d345e159ff17918fb4119e611338',
    referralCode: 'allyday',
    inviteCode: 'jackday1',
    referralReward: 0,
    holderReward: 0,
  });
  await firestore.collection('gamePlay').add({
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    userId: '0x76b324285a71d345e159ff17918fb4119e611338',
    seasonId,
    numberOfPump: 23,
    lastPurchaseTime: admin.firestore.Timestamp.fromMillis(now),
  });

  await firestore.collection('user').doc('0x890611302ee344d5bd94da9811c18e2de5588077').set({
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    username: 'jackday1',
    avatarURL: 'https://images.wsj.net/im-491405?width=1280&size=1.33333333',
    address: '0x890611302ee344d5bd94da9811c18e2de5588077',
    referralCode: 'jackday1',
    inviteCode: null,
    referralReward: 0,
    holderReward: 0,
  });
  await firestore.collection('gamePlay').add({
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    userId: '0x890611302ee344d5bd94da9811c18e2de5588077',
    seasonId,
    numberOfPump: 12,
    lastPurchaseTime: admin.firestore.Timestamp.fromMillis(now),
  });

  // userReferralProfit
  await firestore.collection('userReferralProfit').add({
    userId: '0x890611302ee344d5bd94da9811c18e2de5588077',
    referralId: '0x76b324285a71d345e159ff17918fb4119e611338',
    profit: 120,
  });
};

main();
