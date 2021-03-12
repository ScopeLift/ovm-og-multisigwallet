import { useState, useEffect, useContext } from 'react';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { Modal, ModalContext } from 'components/Modal';
import { abi as multisigAbi } from 'abi/MultiSigWallet.json';
import Image from 'next/image';

export const AddOwnerModal = ({ address }) => <OwnerModal address={address} addOrReplace="add" />;
export const ReplaceOwnerModal = ({ address, ownerToBeReplaced }) => (
  <OwnerModal address={address} addOrReplace="replace" ownerToBeReplaced={ownerToBeReplaced} />
);

export const OwnerModal = ({
  address,
  addOrReplace,
  ownerToBeReplaced,
}: {
  address: string;
  addOrReplace: 'add' | 'replace';
  ownerToBeReplaced?: string;
}) => {
  const { library } = useWeb3React<Web3Provider>();
  const { clearModal } = useContext(ModalContext);
  const [newOwnerAddress, setNewOwnerAddress] = useState('');
  const [oldOwnerAddress, setOldOwnerAddress] = useState(ownerToBeReplaced);
  const [error, setError] = useState('');
  const contract = new Contract(address, multisigAbi);

  const addOwner = async (owner: string) => {
    const tx = await contract
      .connect(library.getSigner())
      .submitTransaction(
        contract.address,
        0,
        contract.interface.encodeFunctionData('addOwner', [owner])
      );
    const receipt = await tx.wait();
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
    const receipt = await tx.wait();
    return receipt;
  };

  const sendTx = async (e) => {
    e.preventDefault();
    try {
      const receipt =
        addOrReplace === 'add'
          ? await addOwner(newOwnerAddress)
          : await replaceOwner(oldOwnerAddress, newOwnerAddress);
      clearModal();
      return receipt;
    } catch (e) {
      setError(e.message);
    }
  };

  const itemStyle = 'flex justify-between p-4 items-center';
  const inputStyle = 'border border-gray-500 w-80 font-mono';
  const labelStyle = '';
  return (
    <Modal>
      <div className="flex justify-between w-full bg-gray-200 p-3 font-semibold">
        <h2>{addOrReplace === 'add' ? 'Add' : 'Change'} Owner</h2>
        <Image
          src="/x.svg"
          width="20"
          height="20"
          className="opacity-50 hover:opacity-80 hover:cursor-pointer"
          onClick={() => clearModal()}
        />
      </div>
      {error && (
        <div className="bg-red-100 border border-red-500 text-red-500 p-3 m-5">{error}</div>
      )}
      <form className="pb-5">
        <ul>
          <li className={itemStyle}>
            <label className={labelStyle}>New owner address</label>
            <input
              className={inputStyle}
              placeholder=""
              onChange={(e) => setNewOwnerAddress(e.target.value)}
            />
          </li>
          {addOrReplace === 'replace' && (
            <li className={itemStyle}>
              <label className={labelStyle}>Replaced owner address</label>
              <input
                className={inputStyle}
                placeholder=""
                value={oldOwnerAddress}
                onChange={(e) => setOldOwnerAddress(e.target.value)}
              />
            </li>
          )}
        </ul>
        <button
          className="mx-auto block bg-gradient-to-r from-green-400 to-blue-500 px-3 py-2 text-white font-semibold rounded"
          onClick={sendTx}
        >
          Submit
        </button>
      </form>
    </Modal>
  );
};
