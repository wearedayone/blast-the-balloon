import { useState, useEffect } from 'react';
import { onSnapshot, collection, where, doc, query, documentId, getDocs } from 'firebase/firestore';
import chunk from 'lodash.chunk';

import { firestore } from '../configs/firebase.config';

export const getUserBatch = async (userIds, seasonId) => {
  const chunkIdsArrays = chunk(userIds, 10);

  const gamePlayPromises = chunkIdsArrays.map((ids) => {
    const q = query(collection(firestore, 'gamePlay'), where('seasonId', '==', seasonId), where('userId', 'in', ids));

    return getDocs(q);
  });
  const gamePlaySnapshots = await Promise.all(gamePlayPromises);
  const numberOfPump = gamePlaySnapshots.reduce((result, snapshot) => {
    return {
      ...result,
      ...snapshot.docs.reduce((subResult, item) => {
        return { ...subResult, [item.data().userId]: item.data().numberOfPump };
      }, {}),
    };
  }, {});

  const lastPurchaseTime = gamePlaySnapshots.reduce((result, snapshot) => {
    return {
      ...result,
      ...snapshot.docs.reduce((subResult, item) => {
        return { ...subResult, [item.data().userId]: item.data().lastPurchaseTime };
      }, {}),
    };
  }, {});

  const userPromises = chunkIdsArrays.map((ids) => {
    const q = query(collection(firestore, 'user'), where(documentId(), 'in', ids));

    return getDocs(q);
  });

  const userSnapshots = await Promise.all(userPromises);
  const users = userSnapshots.reduce((result, snapshot) => {
    return [...result, ...snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))];
  }, []);

  return { users, numberOfPump, lastPurchaseTime };
};

const useUserData = ({ uid, seasonId, createUserRecord }) => {
  const [data, setData] = useState({
    user: null,
    referralUsers: null,
    gamePlay: null,
  });

  useEffect(() => {
    let userUnsubscribe, gamePlayUnsubscribe, referralUnsubscribe;
    if (uid && seasonId) {
      userUnsubscribe = onSnapshot(doc(firestore, 'user', uid), (snapshot) => {
        if (snapshot.exists()) {
          setData((prev) => ({
            ...prev,
            user: { id: snapshot.id, ...snapshot.data() },
          }));
        } else {
          createUserRecord()
            .then(() => console.log('created user record'))
            .catch((err) => console.error(err));
        }
      });

      const gamePlayQuery = query(
        collection(firestore, 'gamePlay'),
        where('userId', '==', uid),
        where('seasonId', '==', seasonId)
      );
      gamePlayUnsubscribe = onSnapshot(gamePlayQuery, (snapshot) => {
        if (!snapshot.empty) {
          setData((prev) => ({
            ...prev,
            gamePlay: { id: snapshot.docs[0].id, ...snapshot.docs[0].data() },
          }));
        }
      });

      const referralQuery = query(collection(firestore, 'userReferralProfit'), where('userId', '==', uid));
      referralUnsubscribe = onSnapshot(referralQuery, async (snapshot) => {
        if (!snapshot.empty) {
          const userIds = snapshot.docs.map((item) => item.data().referralId);
          const profits = snapshot.docs.reduce((result, item) => {
            return { ...result, [item.data().referralId]: item.data().profit };
          }, {});
          const { users, numberOfPump } = await getUserBatch(userIds, seasonId);
          const referralUsers = users.map((item) => ({
            id: item.id,
            username: item.username,
            avatarURL: item.avatarURL,
            profit: profits[item.id],
            numberOfPump: numberOfPump[item.id],
          }));

          setData((prev) => ({ ...prev, referralUsers }));
        }
      });
    }

    return () => {
      userUnsubscribe?.();
      gamePlayUnsubscribe?.();
      referralUnsubscribe?.();
    };
  }, [uid, seasonId]);

  return { ...data };
};

export default useUserData;
