import { Contract } from '@ethersproject/contracts';
import { Web3Provider } from '@ethersproject/providers';
import { isAddress } from '@ethersproject/address';

export const Networks = {
  MainNet: 1,
  Ropsten: 3,
  Rinkeby: 4,
  Goerli: 5,
  Kovan: 42,
};

export interface IERC20 {
  symbol: string;
  address: string;
  decimals: number;
  name: string;
}

export const TOKENS_BY_NETWORK: {
  [key: number]: IERC20[];
} = {
  [Networks.MainNet]: [
    {
      address: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
      name: 'Maker',
      symbol: 'MKR',
      decimals: 18,
    },
    {
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      name: 'Dai Stablecoin',
      symbol: 'DAI',
      decimals: 18,
    },
  ],
  [Networks.Rinkeby]: [
    {
      address: '0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa',
      symbol: 'DAI',
      name: 'Dai',
      decimals: 18,
    },
    {
      address: '0xF9bA5210F91D0474bd1e1DcDAeC4C58E359AaD85',
      symbol: 'MKR',
      name: 'Maker',
      decimals: 18,
    },
  ],
};
export const shorter = (str) => (str?.length > 8 ? str.slice(0, 6) + '...' + str.slice(-4) : str);

export const fetcher = (library: Web3Provider, abi?: any) => (...args) => {
  console.log(library);
  if (!library) throw new Error('no library');
  const [arg1, arg2, ...params] = args;
  // it's a contract
  if (isAddress(arg1)) {
    const address = arg1;
    const method = arg2;
    const contract = new Contract(address, abi, library.getSigner());
    console.log(method);
    return contract[method](...params);
  }
  // it's a eth call
  const method = arg1;
  return library[method](arg2, ...params);
};
