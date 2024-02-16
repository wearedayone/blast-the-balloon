import { useState, useEffect } from 'react';
import { onSnapshot, doc, getDoc } from 'firebase/firestore';

import { firestore } from '../configs/firebase.config';

const useSeason = () => {
  const [seasonId, setSeasonId] = useState(null);
  const [season, setSeason] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(firestore, 'system', 'config'), async (snapshot) => {
      if (snapshot.exists()) {
        const { activeSeasonId } = snapshot.data();
        setSeasonId(activeSeasonId);
      }
    });

    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    let unsubscribe;
    if (seasonId) {
      unsubscribe = onSnapshot(doc(firestore, 'season', seasonId), (snapshot) => {
        if (snapshot.exists()) {
          setSeason({ id: snapshot.id, ...snapshot.data() });
        }
      });

      return () => unsubscribe?.();
    }
  }, [seasonId]);

  return { season };
};

export default useSeason;
