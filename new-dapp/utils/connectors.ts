import { InjectedConnector } from '@web3-react/injected-connector';
import { LedgerConnector } from '@web3-react/ledger-connector';
import { TrezorConnector } from '@web3-react/trezor-connector';

const POLLING_INTERVAL = 12000;
const RPC_URLS = {
  69: 'https://kovan.optimism.io',
};
export const injected = new InjectedConnector({ supportedChainIds: [69, 420] });
export const ledger = new LedgerConnector({
  chainId: 69,
  url: RPC_URLS[69],
  pollingInterval: POLLING_INTERVAL,
});
export const trezor = new TrezorConnector({
  chainId: 69,
  url: RPC_URLS[69],
  pollingInterval: POLLING_INTERVAL,
  manifestEmail: 'dummy@abc.xyz',
  manifestAppUrl: 'http://localhost:1234',
});
