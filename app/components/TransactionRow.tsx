import React, { useEffect, useContext, useMemo, FC } from 'react';
import useSWR from 'swr';
import { fetcher } from 'utils/fetcher';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { abi } from 'abi/MultiSigWallet.json';
import { Transaction, TransactionsContext } from 'contexts/TransactionsContext';
import { Cell, Row } from 'react-table';

interface TransactionRowProps {
  transactionId: number;
  address: string;
  row: Row;
  cellStyle: string;
}

export const TransactionRow: FC<TransactionRowProps> = ({
  transactionId,
  address,
  row,
  cellStyle,
}) => {
  const { library } = useWeb3React<Web3Provider>();
  const { updateTransactions } = useContext(TransactionsContext);

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

  const tx: Transaction = useMemo(
    () =>
      typeof transaction !== 'undefined' &&
      typeof confirmations !== 'undefined' &&
      typeof isConfirmed !== 'undefined'
        ? {
            id: transactionId,
            address,
            data: transaction?.data,
            confirmations,
            status: transaction?.executed ? 'executed' : isConfirmed ? 'failed' : 'pending',
          }
        : undefined,
    [transaction, confirmations, isConfirmed]
  );

  useEffect(() => {
    if (tx) updateTransactions(tx);
  }, [tx]);

  return (
    <tr {...row.getRowProps()}>
      {row.cells.map((cell: Cell) => (
        <td className={cellStyle} {...cell.getCellProps()}>
          {cell.render('Cell')}
        </td>
      ))}
    </tr>
  );
};
