import { isAddress } from '@ethersproject/address';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { abi as multisigAbi } from 'abi/MultiSigWallet.json';
import { Contract } from 'ethers';
import { useRouter } from 'next/router';
import React, { createContext, FC, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { fetcher } from 'utils/fetcher';

type OwnersContextType = {
  isLoading: boolean;
  owners: string[];
  isAccountOwner: boolean;
  addOwner: (owner: string) => Promise<unknown>;
  replaceOwner: (owner: string, newOwner: string) => Promise<unknown>;
  removeOwner: (owner: string) => Promise<unknown>;
};

export const OwnersContext = createContext({} as OwnersContextType);

export const OwnersProvider: FC = ({ children }) => {
  const { query } = useRouter();
  const address = query.address as string;
  const { library, account, chainId } = useWeb3React<Web3Provider>();

  const contract = useMemo(
    () => (address && isAddress(address) ? new Contract(address, multisigAbi) : null),
    [address]
  );

  const {
    data: owners,
    mutate,
  }: {
    data?: string[];
    mutate: Function;
  } = useSWR(library ? [address, 'getOwners'] : null, {
    fetcher: fetcher(library, multisigAbi),
  });

  useEffect(() => {
    mutate(undefined, true);
  }, [chainId]);

  useEffect(() => {
    if (!contract || !library) return;

    const addition = contract.filters.OwnerAddition(null);
    const removal = contract.filters.OwnerRemoval(null);
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
  }, [contract, library]);

  const isAccountOwner = useMemo(() => owners?.includes(account), [owners, account]);

  const addOwner = async (owner: string) => {
    const tx = await contract
      ?.connect(library.getSigner())
      ?.submitTransaction(
        contract.address,
        0,
        contract.interface.encodeFunctionData('addOwner', [owner])
      );
    const receipt = await tx.wait();
    return receipt;
  };

  const replaceOwner = async (owner: string, newOwner: string) => {
    const tx = await contract
      ?.connect(library.getSigner())
      ?.submitTransaction(
        contract.address,
        0,
        contract.interface.encodeFunctionData('replaceOwner', [owner, newOwner])
      );
    const receipt = await tx.wait();
    return receipt;
  };

  const removeOwner = async (owner: string) => {
    const tx = await contract
      ?.connect(library.getSigner())
      ?.submitTransaction(
        contract?.address,
        0,
        contract?.interface.encodeFunctionData('removeOwner', [owner])
      );
    const receipt = await tx.wait();
    return receipt;
  };

  const isLoading = useMemo(() => typeof owners === 'undefined', [owners]);

  return (
    <OwnersContext.Provider
      value={{ isLoading, owners, isAccountOwner, addOwner, replaceOwner, removeOwner }}
    >
      {children}
    </OwnersContext.Provider>
  );
};
