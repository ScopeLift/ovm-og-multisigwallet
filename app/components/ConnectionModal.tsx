import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { config } from 'config';
import React, { FC, useContext } from 'react';
import { ConnectorNames, connectorsByName } from './Header';
import { CloseIcon } from './Images';
import { ModalContext } from './Modal';

interface ConnectionModalProps {
  activatingConnector: boolean;
  setActivatingConnector: React.Dispatch<any>;
  triedEager: boolean;
  setIntendedChainId: React.Dispatch<any>;
}

export const ConnectionModal: FC<ConnectionModalProps> = ({
  activatingConnector,
  setActivatingConnector,
  triedEager,
  setIntendedChainId,
}) => {
  const { clearModal } = useContext(ModalContext);
  const {
    library,
    connector,
    chainId,
    account,
    activate,
    deactivate,
    error,
  } = useWeb3React<Web3Provider>();

  return (
    <div className="pb-2">
      <div className="flex justify-between w-full bg-gray-200 p-3 font-semibold">
        <h2>Connect Wallet</h2>

        <CloseIcon
          className="opacity-50 hover:opacity-80 hover:cursor-pointer"
          onClick={() => clearModal()}
        />
      </div>

      <div className="flex flex-col px-2">
        <div className="my-2">Choose provider and network:</div>
        {Object.keys(connectorsByName).map((connectorName) => {
          const currentConnector = connectorsByName[connectorName];
          const activating = currentConnector === activatingConnector;
          const connected = currentConnector === connector;
          const disabled = !triedEager || !!activatingConnector || connected || !!error;
          if (connectorName === 'Network') return;
          return (
            <div
              className="flex bg-gray-100 mb-2 p-2 rounded items-center content-between"
              key={connectorName}
            >
              <div className="mx-4 w-3/5 font-semibold">{connectorName}</div>
              <div>
                {Object.entries(config.networks).map(([networkId, network]) => (
                  <button
                    className={[
                      'mb-1 px-2 mx-auto border border-gray-300 rounded text-sm w-full',
                      Number(networkId) === chainId && connected
                        ? 'border-green-300 bg-green-100'
                        : '',
                    ].join(' ')}
                    key={networkId}
                    onClick={async () => {
                      if (connected && chainId === +networkId) return deactivate();
                      if (
                        (!activating && connectorName === ConnectorNames.Ledger) ||
                        connectorName === ConnectorNames.Trezor
                      ) {
                        // if connector is trezor or ledger, connect to specific chain id
                        setIntendedChainId(networkId);
                        setActivatingConnector(currentConnector);
                        return activate(connectorsByName[connectorName][networkId]);
                        // if connector is injected, set the activating connector
                      }
                      if (!activating && connectorName === ConnectorNames.Injected) {
                        setIntendedChainId(networkId);
                        await activate(connectorsByName[connectorName]);
                        // return changeNetworkOnInjectedProvider(library, account, networkId);
                      }
                    }}
                  >
                    {network.name}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
