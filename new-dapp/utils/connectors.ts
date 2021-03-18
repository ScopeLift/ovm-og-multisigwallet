import { NetworkConnector } from '@web3-react/network-connector';
import { InjectedConnector } from '@web3-react/injected-connector';
import { LedgerConnector } from '@web3-react/ledger-connector';
import { TrezorConnector } from '@web3-react/trezor-connector';
import { config } from '../config';

const POLLING_INTERVAL = 12000;

const RPC_URLS = Object.entries(config.networks).reduce((prev, [key, val]) => {
  return { ...prev, [key]: val.rpcUrl };
}, {});

export const network = new NetworkConnector({
  urls: RPC_URLS,
  defaultChainId: config.defaultNetwork,
});
export const injected = new InjectedConnector({
  supportedChainIds: Object.keys(RPC_URLS).map(Number),
});

export const ledger = Object.keys(config.networks).reduce((prev, chainId) => {
  console.log(prev);
  return {
    ...prev,
    [chainId]: new LedgerConnector({
      chainId: +chainId,
      url: RPC_URLS[chainId],
      pollingInterval: POLLING_INTERVAL,
    }),
  };
}, {});

export const trezor = Object.keys(config.networks).reduce((prev, chainId) => {
  console.log(prev);
  return {
    ...prev,
    [chainId]: new TrezorConnector({
      chainId: +chainId,
      url: RPC_URLS[chainId],
      pollingInterval: POLLING_INTERVAL,
      manifestEmail: 'dummy@abc.xyz',
      manifestAppUrl: 'http://localhost:1234',
    }),
  };
}, {});
