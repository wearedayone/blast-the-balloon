const configs = {
  buyConfig: {
    endGameJackpotW: 0.05,
    referralW: 0.1,
    dividendW: 0.25,
    operationW: 0,
    prizePool: 0.6,
  },
  gameEndConfig: {
    lastLuckyW: 0.2,
    topHolderW: 0.1,
    topHoldersDistribution: [10, 6, 4],
    lastPurchaseW: 0.65,
    nextRoundW: 0.05,
    operationW: 0,
  },
  pumpPrice: {
    basePrice: 0.001,
    k: 200000,
  },
  pauseBetweenSeason: 5 * 60,
};

export default configs;
