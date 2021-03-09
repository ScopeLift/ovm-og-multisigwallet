import React, { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { fetcher } from 'utils/fetcher';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { Wallet } from '@ethersproject/wallet';
import { abi } from 'abi/MultiSigWallet.json';
import { truncateAddress } from 'utils/truncate';

export const Owners = ({ address }) => {
  const { account, library } = useWeb3React<Web3Provider>();
  const {
    data: owners,
    mutate,
  }: {
    data?: string[];
    mutate: Function;
  } = useSWR(library ? [address, 'getOwners'] : null, {
    fetcher: fetcher(library, abi),
  });
  const contract = new Contract(address, abi);

  useEffect(() => {
    if (!library) return;
    const addition = contract.filters.OwnerAddition(null);
    const removal = contract.filters.OwnerRemoval(null);
    console.log('owners: ', owners);
    library.on(addition, (event) => {
      console.log('Owner addition', { event });
      mutate(undefined, true);
    });
    library.on(removal, (owner, event) => {
      console.log('Owner removal', { event });
      mutate(undefined, true);
    });
    return () => {
      library.removeAllListeners(addition);
      library.removeAllListeners(removal);
    };
  }, [library]);

  const addOwner = async (contract) => {
    try {
      const tx = await contract
        .connect(library.getSigner())
        .submitTransaction(
          contract.address,
          0,
          contract.interface.encodeFunctionData('addOwner', [Wallet.createRandom().address])
        );
      const receipt = tx.wait();
      return receipt;
    } catch (e) {
      console.log(e);
    }
  };

  const removeOwner = async (owner: string) => {
    const tx = await contract
      .connect(library.getSigner())
      .submitTransaction(
        contract.address,
        0,
        contract.interface.encodeFunctionData('removeOwner', [owner])
      );
    const receipt = tx.wait();
    return receipt;
  };

  const replaceOwner = async (owner: string, newOwner: string) => {
    const tx = await contract
      .connect(library.getSigner())
      .submitTransaction(
        contract.address,
        0,
        contract.interface.encodeFunctionData('replaceOwner', [owner, newOwner])
      );
    const receipt = tx.wait();
    return receipt;
  };

  if (!owners) return <div>...</div>;

  const newOwner = Wallet.createRandom().address;
  const cellStyle = 'border border-gray-500 p-2';
  return (
    <>
      <div className="flex items-center my-5">
        <h2 className="block text-xl mr-2">Owners</h2>
        <div>
          <button
            className="bg-gradient-to-r from-green-400 to-blue-500 px-3 py-2 text-white text-sm font-semibold rounded"
            onClick={() => addOwner(contract)}
          >
            Add new
          </button>
        </div>
      </div>
      <table className="table-fixed font-mono border border-gray-500">
        <thead>
          <tr>
            <th className={cellStyle}>Owner Address</th>
            <th className={cellStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {owners.map((owner) => (
            <tr key={owner}>
              <td className={cellStyle}>{truncateAddress(owner)}</td>
              <td className={cellStyle}>
                <button className="p-2">Edit</button>
                <button className="p-2" onClick={() => replaceOwner(owner, newOwner)}>
                  Replace
                </button>
                <button className="p-2" onClick={() => removeOwner(owner)}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};
