import React, { useEffect, useContext } from 'react';
import useSWR from 'swr';
import { fetcher } from 'utils/fetcher';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { abi } from 'abi/MultiSigWallet.json';
import { truncateAddress } from 'utils/truncate';
import { ToastContext } from 'components/Toast';
import { ModalContext } from './Modal';
import { TransactionDataModal } from './TransactionDataModal';

export const TransactionRow = ({ address, transactionId, cellStyle }) => {
  const { account, library } = useWeb3React<Web3Provider>();
  const { setModal } = useContext(ModalContext);
  const { setToast } = useContext(ToastContext);
  const { data: transaction, mutate } = useSWR(
    library ? [address, 'transactions', transactionId] : null,
    {
      fetcher: fetcher(library, abi),
    }
  );
  const { data: confirmations, mutate: mutateConfirmations } = useSWR(
    library ? [address, 'getConfirmations', transactionId] : null,
    {
      fetcher: fetcher(library, abi),
    }
  );
  const { data: isConfirmed, mutate: mutateIsConfirmed } = useSWR(
    library ? [address, 'isConfirmed', transactionId] : null,
    {
      fetcher: fetcher(library, abi),
    }
  );
  const contract = new Contract(address, abi);

  useEffect(() => {
    if (!library) return;
    const confirmation = contract.filters.Confirmation(null, transactionId);
    const revocation = contract.filters.Revocation(null, transactionId);
    const execution = contract.filters.Execution(transactionId);
    const executionFailure = contract.filters.ExecutionFailure(transactionId);

    library.on(confirmation, (event) => {
      console.log('confirmation', { event });
      mutate(undefined, true);
      mutateConfirmations(undefined, true);
      mutateIsConfirmed(undefined, true);
    });
    library.on(revocation, (event) => {
      console.log('revocation', { event });
      mutate(undefined, true);
      mutateConfirmations(undefined, true);
    });
    library.on(execution, (event) => {
      console.log('execution', { event });
      mutate(undefined, true);
    });
    library.on(executionFailure, (event) => {
      console.log('executionFailure', { event });
      mutate(undefined, true);
    });
    return () => {
      library.removeAllListeners(confirmation);
      library.removeAllListeners(revocation);
      library.removeAllListeners(execution);
      library.removeAllListeners(executionFailure);
    };
  }, [library]);

  const confirmTx = async () => {
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

  const revokeConfirmation = async () => {
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

  const showTransactionDataModal = (data: string) => {
    setModal({
      content: <TransactionDataModal data={data} />,
      styleClass: 'sm:w-full',
    });
  };

  if (!transaction || !confirmations) return <tr></tr>;
  const txStatus = transaction.executed ? 'executed' : isConfirmed ? 'failed' : 'pending';
  return (
    <tr>
      <td className={cellStyle}>{transactionId}</td>
      <td className={cellStyle}>
        <span className="block w-44">{truncateAddress(transaction.destination)}</span>
      </td>
      <td className={cellStyle}>
        <span
          className="truncate block w-44 hover:underline cursor-pointer"
          onClick={() => showTransactionDataModal(transaction.data)}
        >
          {transaction.data}
        </span>
      </td>
      <td className={cellStyle}>
        <div className="flex flex-row justify-between">
          <div className="flex flex-row items-center">
            <div className="bg-pink-100 rounded p-3 mr-2">{confirmations.length}</div>
            <ul>
              {confirmations.map((address) => (
                <li key={address}>{address}</li>
              ))}
            </ul>
          </div>
          {txStatus === 'pending' &&
            (!confirmations.includes(account) ? (
              <button className="text-sm border border-gray-400 rounded px-2" onClick={confirmTx}>
                Sign
              </button>
            ) : (
              <button
                className="text-sm border border-gray-400 rounded px-2"
                onClick={revokeConfirmation}
              >
                Revoke
              </button>
            ))}
        </div>
      </td>
      <td className={cellStyle}>
        {txStatus === 'executed' ? (
          <span className="text-green-400 mr-1">✔</span>
        ) : txStatus === 'failed' ? (
          <span className="text-red-400 mr-1">✕</span>
        ) : (
          ''
        )}
        <span className="">{txStatus}</span>
      </td>
    </tr>
  );
};
