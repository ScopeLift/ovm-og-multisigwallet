import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import useSWR from 'swr';
import { useEffect, useState } from 'react';
import { fetcher } from 'utils/fetcher';

export const BlockNumber = () => {
  const { account, library } = useWeb3React<Web3Provider>();
  // const { data: blockNumber, mutate } = useSWR(
  //   library ? ['getBlockNumber', account, 'latest'] : null,
  //   {
  //     fetcher: fetcher(library, null),
  //   }
  // );
  const [blockNumber, setBlockNumber] = useState<number>(0);

  useEffect(() => {
    if (!library) return;
    // listen for changes on an Ethereum address
    console.log(`listening for blocks...`);
    library.on('block', (data) => {
      console.log(data);
      setBlockNumber(data);
    });
    // remove listener when the component is unmounted
    return () => {
      library.removeAllListeners('block');
    };
    // trigger the effect only on component mount
  }, [library]);

  if (!blockNumber) {
    return <div>...</div>;
  }
  return (
    <div className="py-1 px-2 rounded bg-gradient-to-r from-purple-400 to-red-500 text-xs">
      Block Number: {blockNumber.toString()}
    </div>
  );
};
