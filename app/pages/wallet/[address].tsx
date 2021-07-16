import { useRouter } from 'next/router';
import Link from 'next/link';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { MultisigInfo } from 'components/MultisigInfo';
import { Owners } from 'components/OwnersTable';
import { TransactionTable } from 'components/TransactionsTable';
import { isAddress } from '@ethersproject/address';
const Page = () => {
  const { chainId } = useWeb3React<Web3Provider>();
  const router = useRouter();
  const { address } = router.query;
  return isAddress(address as string) ? (
    <div key={chainId}>
      <MultisigInfo address={address} />
      <TransactionTable address={address} />
      <Owners address={address} />
    </div>
  ) : (
    <div className="w-1/2 mt-7 mx-auto text-center">
      <h1 className="block">
        Sorry, you tried to open a wallet with the invalid address{' '}
        <span className="font-semibold">{address}</span>.
      </h1>
      <Link href="/">
        <button className="block mt-3 px-3 py-2 mx-auto text-white text-sm font-semibold bg-gradient-to-r from-green-400 to-blue-500 rounded">
          Go Back
        </button>
      </Link>
    </div>
  );
};

export default Page;
