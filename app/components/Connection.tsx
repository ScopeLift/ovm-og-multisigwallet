import { useState, useEffect, useMemo, useContext } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React, UnsupportedChainIdError } from '@web3-react/core';
import { useEagerConnect, useInactiveListener } from 'hooks/react-web3';
import { network, injected, ledger, trezor } from 'utils/connectors';
import { config } from '../config';
import { CloseIcon } from 'components/Images';
import { truncateAddress } from 'utils/truncate';
import { ModalContext } from 'components/Modal';
import { ToastContext } from 'components/Toast';

import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from '@web3-react/injected-connector';

enum ConnectorNames {
  Network = 'Network',
  Injected = 'Metamask',
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

const changeNetworkOnInjectedProvider = async (library, account, chainId) => {
  const toHex = (num) => {
    return '0x' + parseInt(num).toString(16);
  };
  const network = config.networks[chainId];
  const params = {
    chainId: toHex(chainId), // A 0x-prefixed hexadecimal string
    chainName: network.name,
    rpcUrls: [network.rpcUrl],
    blockExplorerUrls: network.blockExplorerUrls,
    nativeCurrency: network.nativeCurrency,
  };

  library
    .jsonRpcFetchFunc('wallet_addEthereumChain', [params, account])
    .then((data) => {
      console.log(params);
      console.log('success ', data);
    })
    .catch(console.log);
};

const ConnectionModal = ({ props }) => {
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
  const { activatingConnector, setActivatingConnector, triedEager, setIntendedChainId } = props;

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
  const [intendedChainId, setIntendedChainId] = useState(null);
  useEffect(() => {
    if (error)
      setToast({
        type: 'error',
        content: getErrorMessage(error),
        timeout: 5000,
      });
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
    if (triedEager && !activatingConnector && !active && !connector) {
      setActivatingConnector(connectorsByName['Network']);
      activate(connectorsByName['Network']);
    }
  }, [triedEager, activatingConnector, active, connector]);

  useEffect(() => {
    if (
      connector === connectorsByName[ConnectorNames.Injected] &&
      intendedChainId &&
      chainId !== intendedChainId
    ) {
      changeNetworkOnInjectedProvider(library, account, intendedChainId);
      setIntendedChainId(null);
    }
  }, [connector, intendedChainId]);

  // clear modal after successful connection
  useEffect(() => {
    if (active) clearModal();
  }, [active]);

  // handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
  useInactiveListener(!triedEager || !!activatingConnector);

  const showConnectionModal = () => {
    setModal({
      content: (
        <ConnectionModal
          props={{
            activatingConnector,
            setActivatingConnector,
            triedEager,
            setIntendedChainId,
          }}
        />
      ),
      styleClass: 'sm:w-3/4 md:w-1/2 lg:w-1/3',
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
