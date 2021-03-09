import React, { useState, useEffect, useMemo } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { useEagerConnect, useInactiveListener } from 'hooks/react-web3';
import { injected } from 'utils/connectors';
import { truncateAddress } from 'utils/truncate';

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

export const Connection = () => {
  const context = useWeb3React<Web3Provider>();
  const { connector, library, chainId, account, activate, deactivate, active, error } = context;
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
  return (
    <>
      {Object.keys(connectorsByName).map((name) => {
        const currentConnector = connectorsByName[name];
        const activating = currentConnector === activatingConnector;
        const connected = currentConnector === connector;
        const disabled = !triedEager || !!activatingConnector || connected || !!error;
        console.log('connected: ', connected, '\nactivating: ', activating, '\naccount: ', account);
        return (
          <button
            className="flex items-center ml-4"
            disabled={disabled}
            key={name}
            onClick={
              connected
                ? deactivate
                : !activating
                ? () => {
                    setActivatingConnector(currentConnector);
                    activate(connectorsByName[name]);
                  }
                : () => {}
            }
          >
            <div
              className={
                'h-3 w-3 border-2 rounded-full mr-2 ' +
                (connected ? 'bg-green-400' : activating ? 'bg-yellow-600' : 'bg-red-600')
              }
            ></div>

            {connected && account ? (
              <span className="font-mono">{truncateAddress(account)}</span>
            ) : activating ? (
              'Activating...'
            ) : (
              'Connect Wallet'
            )}
          </button>
        );
      })}
    </>
  );
};
