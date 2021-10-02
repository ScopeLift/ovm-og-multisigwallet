import { useRouter } from 'next/router';
import Link from 'next/link';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { MultisigInfo } from 'components/MultisigInfo';
import { Owners } from 'components/OwnersTable';
import { TransactionTable } from 'components/TransactionsTable';
import { TransactionsProvider } from 'contexts/TransactionsContext';
import { isAddress } from '@ethersproject/address';
import { NextPage } from 'next';
import { Spinner } from 'components/Images';

const WalletPage: NextPage = () => {
  const { account, chainId } = useWeb3React<Web3Provider>();
  const router = useRouter();
  const address = router.query.address as string;

  if (typeof address === 'undefined') {
    return (
      <div className="flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isAddress(address as string)) {
    return (
      <div key={chainId}>
        <MultisigInfo address={address} />
        <TransactionsProvider>
          <TransactionTable account={account} address={address} />
        </TransactionsProvider>
        <Owners address={address} />
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
