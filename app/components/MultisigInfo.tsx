import React, { useEffect, useContext } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { fetcher } from 'utils/fetcher';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { abi } from 'abi/MultiSigWallet.json';
import { ModalContext } from 'components/Modal';
import { ConfirmsModal } from 'components/ConfirmsModal';
import { ClickableAddress } from './ClickableAddress';
import { OwnersContext } from 'contexts/OwnersContext';

export const MultisigInfo = ({ address }) => {
  const { isAccountOwner } = useContext(OwnersContext);
  const { library, chainId } = useWeb3React<Web3Provider>();
  const { setModal } = useContext(ModalContext);
  const {
    data: nConfirmations,
    mutate,
  }: {
    data?: string;
    mutate: Function;
  } = useSWR(library ? [address, 'required'] : null, {
    fetcher: fetcher(library, abi),
  });

  useEffect(() => {
    mutate(undefined, true);
  }, [chainId]);

  const contract = new Contract(address, abi);

  useEffect(() => {
    if (!library) return;
    const requirementChange = contract.filters.RequirementChange(null);
    library.on(requirementChange, (event) => {
      console.log('n confirmations change', { event });
      mutate(undefined, true);
    });
    return () => {
      library.removeAllListeners(requirementChange);
    };
  }, [library]);

  const showRequirementModal = (e) => {
    e.preventDefault();
    setModal({
      content: <ConfirmsModal address={address} currentConfirmations={parseInt(nConfirmations)} />,
      styleClass: 'sm:w-full',
    });
  };

  const nConfirms = parseInt(nConfirmations || '0');

  return (
    <div className="bg-gradient-to-r from-purple-100 via-yellow-300 to-red-100 rounded-lg p-6">
      <h2 className="flex text-xl">
        <span className="mr-2">Multisig</span>
        <ClickableAddress address={address} />
        <Link href="/">
          <button className="ml-2 text-sm rounded border px-2 border-gray-400 bg-gray-100 text-gray-800">
            Switch
          </button>
        </Link>
      </h2>
      <div className="">
        {nConfirms} {nConfirms > 1 ? 'signatures' : 'signature'} needed to execute a transaction{' '}
        {isAccountOwner && (
          <button
            className="text-sm rounded border px-2  border-gray-400 bg-gray-100 text-gray-800"
            onClick={showRequirementModal}
          >
            Change Threshold
          </button>
        )}
      </div>
    </div>
  );
};
