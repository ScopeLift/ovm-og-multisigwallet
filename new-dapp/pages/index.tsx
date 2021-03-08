import React, { useState, useEffect, useMemo } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
import { Web3ReactProvider, useWeb3React, UnsupportedChainIdError } from '@web3-react/core';
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from '@web3-react/injected-connector';

import { useEagerConnect, useInactiveListener } from '../hooks/react-web3';
import { injected } from '../utils/connectors';
import { useMultisigContract } from '../hooks/useContract';
import { ChainId } from '../components/ChainId';
import { BlockNumber } from '../components/BlockNumber';
import { Owners } from '../components/OwnersTable';
import { TransactionTable } from '../components/TransactionsTable';

// MULTISIG ADDR: 0x7b671dBae4e4Ad733Cd116aeAE378302cEAB7A06

function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}

enum ConnectorNames {
  Injected = 'Injected',
  // Network = 'Network',
  // WalletConnect = 'WalletConnect',
  // WalletLink = 'WalletLink',
  // Ledger = 'Ledger',
  // Trezor = 'Trezor',
  // Lattice = 'Lattice',
  // Frame = 'Frame',
  // Authereum = 'Authereum',
  // Fortmatic = 'Fortmatic',
  // Magic = 'Magic',
  // Portis = 'Portis',
  // Torus = 'Torus',
}

const connectorsByName: { [connectorName in ConnectorNames]: any } = {
  [ConnectorNames.Injected]: injected,
};

function getErrorMessage(error: Error) {
  if (error instanceof NoEthereumProviderError) {
    return 'No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.';
  } else if (error instanceof UnsupportedChainIdError) {
    return "You're connected to an unsupported network.";
  } else if (error instanceof UserRejectedRequestErrorInjected) {
    return 'Please authorize this website to access your Ethereum account.';
  } else {
    console.error(error);
    return 'An unknown error occurred. Check the console for more details.';
  }
}

const Page = () => {
  return (
    <>
      <Web3ReactProvider getLibrary={getLibrary}>
        <App />
      </Web3ReactProvider>
    </>
  );
};

const App = () => {
  const context = useWeb3React<Web3Provider>();
  const { connector, library, chainId, account, activate, deactivate, active, error } = context;
  const contract = useMultisigContract('0x7b671dBae4e4Ad733Cd116aeAE378302cEAB7A06', true);
  // handle logic to recognize the connector currently being activated
  const [activatingConnector, setActivatingConnector] = React.useState<any>();
  React.useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined);
    }
  }, [activatingConnector, connector]);

  // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
  const triedEager = useEagerConnect();

  // handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
  useInactiveListener(!triedEager || !!activatingConnector);

  const address = '0x7b671dBae4e4Ad733Cd116aeAE378302cEAB7A06';

  return (
    <>
      <ChainId />
      <BlockNumber />

      <br />
      <TransactionTable address={address} />
      <Owners address={address} />
      <hr style={{ margin: '2rem' }} />
      <div
        style={{
          display: 'grid',
          gridGap: '1rem',
          gridTemplateColumns: '1fr 1fr',
          maxWidth: '20rem',
          margin: 'auto',
        }}
      >
        {Object.keys(connectorsByName).map((name) => {
          const currentConnector = connectorsByName[name];
          const activating = currentConnector === activatingConnector;
          const connected = currentConnector === connector;
          const disabled = !triedEager || !!activatingConnector || connected || !!error;

          return (
            <button
              style={{
                height: '3rem',
                borderRadius: '1rem',
                borderColor: activating ? 'orange' : connected ? 'green' : 'unset',
                cursor: disabled ? 'unset' : 'pointer',
                position: 'relative',
              }}
              disabled={disabled}
              key={name}
              onClick={() => {
                setActivatingConnector(currentConnector);
                activate(connectorsByName[name]);
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'black',
                  margin: '0 0 0 1rem',
                }}
              >
                {activating && <div>....</div>}
                {connected && (
                  <span role="img" aria-label="check">
                    ✅
                  </span>
                )}
              </div>
              {name}
            </button>
          );
        })}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {(active || error) && (
          <button
            style={{
              height: '3rem',
              marginTop: '2rem',
              borderRadius: '1rem',
              borderColor: 'red',
              cursor: 'pointer',
            }}
            onClick={() => {
              deactivate();
            }}
          >
            Deactivate
          </button>
        )}

        {!!error && (
          <h4 style={{ marginTop: '1rem', marginBottom: '0' }}>{getErrorMessage(error)}</h4>
        )}
      </div>

      <hr style={{ margin: '2rem' }} />

      <div
        style={{
          display: 'grid',
          gridGap: '1rem',
          gridTemplateColumns: 'fit-content',
          maxWidth: '20rem',
          margin: 'auto',
        }}
      >
        {!!(library && account) && (
          <button
            style={{
              height: '3rem',
              borderRadius: '1rem',
              cursor: 'pointer',
            }}
            onClick={() => {
              library
                .getSigner(account)
                .signMessage('👋')
                .then((signature: any) => {
                  window.alert(`Success!\n\n${signature}`);
                })
                .catch((error: any) => {
                  window.alert('Failure!' + (error && error.message ? `\n\n${error.message}` : ''));
                });
            }}
          >
            Sign Message
          </button>
        )}
      </div>
    </>
  );
};

export default Page;
