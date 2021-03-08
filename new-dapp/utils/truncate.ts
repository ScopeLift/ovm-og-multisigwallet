export const truncateAddress = (str: string, n: number = 4) => {
  return '0x' + str.substring(2, 2 + n) + '...' + str.substring(42 - n, 42);
};
