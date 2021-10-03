import { isAddress } from '@ethersproject/address';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { abi as multisigAbi } from 'abi/MultiSigWallet.json';
import { Contract } from 'ethers';
import { useRouter } from 'next/router';
import React, { createContext, FC, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { fetcher } from 'utils/fetcher';

export type Transaction = {
  id: number;
  address: string;
  data?: string;
  confirmations?: string[];
  status?: 'executed' | 'failed' | 'pending';
};

type TransactionsContextType = {
  isLoading: boolean;
  transactions: Transaction[];
  updateTransactions: (tx: Transaction) => void;
  addNewTx: (
    destination: string,
    abi: string,
    method: string,
    args: Record<string, unknown>
  ) => Promise<unknown>;
  confirmTx: (transactionId: number) => Promise<unknown>;
  revokeConfirmation: (transactionId: number) => Promise<unknown>;
};

export const TransactionsContext = createContext({} as TransactionsContextType);

export const TransactionsProvider: FC = ({ children }) => {
  const { query, isReady } = useRouter();
  const address = query.address as string;
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { library, chainId, connector } = useWeb3React<Web3Provider>();
  const supportedChainIds = connector?.supportedChainIds;

  const contract = useMemo(
    () => (isReady && isAddress(address) ? new Contract(address, multisigAbi) : null),
    [isReady]
  );

  const { data: transactionCount, mutate } = useSWR<number>(
    library && supportedChainIds?.includes(chainId) ? [address, 'transactionCount'] : null,
    {
      fetcher: fetcher(library, multisigAbi),
    }
  );

  const isLoading = useMemo(
    () =>
      !isReady ||
      (isReady && isAddress(address) && supportedChainIds?.includes(chainId) && !transactionCount),
    [isReady, transactionCount]
  );

  useEffect(() => {
    mutate(undefined, true);
  }, [chainId]);

  const parsedTxCount = useMemo(
    () => (transactionCount ? parseInt(transactionCount.toString()) : 0),
    [transactionCount]
  );

  useEffect(() => {
    if (parsedTxCount) {
      setTransactions(
        new Array(parsedTxCount).fill(null).map((_, id) => ({
          id,
          address,
        }))
      );
    }
  }, [parsedTxCount]);

  useEffect(() => {
    if (!contract || !library) return;

    const submission = contract.filters.Submission(null);

    library.on(submission, (event) => {
      console.log('submission', { event });
      mutate(undefined, true);
    });
    return () => {
      library.removeAllListeners(submission);
    };
  }, [contract, library]);

  const updateTransactions = (tx: Transaction) => {
    setTransactions(
      transactions.map((transaction) => (tx.id === transaction.id ? tx : transaction))
    );
  };

  const addNewTx = async (
    destination: string,
    abi: string,
    method: string,
    args: Record<string, unknown>
  ) => {
    const destinationContract = new Contract(destination, abi);
    const inputs = JSON.parse(abi)
      .filter((entry) => entry.type === 'function')
      .find((entry) => entry.name === method).inputs;
    const tx = await contract
      ?.connect(library.getSigner())
      ?.submitTransaction(
        destinationContract.address,
        0,
        destinationContract.interface.encodeFunctionData(
          method,
          inputs ? inputs.map((input) => args[input.name]) : undefined
        )
      );
    const receipt = await tx.wait();
    return receipt;
  };

  const confirmTx = async (transactionId: number) => {
    const tx = await contract?.connect(library.getSigner())?.confirmTransaction(transactionId);
    const receipt = await tx.wait();
    return receipt;
  };

  const revokeConfirmation = async (transactionId: number) => {
    const tx = await contract?.connect(library.getSigner())?.revokeConfirmation(transactionId);
    const receipt = await tx.wait();
    return receipt;
  };

  return (
    <TransactionsContext.Provider
      value={{
        isLoading,
        transactions,
        updateTransactions,
        addNewTx,
        confirmTx,
        revokeConfirmation,
      }}
    >
      {children}
    </TransactionsContext.Provider>
  );
};
