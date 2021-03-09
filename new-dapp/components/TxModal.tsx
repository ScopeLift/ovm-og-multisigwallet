import { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { Modal } from 'components/Modal';
import { abi as multisigAbi } from '../../build/contracts/ovm/MultiSigWallet.json';

export const TxModal = ({ address }) => {
  const { library } = useWeb3React<Web3Provider>();
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
    console.log(
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
      const receipt = tx.wait();
      return receipt;
    } catch (e) {
      setError(e.message);
    }
  };

  const itemStyle = 'flex justify-between p-4 items-center';
  const inputStyle = 'border border-gray-500 w-80';
  const labelStyle = '';
  return (
    <Modal closeModal={() => {}}>
      {error && (
        <div className="bg-red-100 border border-red-500 text-red-500 p-3 m-5">{error}</div>
      )}
      <form>
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
              {methods.length && methods.map((method) => <option value={method}>{method}</option>)}
            </select>
          </li>
          {!!params.length && (
            <>
              {params.map((param) => (
                <li>
                  <label>
                    {param.name}: {param.type}
                  </label>
                  <input onChange={(e) => handleArgs(param.name, e.target.value)} />
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
