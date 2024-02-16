import { useState, useEffect, useMemo } from 'react';
import { onSnapshot, collection, where, query } from 'firebase/firestore';

import { firestore } from '../configs/firebase.config';
import { getUserBatch } from './useUserData';

const useLeaderboard = ({ uid, seasonId, gameEndConfig, prizePool }) => {
  const [gamePlays, setGamePlays] = useState([]);

  const topHoldersRewards = useMemo(() => {
    if (!gameEndConfig || !prizePool) return [];
    const { topHolderW, topHoldersDistribution } = gameEndConfig;
    const topHoldersPrize = prizePool * topHolderW;
    // only distribute to active players
    const distribution = topHoldersDistribution.slice(0, gamePlays.length);
    const totalWeight = distribution.reduce((sum, weight) => sum + weight, 0);

    return distribution.map((weight) => (weight * topHoldersPrize) / totalWeight);
  }, [gameEndConfig, gamePlays, prizePool]);

  const lastPurchaseRewards = useMemo(() => {
    if (!gameEndConfig || !prizePool) return [];
    const { lastLuckyW, lastPurchaseW } = gameEndConfig;
    const lastPurchasePrize = prizePool * lastPurchaseW;
    const jackpot = prizePool * lastLuckyW;
    const lastPurchaseRanks = Array.from({ length: gamePlays.length - 1 }, (_, i) => i + 2);
    const lastPurchaseWeights = lastPurchaseRanks.map((rank) => Math.pow(gamePlays.length + 1 - rank, 2));
    const totalWeight = lastPurchaseWeights.reduce((sum, weight) => sum + weight, 0);

    return [jackpot, ...lastPurchaseWeights.map((weight) => (weight * lastPurchasePrize) / totalWeight)];
  }, [gameEndConfig, gamePlays, prizePool]);

  useEffect(() => {
    let gamePlayUnsubscribe;
    if (uid && seasonId) {
      const gamePlayQuery = query(collection(firestore, 'gamePlay'), where('seasonId', '==', seasonId));
      gamePlayUnsubscribe = onSnapshot(gamePlayQuery, async (snapshot) => {
        const userIds = snapshot.docs.map((doc) => doc.data().userId);

        const { users, numberOfPump, lastPurchaseTime } = await getUserBatch(userIds, seasonId);
        const data = users.map((item) => ({
          id: item.id,
          isUser: item.id === uid,
          username: item.username,
          avatarURL: item.avatarURL,
          numberOfPump: numberOfPump[item.id],
          lastPurchaseTime: lastPurchaseTime[item.id],
        }));

        setGamePlays(data);
      });
    }

    return () => {
      gamePlayUnsubscribe?.();
    };
  }, [uid, seasonId]);

  return { gamePlays, topHoldersRewards, lastPurchaseRewards };
};

export default useLeaderboard;
