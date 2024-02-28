export const calculateNextPumpBuyPriceBatch = (b, k, n, amount) => {
  const ethPrice =
    amount * b + (amount * (n * n) + n * amount * (amount - 1) + (amount * (amount - 1) * (2 * amount - 1)) / 6) / k;

  return Math.round(ethPrice * 1e6) / 1e6;
};

export const calculateNextPumpSellPriceBatch = (b, k, n, amount, share) => {
  const ethPrice =
    share *
    (b * amount + (amount * (n * n) + (amount * (amount + 1) * (amount + 2)) / 6 - amount * (amount + 1) * n) / k);

  return Math.round(ethPrice * 1e6) / 1e6;
};
