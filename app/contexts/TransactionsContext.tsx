import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { abi } from 'abi/MultiSigWallet.json';
import { ModalContext } from 'components/Modal';
import { ToastContext } from 'components/Toast';
import { TxModal } from 'components/TxModal';
import { Contract } from 'ethers';
import router from 'next/router';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
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
  transactions: Transaction[];
  updateTransactions: (tx: Transaction) => void;
  addNewTx: () => void;
  confirmTx: (transactionId: number) => void;
  revokeConfirmation: (transactionId: number) => void;
};

export const TransactionsContext = createContext({} as TransactionsContextType);

export const TransactionsProvider = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>();
  const address = router.query.address as string;
  const { library, account, chainId } = useWeb3React<Web3Provider>();
  const { setModalContent, setModalVisible } = useContext(ModalContext);
  const { setToast } = useContext(ToastContext);
  let { data: transactionCount, mutate } = useSWR(library ? [address, 'transactionCount'] : null, {
    fetcher: fetcher(library, abi),
  });
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
    mutate(undefined, true);
  }, [chainId]);

  const contract = new Contract(address, abi);

  useEffect(() => {
    if (!library) return;

    const submission = contract.filters.Submission(null);

    library.on(submission, (event) => {
      console.log('submission', { event });
      mutate(undefined, true);
    });
    return () => {
      library.removeAllListeners(submission);
    };
  }, [library]);

  const updateTransactions = (tx: Transaction) => {
    setTransactions(
      transactions.map((transaction) => (tx.id === transaction.id ? tx : transaction))
    );
  };

  const addNewTx = () => {
    if (!account)
      return setToast({
        type: 'error',
        content: 'Please connect your wallet before you add a transaction.',
        timeout: 5000,
      });
    setModalContent(<TxModal address={address} />);
    setModalVisible(true);
  };

  const confirmTx = async (transactionId: number) => {
    if (!account)
      return setToast({
        type: 'error',
        content: 'Please connect your wallet before you confirm a transaction.',
        timeout: 5000,
      });
    try {
      const tx = await contract.connect(library.getSigner()).confirmTransaction(transactionId);
      await tx.wait();
    } catch (e) {
      setToast({
        type: 'error',
        content: e.message,
        timeout: 5000,
      });
    }
  };

  const revokeConfirmation = async (transactionId: number) => {
    if (!account)
      return setToast({
        type: 'error',
        content: 'Please connect your wallet before you revoke a confirmation.',
        timeout: 5000,
      });
    try {
      const tx = await contract.connect(library.getSigner()).revokeConfirmation(transactionId);
      await tx.wait();
    } catch (e) {
      setToast({
        type: 'error',
        content: e.message,
        timeout: 5000,
      });
    }
  };

  return (
    <TransactionsContext.Provider
      value={{
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
