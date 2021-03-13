import React, { useEffect, useContext } from 'react';
import useSWR from 'swr';
import { fetcher } from 'utils/fetcher';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { abi } from 'abi/MultiSigWallet.json';
import { ModalContext } from 'components/Modal';
import { ConfirmsModal } from 'components/ConfirmsModal';

export const MultisigInfo = ({ address, setMultisigAddress }) => {
  const { library } = useWeb3React<Web3Provider>();
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

  const clearMultisigAddress = (e) => {
    e.preventDefault();
    setMultisigAddress('');
  };

  const showRequirementModal = (e) => {
    e.preventDefault();
    setModal({
      content: <ConfirmsModal address={address} n={parseInt(nConfirmations)} />,
      styleClass: 'sm:w-full',
    });
  };

  const nConfirms = parseInt(nConfirmations || '0');

  return (
    <div className="bg-gradient-to-r from-purple-100 via-yellow-300 to-red-100 rounded-lg p-6">
      <h2 className="text-xl">
        Multisig {address}
        <button
          className="ml-2 text-sm rounded border px-2 border-gray-400 bg-gray-100 text-gray-800"
          onClick={clearMultisigAddress}
        >
          Switch
        </button>
      </h2>
      <div className="">
        {nConfirms} {nConfirms > 1 ? 'confirmations' : 'confirmation'} needed to execute a
        transaction{' '}
        <button
          className="text-sm rounded border px-2  border-gray-400 bg-gray-100 text-gray-800"
          onClick={showRequirementModal}
        >
          Change requirement
        </button>
      </div>
    </div>
  );
};
