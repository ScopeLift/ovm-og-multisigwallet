import { useState, useEffect, useContext } from 'react';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { Modal, ModalContext } from 'components/Modal';
import { abi as multisigAbi } from 'abi/MultiSigWallet.json';
import Image from 'next/image';

export const TxModal = ({ address }) => {
  const { library } = useWeb3React<Web3Provider>();
  const { setModalContent, setModalVisible } = useContext(ModalContext);
  const [destination, setDestination] = useState('');
  const [abi, setAbi] = useState('');
  const [methods, setMethods] = useState([]);
  const [method, setMethod] = useState('');
  const [params, setParams] = useState([]);
  const [args, setArgs] = useState({});
  const [error, setError] = useState('');
  useEffect(() => {
    if (!abi) return;
    try {
      const methodNames = JSON.parse(abi)
        .filter((entry) => entry.type === 'function')
        .map((entry) => entry.name);
      setMethods(methodNames);
    } catch (e) {
      setMethods([]);
      setParams([]);
      setError(e.message);
    }
  }, [abi]);

  // Handle the method name switching
  useEffect(() => {
    setArgs({});
    if (!method) return;
    setParams(
      JSON.parse(abi)
        .filter((entry) => entry.type === 'function')
        .find((entry) => entry.name === method).inputs
    );
  }, [method]);

  const handleArgs = (key, val) => {
    setArgs({
      ...args,
      [key]: val,
    });
  };

  const sendTx = async (e) => {
    e.preventDefault();
    try {
      const multisig = new Contract(address, multisigAbi);
      const destinationContract = new Contract(destination, abi);
      const inputs = JSON.parse(abi)
        .filter((entry) => entry.type === 'function')
        .find((entry) => entry.name === method).inputs;
      const tx = await multisig
        .connect(library.getSigner())
        .submitTransaction(
          destinationContract.address,
          0,
          destinationContract.interface.encodeFunctionData(
            method,
            inputs ? inputs.map((input) => args[input.name]) : undefined
          )
        );
      const receipt = await tx.wait();
      setModalVisible(false);
      setModalContent([]);
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
        <h2>Send Transaction</h2>
        <Image
          src="/x.svg"
          width="20"
          height="20"
          className="opacity-50 hover:opacity-80 hover:cursor-pointer"
          onClick={() => setModalVisible(false)}
        />
      </div>
      {error && (
        <div className="bg-red-100 border border-red-800 text-red-800 p-3 m-5">{error}</div>
      )}
      <form className="pb-5">
        <ul>
          <li className={itemStyle}>
            <label className={labelStyle}>Destination</label>
            <input
              className={inputStyle}
              placeholder=""
              onChange={(e) => setDestination(e.target.value)}
            />
          </li>
          <li className={itemStyle}>
            <label className={labelStyle}>ABI string</label>
            <textarea className={inputStyle} onChange={(e) => setAbi(e.target.value)}></textarea>
          </li>
          <li className={itemStyle}>
            <label className={labelStyle}>Method</label>
            <select
              className={inputStyle}
              placeholder=""
              onChange={(e) => setMethod(e.target.value)}
            >
              <option value=""></option>
              {methods.length &&
                methods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
            </select>
          </li>
          {!!params.length && (
            <>
              {params.map((param) => (
                <li key={param.name} className={itemStyle}>
                  <label className={labelStyle}>
                    {param.name}: {param.type}
                  </label>
                  <input
                    className={inputStyle}
                    onChange={(e) => handleArgs(param.name, e.target.value)}
                  />
                </li>
              ))}
            </>
          )}
        </ul>
        {method && (
          <button
            className="mx-auto block bg-gradient-to-r from-green-400 to-blue-500 px-3 py-2 text-white font-semibold rounded"
            onClick={sendTx}
          >
            Submit
          </button>
        )}
      </form>
    </Modal>
  );
};
