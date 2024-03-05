import axios from 'axios';

import admin, { firestore } from '../configs/firebase.config.js';
import gameConfigs from '../configs/game.config.js';

const main = async () => {
  const seasonId = '1';
  const startTimeUnix = 1709574197;
  const endTimeUnix = 1709584197;

  const maxEndTimeUnix = 1709584197;

  // system
  await firestore.collection('system').doc('config').set({ activeSeasonId: seasonId });
  const ethPriceRes = await axios.get('https://api.coinbase.com/v2/exchange-rates?currency=ETH');
  await firestore.collection('system').doc('market').set({ ethPriceInUsd: ethPriceRes.data.data.rates.USD });

  // season
  const seasonSnapshot = await firestore.collection('season').get();
  for (let doc of seasonSnapshot.docs) {
    await doc.ref.delete();
  }

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
      prizePool: 0,
      endGameJackpot: 0,
      pumpBought: 0,
      pumpSold: 0,
      buyConfig: gameConfigs.buyConfig,
      gameEndConfig: gameConfigs.gameEndConfig,
      pumpPrice: gameConfigs.pumpPrice,
    });
  const userSnapshot = await firestore.collection('user').get();
  for (let doc of userSnapshot.docs) {
    await doc.ref.delete();
  }

  const gamePlaySnapshot = await firestore.collection('gamePlay').get();
  for (let doc of gamePlaySnapshot.docs) {
    await doc.ref.delete();
  }

  const userReferralProfitSnapshot = await firestore.collection('userReferralProfit').get();
  for (let doc of userReferralProfitSnapshot.docs) {
    await doc.ref.delete();
  }
};

main()
  .then(process.exit)
  .catch((err) => console.error(err));
