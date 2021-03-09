import React, { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { fetcher } from 'utils/fetcher';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { abi } from 'abi/MultiSigWallet.json';
import { truncateAddress } from 'utils/truncate';

export const TransactionRow = ({ address, transactionId, cellStyle }) => {
  const { account, library } = useWeb3React<Web3Provider>();

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

  useEffect(() => {
    if (!library) return;
    const contract = new Contract(address, abi);
    const confirmation = contract.filters.Confirmation(null, transactionId);
    const revocation = contract.filters.Revocation(null, transactionId);
    const execution = contract.filters.Execution(transactionId);
    const executionFailure = contract.filters.ExecutionFailure(transactionId);

    library.on(confirmation, (event) => {
      console.log('confirmation', { event });
      mutate(undefined, true);
      mutateConfirmations(undefined, true);
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

  if (!transaction) return <tr></tr>;
  return (
    <tr>
      <td className={cellStyle}>{transactionId}</td>
      <td className={cellStyle}>
        <span className="block w-44">{truncateAddress(transaction.destination)}</span>
      </td>
      <td className={cellStyle}>
        <span className="truncate block w-44">{transaction.data}</span>
      </td>
      <td className={cellStyle}>
        <div className="flex flex-row items-center">
          <div className="bg-pink-100 rounded p-3 mr-2">
            {confirmations && confirmations.length}
          </div>
          <ul>
            {confirmations && confirmations.map((address) => <li key={address}>{address}</li>)}
          </ul>
        </div>
      </td>
      <td className={cellStyle}>{transaction.executed.toString()}</td>
    </tr>
  );
};
