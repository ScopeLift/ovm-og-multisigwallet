import React, { FC, useContext } from 'react';
import { useTable, useSortBy, Column, usePagination } from 'react-table';
import { TransactionRow } from 'components/TransactionRow';
import { TransactionsContext } from 'contexts/TransactionsContext';
import { ClickableAddress } from './ClickableAddress';
import { ModalContext } from './Modal';
import { TransactionDataModal } from './TransactionDataModal';
import { OwnersContext } from 'contexts/OwnersContext';

interface TransactionsTableProps {
  account: string;
  address: string;
}

export const TransactionsTable: FC<TransactionsTableProps> = ({ account, address }) => {
  const { isAccountOwner } = useContext(OwnersContext);
  const { transactions, addNewTx, confirmTx, revokeConfirmation } = useContext(TransactionsContext);
  const { setModal } = useContext(ModalContext);

  const showTransactionDataModal = (txId: number, data: string) => {
    setModal({
      content: <TransactionDataModal txId={txId} data={data} />,
      styleClass: 'sm:w-full',
    });
  };

  const columns = React.useMemo(
    () =>
      [
        {
          Header: 'ID',
          accessor: 'id',
        },
        {
          Header: 'Destination',
          accessor: 'address',
          Cell: ({ value }) => <ClickableAddress address={value} truncate withJazzicon />,
        },
        {
          Header: 'Data',
          accessor: 'data',
          disableSortBy: true,
          Cell: ({
            cell: {
              row: {
                values: { id },
              },
            },
            value,
          }) => (
            <span
              className="truncate block w-44 hover:underline cursor-pointer"
              onClick={() => showTransactionDataModal(id, value)}
            >
              {value}
            </span>
          ),
        },
        {
          Header: 'Owner Signatures',
          accessor: 'confirmations',
          disableSortBy: true,
          Cell: ({
            cell: {
              row: {
                values: { id, status },
              },
            },
            value,
          }) => (
            <div className="flex flex-row justify-between">
              <div className="flex flex-row items-center">
                <div className="bg-pink-100 rounded p-3 mr-2">{value?.length}</div>
                <ul>
                  {value?.map((confirmationAddress: string) => (
                    <ClickableAddress
                      key={confirmationAddress}
                      address={confirmationAddress}
                      truncate
                      withJazzicon
                    />
                  ))}
                </ul>
              </div>
              {status === 'pending' &&
                isAccountOwner &&
                (!value?.includes(account) ? (
                  <button
                    className="text-sm border border-gray-400 rounded px-2 ml-2"
                    onClick={() => confirmTx(id)}
                  >
                    Sign
                  </button>
                ) : (
                  <button
                    className="text-sm border border-gray-400 rounded px-2 ml-2"
                    onClick={() => revokeConfirmation(id)}
                  >
                    Revoke
                  </button>
                ))}
            </div>
          ),
        },
        {
          Header: 'Status',
          accessor: 'status',
          Cell: ({ value }) => (
            <div>
              {value === 'executed' ? (
                <span className="text-green-400 mr-1">✔</span>
              ) : value === 'failed' ? (
                <span className="text-red-400 mr-1">✕</span>
              ) : (
                ''
              )}
              <span className="">{value}</span>
            </div>
          ),
        },
      ] as Column[],
    []
  );

  const data = React.useMemo(() => transactions ?? [], [transactions]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageCount,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      autoResetPage: false,
      disableSortRemove: true,
      initialState: {
        pageSize: 5,
        sortBy: [{ id: 'id', desc: true }],
      },
    },
    useSortBy,
    usePagination
  );

  const cellStyle = 'border border-gray-500 p-2';

  if (!transactions?.length) return <></>;

  return (
    <div className="my-10">
      <div className="flex items-center my-5">
        <h2 className="block text-xl mr-2">Transactions</h2>
        {isAccountOwner && (
          <button className="btn-primary" onClick={addNewTx}>
            Add Transaction
          </button>
        )}
      </div>
      <table {...getTableProps()} className="table-auto font-mono border border-gray-500 w-full">
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())} className={cellStyle}>
                  {column.render('Header')}
                  <span>{column.isSorted ? (column.isSortedDesc ? ' ▼' : ' ▲') : ''}</span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row) => {
            prepareRow(row);

            return (
              <TransactionRow
                key={row.values.id}
                address={address}
                transactionId={row.values.id}
                row={row}
                cellStyle={cellStyle}
              />
            );
          })}
        </tbody>
      </table>
      <div className="mt-2 text-right">
        <select
          value={pageSize}
          onChange={({ target: { value } }) => {
            setPageSize(Number(value));
          }}
        >
          {[5, 7, 10, 25, 'All'].map((pageSize) => (
            <option key={pageSize} value={pageSize === 'All' ? transactions.length ?? 1 : pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
        {' | '}
        {canPreviousPage && (
          <button
            className="mr-3 text-sm border border-gray-300 px-2"
            onClick={() => previousPage()}
          >
            Prev{' '}
          </button>
        )}
        {`Page ${pageIndex + 1} of ${pageCount}`}
        {canNextPage && (
          <button className="ml-3 text-sm border border-gray-300 px-2" onClick={() => nextPage()}>
            Next
          </button>
        )}
      </div>
    </div>
  );
};
