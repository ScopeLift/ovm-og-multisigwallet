import React, { useState, useEffect, useMemo } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
import { Web3ReactProvider, useWeb3React, UnsupportedChainIdError } from '@web3-react/core';
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from '@web3-react/injected-connector';

import { ChainId } from 'components/ChainId';
import { BlockNumber } from 'components/BlockNumber';
import { Owners } from 'components/OwnersTable';
import { TransactionTable } from 'components/TransactionsTable';
import { Connection } from 'components/Connection';
// MULTISIG ADDR: 0x7b671dBae4e4Ad733Cd116aeAE378302cEAB7A06

function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}

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
  const { error } = context;

  const address = '0x7b671dBae4e4Ad733Cd116aeAE378302cEAB7A06';

  return (
    <>
      <div className="flex justify-end">
        <ChainId />
        <BlockNumber />
        <Connection />
      </div>
      <div>
        {!!error && (
          <h4 style={{ marginTop: '1rem', marginBottom: '0' }}>{getErrorMessage(error)}</h4>
        )}
      </div>
      <TransactionTable address={address} />
      <Owners address={address} />
    </>
  );
};

export default Page;
