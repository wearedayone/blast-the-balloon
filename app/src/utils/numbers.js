export const customFormat = (number, digits) => {
  const formatter = Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: digits });

  return formatter.format(number);
};
