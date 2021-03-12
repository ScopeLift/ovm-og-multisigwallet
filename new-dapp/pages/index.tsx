import { useState, useContext, useEffect } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { Web3ReactProvider, useWeb3React } from '@web3-react/core';

import { ChainId } from 'components/ChainId';
import { BlockNumber } from 'components/BlockNumber';
import { Owners } from 'components/OwnersTable';
import { TransactionTable } from 'components/TransactionsTable';
import { Connection } from 'components/Connection';
import { NetworkName } from 'components/NetworkName';
import { WithModal } from 'components/Modal';
import { SetOrDeployMultisig } from 'components/SetOrDeployMultisig';
import { WithToast, Toast } from 'components/Toast';
import { MultisigInfo } from 'components/MultisigInfo';

// MULTISIG ADDR: 0x7b671dBae4e4Ad733Cd116aeAE378302cEAB7A06

function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
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
  const { library } = useWeb3React<Web3Provider>();
  const [multisigAddress, setMultisigAddress] = useState('');

  return (
    <>
      <WithModal>
        <WithToast>
          <div className="container mx-auto px-4">
            <div className="flex justify-end mt-2">
              <ChainId />
              <BlockNumber />
              <NetworkName />
              <Connection />
            </div>
            <div className="mt-4">
              <Toast />
              {/* {!!error && (
              <h4 className="mt-5 border border-red-400 bg-red-100 text-red-400">
                {getErrorMessage(error)}
              </h4>
            )} */}
            </div>
            <SetOrDeployMultisig
              address={multisigAddress}
              setMultisigAddress={setMultisigAddress}
            />
            {multisigAddress && (
              <>
                <MultisigInfo address={multisigAddress} setMultisigAddress={setMultisigAddress} />
                <TransactionTable address={multisigAddress} />
                <Owners address={multisigAddress} />
              </>
            )}
          </div>
        </WithToast>
      </WithModal>
    </>
  );
};

export default Page;
