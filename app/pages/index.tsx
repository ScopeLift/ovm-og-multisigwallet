import { useState } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { Owners } from 'components/OwnersTable';
import { TransactionTable } from 'components/TransactionsTable';
import { SetOrDeployMultisig } from 'components/SetOrDeployMultisig';
import { MultisigInfo } from 'components/MultisigInfo';

const Page = () => {
  return (
    <>
      <App />
    </>
  );
};

const App = () => {
  const [multisigAddress, setMultisigAddress] = useState('');
  const { chainId } = useWeb3React<Web3Provider>();
  return (
    <>
      <SetOrDeployMultisig address={multisigAddress} setMultisigAddress={setMultisigAddress} />
    </>
  );
};

export default Page;
