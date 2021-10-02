import { useRouter } from 'next/router';
import Link from 'next/link';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { MultisigInfo } from 'components/MultisigInfo';
import { OwnersTable } from 'components/OwnersTable';
import { OwnersContext } from 'contexts/OwnersContext';
import { TransactionsTable } from 'components/TransactionsTable';
import { TransactionsContext } from 'contexts/TransactionsContext';
import { isAddress } from '@ethersproject/address';
import { NextPage } from 'next';
import { Spinner } from 'components/Images';
import { useContext } from 'react';

const WalletPage: NextPage = () => {
  const { query } = useRouter();
  const address = query.address as string;
  const { account, chainId } = useWeb3React<Web3Provider>();
  const { isLoading: areOwnersLoading } = useContext(OwnersContext);
  const { isLoading: areTransactionsLoading } = useContext(TransactionsContext);

  if (typeof address === 'undefined' || areOwnersLoading || areTransactionsLoading) {
    return (
      <div className="flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isAddress(address)) {
    return (
      <div key={chainId}>
        <MultisigInfo address={address} />
        <TransactionsTable account={account} address={address} />
        <OwnersTable />
      </div>
    );
  }

  return (
    <div className="w-1/2 mt-7 mx-auto text-center">
      <h1 className="block">
        Sorry, you tried to open a wallet with the invalid address{' '}
        <span className="font-semibold">{address}</span>.
      </h1>
      <Link href="/">
        <button className="btn-primary block mx-auto mt-3">Go Back</button>
      </Link>
    </div>
  );
};

export default WalletPage;
