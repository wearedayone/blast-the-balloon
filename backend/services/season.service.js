import { firestore } from '../configs/firebase.config.js';

export const getActiveSeasonId = async () => {
  const snapshot = await firestore.collection('system').doc('config').get();

  const { activeSeasonId } = snapshot.data();

  return activeSeasonId;
};
