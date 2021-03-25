type NetworkEntry = {
  name: string;
  rpcUrl: string;
  blockExplorerUrls: string[] | null;
  nativeCurrency: {
    name: string;
    symbol: string; // 2-6 characters long
    decimals: number;
  };
  multisigFactoryAddress: string;
};

type AppConfig = {
  networks: Record<number, NetworkEntry>;
  defaultNetwork: number;
};

export const config: AppConfig = {
  defaultNetwork: 69,
  networks: {
    10: {
      name: 'Optimistic Ethereum',
      rpcUrl: 'https://mainnet.optimism.io/',
      blockExplorerUrls: null,
      nativeCurrency: {
        name: 'OETH',
        symbol: 'OETH',
        decimals: 18,
      },
      multisigFactoryAddress: '0xA5e6EFdA500FD0BCEd87B2cd8Af1c81c0cc9D556',
    },
    69: {
      name: 'Optimistic Ethereum Testnet Kovan',
      rpcUrl: 'https://kovan.optimism.io/',
      blockExplorerUrls: null,
      nativeCurrency: {
        name: 'KOR',
        symbol: 'KOR',
        decimals: 18,
      },
      multisigFactoryAddress: '0x676Fcee7AF0dD0060b238d00d43A5542f3aA3B3e',
    },
    420: {
      name: 'Optimistic Ethereum Testnet Goerli',
      rpcUrl: 'https://goerli.optimism.io/',
      blockExplorerUrls: null,
      nativeCurrency: {
        name: 'GOR',
        symbol: 'GOR',
        decimals: 18,
      },
      multisigFactoryAddress: '0x55422562984070fAeB1597342C0b684B77f5AE70',
    },
  },
};
