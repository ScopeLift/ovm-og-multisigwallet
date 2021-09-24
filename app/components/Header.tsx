import React, { FC, Fragment, useContext, useEffect, useState } from 'react';
import { NetworkName } from 'components/NetworkName';
import { Connection } from 'components/Connection';
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from '@web3-react/injected-connector';
import { config } from 'config';
import { network, injected, ledger, trezor } from 'utils/connectors';
import { Web3Provider } from '@ethersproject/providers';
import { useEagerConnect, useInactiveListener } from 'hooks/react-web3';
import { ModalContext } from './Modal';
import { ToastContext } from './Toast';
import { ConnectionModal } from './ConnectionModal';

export enum ConnectorNames {
  Network = 'Network',
  Injected = 'Metamask',
  Ledger = 'Ledger',
  Trezor = 'Trezor',
}

export const connectorsByName: { [connectorName in ConnectorNames]: any } = {
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

export const Header: FC = () => {
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
          activatingConnector={activatingConnector}
          setActivatingConnector={setActivatingConnector}
          triedEager={triedEager}
          setIntendedChainId={setIntendedChainId}
        />
      ),
      styleClass: 'sm:w-3/4 md:w-1/2 lg:w-1/3',
    });
  };

  return (
    <>
      <NetworkName showConnectionModal={showConnectionModal} />
      <Connection
        active={active}
        account={account}
        activatingConnector={activatingConnector}
        showConnectionModal={showConnectionModal}
      />
    </>
  );
};
