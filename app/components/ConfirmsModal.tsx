import { useState, useContext } from 'react';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { Modal, ModalContext } from 'components/Modal';
import { abi as multisigAbi } from 'abi/MultiSigWallet.json';
import { CloseIcon } from 'components/Images';

export const ConfirmsModal = ({ address, n }: { address: string; n: number }) => {
  const { library } = useWeb3React<Web3Provider>();
  const { clearModal } = useContext(ModalContext);
  const [nConfirms, setNConfirms] = useState(n);
  const [error, setError] = useState('');
  const contract = new Contract(address, multisigAbi);

  const changeRequirement = async () => {
    const tx = await contract
      .connect(library.getSigner())
      .submitTransaction(
        contract.address,
        0,
        contract.interface.encodeFunctionData('changeRequirement', [nConfirms])
      );
    const receipt = await tx.wait();
    return receipt;
  };

  const sendTx = async (e) => {
    e.preventDefault();
    try {
      const receipt = await changeRequirement();
      clearModal();
      return receipt;
    } catch (e) {
      setError(e.message);
    }
  };

  const itemStyle = 'flex justify-between p-4 items-center';
  const inputStyle = 'border border-gray-500 w-40 font-mono p-1';
  const labelStyle = 'mr-3';
  return (
    <Modal>
      <div className="flex justify-between w-full bg-gray-200 p-3 font-semibold">
        <h2>Change Signature Requirement</h2>
        <CloseIcon
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
            <label className={labelStyle}># signatures required</label>
            <input
              type="number"
              className={inputStyle}
              value={nConfirms}
              onChange={(e) => setNConfirms(parseInt(e.target.value))}
            />
          </li>
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
