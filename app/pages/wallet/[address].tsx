import { useRouter } from 'next/router';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { MultisigInfo } from 'components/MultisigInfo';
import { Owners } from 'components/OwnersTable';
import { TransactionTable } from 'components/TransactionsTable';

const Page = () => {
  const { chainId } = useWeb3React<Web3Provider>();
  const router = useRouter();
  const { address } = router.query;
  console.log(address);
  return address ? (
    <div key={chainId}>
      <MultisigInfo address={address} />
      <TransactionTable address={address} />
      <Owners address={address} />
    </div>
  ) : (
    <></>
  );
};

export default Page;
