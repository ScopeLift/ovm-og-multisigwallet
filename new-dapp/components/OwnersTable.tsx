import React, { useEffect, useContext } from 'react';
import useSWR from 'swr';
import { fetcher } from 'utils/fetcher';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { abi } from 'abi/MultiSigWallet.json';
import { truncateAddress } from 'utils/truncate';
import { ModalContext } from 'components/Modal';
import { ToastContext } from 'components/Toast';
import { AddOwnerModal, ReplaceOwnerModal } from 'components/OwnerModal';

export const Owners = ({ address }) => {
  const { library, account } = useWeb3React<Web3Provider>();
  const { setModalContent, setModalVisible } = useContext(ModalContext);
  const { setToast } = useContext(ToastContext);
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

  const replaceOwner = (ownerToBeReplaced) => {
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
        contract.address,
        0,
        contract.interface.encodeFunctionData('removeOwner', [owner])
      );
    const receipt = await tx.wait();
    return receipt;
  };

  if (!owners) return <></>;

  const cellStyle = 'border border-gray-500 p-2';
  return (
    <>
      <div className="flex items-center my-5">
        <h2 className="block text-xl mr-2">Owners</h2>
        <div>
          <button
            className="bg-gradient-to-r from-green-400 to-blue-500 px-3 py-2 text-white text-sm font-semibold rounded"
            onClick={addOwner}
          >
            Add new owner
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
              <td className={cellStyle}>{owner}</td>
              <td className={cellStyle}>
                <button
                  className="px-2 mr-2 font-sans rounded border border-gray-300 text-sm"
                  onClick={() => replaceOwner(owner)}
                >
                  Replace
                </button>
                <button
                  className="px-2 font-sans rounded border border-gray-300 text-sm"
                  onClick={() => removeOwner(owner)}
                >
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
