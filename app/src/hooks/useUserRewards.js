import { useEffect, useState } from 'react';

const REFRESH_INTERVAL = 10;
export default function useUserRewards({ address, getUserReferralReward, getUserHolderReward, getUserLockedValue }) {
  const [referralReward, setReferralReward] = useState(0);
  const [holderReward, setHolderReward] = useState(0);
  const [lockedValue, setLockedValue] = useState(0);

  useEffect(() => {
    const refreshReward = () => {
      getUserReferralReward(address)
        .then(setReferralReward)
        .catch((err) => console.error(err));
      getUserHolderReward(address)
        .then(setHolderReward)
        .catch((err) => console.error(err));
      getUserLockedValue(address)
        .then(setLockedValue)
        .catch((err) => console.error(err));
    };
    refreshReward();

    const intervalRef = setInterval(refreshReward, REFRESH_INTERVAL * 1000);

    return () => clearInterval(intervalRef);
  }, [address]);

  return { referralReward, holderReward, lockedValue };
}
