import { useState, useEffect } from 'react';
import { onSnapshot, doc } from 'firebase/firestore';

import { firestore } from '../configs/firebase.config';

const useMarket = () => {
  const [market, setMarket] = useState(null);

  useEffect(() => {
    let unsubscribe;
    unsubscribe = onSnapshot(doc(firestore, 'system', 'market'), (snapshot) => {
      if (snapshot.exists()) {
        setMarket({ id: snapshot.id, ...snapshot.data() });
      }
    });

    return () => unsubscribe?.();
  }, []);

  return { market };
};

export default useMarket;
