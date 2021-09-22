export const openInEtherscan = (address: string, chainId: number) => {
  switch (chainId) {
    case 10:
      window.open(`https://optimistic.etherscan.io/address/${address}`);
      break;
    case 69:
      window.open(`https://kovan-optimistic.etherscan.io/address/${address}`);
      break;
    default:
      break;
  }
};
