import { isAddress } from '@ethersproject/address';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { abi } from 'abi/MultiSigWallet.json';
import { ModalContext } from 'components/Modal';
import { AddOwnerModal, ReplaceOwnerModal } from 'components/OwnerModal';
import { ToastContext } from 'components/Toast';
import { Contract } from 'ethers';
import { useRouter } from 'next/router';
import React, { createContext, FC, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { fetcher } from 'utils/fetcher';

type OwnersContextType = {
  isLoading: boolean;
  owners: string[];
  isAccountOwner: boolean;
  addOwner: () => void;
  replaceOwner: (owner: string) => void;
  removeOwner: (owner: string) => void;
};

export const OwnersContext = createContext({} as OwnersContextType);

export const OwnersProvider: FC = ({ children }) => {
  const { query } = useRouter();
  const address = query.address as string;
  const { library, account, chainId } = useWeb3React<Web3Provider>();
  const { setModalContent, setModalVisible } = useContext(ModalContext);
  const { setToast } = useContext(ToastContext);

  const contract = useMemo(
    () => (address && isAddress(address) ? new Contract(address, abi) : null),
    [address]
  );

  const {
    data: owners,
    mutate,
  }: {
    data?: string[];
    mutate: Function;
  } = useSWR(library ? [address, 'getOwners'] : null, {
    fetcher: fetcher(library, abi),
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

  const addOwner = () => {
    if (!account)
      return setToast({
        type: 'error',
        content: 'Please connect your wallet before you manage owners.',
        timeout: 5000,
      });
    setModalContent(<AddOwnerModal address={address} />);
    setModalVisible(true);
  };

  const replaceOwner = (ownerToBeReplaced: string) => {
    if (!account)
      return setToast({
        type: 'error',
        content: 'Please connect your wallet before you manage owners.',
        timeout: 5000,
      });
    setModalContent(<ReplaceOwnerModal address={address} ownerToBeReplaced={ownerToBeReplaced} />);
    setModalVisible(true);
  };

  const removeOwner = async (owner: string) => {
    if (!account)
      return setToast({
        type: 'error',
        content: 'Please connect your wallet before you manage owners.',
        timeout: 5000,
      });
    const tx = await contract
      .connect(library.getSigner())
      .submitTransaction(
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
