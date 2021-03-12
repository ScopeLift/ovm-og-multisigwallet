import { useState, useEffect, useMemo, useContext } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { Web3ReactProvider, useWeb3React, UnsupportedChainIdError } from '@web3-react/core';
import { useEagerConnect, useInactiveListener } from 'hooks/react-web3';
import { network, injected, ledger, trezor } from 'utils/connectors';
import Image from 'next/image';
import { truncateAddress } from 'utils/truncate';
import { ModalContext } from 'components/Modal';
import { ToastContext } from 'components/Toast';

import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from '@web3-react/injected-connector';

enum ConnectorNames {
  Network = 'Network',
  Injected = 'Injected',
  Ledger = 'Ledger',
  Trezor = 'Trezor',
}

const connectorsByName: { [connectorName in ConnectorNames]: any } = {
  [ConnectorNames.Network]: network,
  [ConnectorNames.Injected]: injected,
  [ConnectorNames.Ledger]: ledger,
  [ConnectorNames.Trezor]: trezor,
};

function getErrorMessage(error: Error) {
  if (error instanceof NoEthereumProviderError) {
    return 'No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.';
  } else if (error instanceof UnsupportedChainIdError) {
    return "You're connected to an unsupported network. " + error.message;
  } else if (error instanceof UserRejectedRequestErrorInjected) {
    return 'Please authorize this website to access your Ethereum account.';
  } else {
    console.error(error);
    return 'An unknown error occurred. Check the console for more details.';
  }
}

const ConnectionModal = ({ props }) => {
  const { clearModal } = useContext(ModalContext);
  const { connector, activate, deactivate, error } = useWeb3React<Web3Provider>();
  const { activatingConnector, setActivatingConnector, triedEager } = props;
  return (
    <div className="pb-2">
      <div className="flex justify-between w-full bg-gray-200 p-3 font-semibold">
        <h2>Connect Wallet</h2>

        <Image
          src="/x.svg"
          width="20"
          height="20"
          className="opacity-50 hover:opacity-80 hover:cursor-pointer"
          onClick={() => clearModal()}
        />
      </div>
      <ul className="mx-2">
        {Object.keys(connectorsByName).map((name) => {
          const currentConnector = connectorsByName[name];
          const activating = currentConnector === activatingConnector;
          const connected = currentConnector === connector;
          const disabled = !triedEager || !!activatingConnector || connected || !!error;
          if (name === 'Network') return;
          return (
            <li key={name}>
              <button
                className={[
                  'flex justify-between border border-gray-300 rounded-md hover:bg-gray-100 hover:text-gray-900 w-full my-2 p-5',
                  connected
                    ? 'border-green-300 bg-green-100 hover:bg-red-100 hover:border-red-300'
                    : '',
                ].join(' ')}
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
                {name}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export const Connection = () => {
  const {
    connector,
    library,
    chainId,
    account,
    activate,
    deactivate,
    active,
    error,
  } = useWeb3React<Web3Provider>();
  const { setModal, clearModal } = useContext(ModalContext);
  const { setToast } = useContext(ToastContext);

  useEffect(() => {
    if (error) setToast({ type: 'error', content: getErrorMessage(error), timeout: 5000 });
  }, [error]);

  // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
  const triedEager = useEagerConnect();
  // handle logic to recognize the connector currently being activated
  const [activatingConnector, setActivatingConnector] = useState<any>();
  useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined);
    }
  }, [activatingConnector, connector]);

  // use network connector if wallet disconnected
  useEffect(() => {
    if (triedEager && !activatingConnector && !active) {
      setActivatingConnector(connectorsByName['Network']);
      activate(connectorsByName['Network']);
    }
  }, [triedEager, activatingConnector, active]);

  // clear modal after successful connection
  // useEffect(() => {
  //   if (active) clearModal();
  // }, [active]);

  // handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
  useInactiveListener(!triedEager || !!activatingConnector);

  const showConnectionModal = () => {
    setModal({
      content: (
        <ConnectionModal props={{ activatingConnector, setActivatingConnector, triedEager }} />
      ),
      styleClass: 'sm:w-3/4 md:w-1/3 lg:w-1/4',
    });
  };

  return (
    <>
      <button className="flex items-center ml-4" onClick={() => showConnectionModal()}>
        <div
          className={
            'h-3 w-3 border-2 rounded-full mr-2 ' +
            (active && account
              ? 'bg-green-400'
              : !!activatingConnector
              ? 'bg-yellow-600'
              : 'bg-red-600')
          }
        ></div>

        {active && account ? (
          <span className="font-mono">{truncateAddress(account)}</span>
        ) : !!activatingConnector ? (
          'Activating...'
        ) : (
          'Connect Wallet'
        )}
      </button>
    </>
  );
};
