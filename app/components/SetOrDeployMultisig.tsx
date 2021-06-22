import { useState, useContext } from 'react';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { ModalContext } from 'components/Modal';
import { abi as factoryAbi } from 'abi/MultiSigWalletFactory.json';
import { config } from 'config';
import { validateOwners } from '../utils';

export const SetOrDeployMultisig = ({
  address,
  setMultisigAddress,
}: {
  address?: string;
  setMultisigAddress: Function;
}) => {
  const { library, chainId, account } = useWeb3React<Web3Provider>();
  const [error, setError] = useState('');
  const [inputAddress, setInputAddress] = useState('');
  const [nOwnerInputs, setNOwnerInputs] = useState(1);
  const [owners, setOwners] = useState<string[]>([]);
  const [nConfirmations, setNConfirmations] = useState(1);
  const { setModalContent, setModalVisible } = useContext(ModalContext);

  const openMultisig = (e) => {
    e.preventDefault();
    setMultisigAddress(inputAddress);
  };

  const deployMultisig = async (e) => {
    e.preventDefault();
    try {
      const factory = new Contract(config.networks[chainId].multisigFactoryAddress, factoryAbi);
      await validateOwners({ owners, required: nConfirmations });
      const tx = await factory.connect(library.getSigner()).create(owners, nConfirmations);
      const receipt = await tx.wait();
      const log = factory.interface.parseLog(
        receipt.logs.find(({ topics }) =>
          topics.includes(factory.interface.getEventTopic('ContractInstantiation'))
        )
      );
      console.log('MultiSigWallet instantiated at:', log.args.instantiation);
      setMultisigAddress(log.args.instantiation);
    } catch (e) {
      setError(e.message);
    }
  };

  if (address) return <></>;
  return (
    <div className="flex h-full flex-col items-center mt-10">
      <div className="py-2 px-3 rounded-t bg-gradient-to-r w-1/2 from-purple-400 to-red-500 font-semibold text-white">
        <h2>OG Gnosis Multisig on OVM</h2>
      </div>
      <div className="bg-gray-200 w-1/2 p-5">
        {error && <div>{error}</div>}
        <div>
          <form>
            <label>Enter multisig contract address:</label>
            <input
              className="block m-2 p-2 w-5/6 font-mono mx-auto"
              onChange={(e) => setInputAddress(e.target.value)}
            />
            <button
              className="block bg-gradient-to-r from-green-400 to-blue-500 px-3 py-2 text-white text-sm font-semibold rounded mx-auto"
              onClick={openMultisig}
            >
              Open Multisig
            </button>
          </form>
        </div>
        <div className="mx-auto my-5 text-center">- or -</div>
        <div>
          Create multisig:
          <form className="">
            <ul className="block mx-auto">
              {[...Array(nOwnerInputs).keys()].map((n) => (
                <li key={n} className="my-1 p-2 w-5/6 mx-auto">
                  <label className="text-sm text-gray-600">Owner {n + 1}:</label>
                  <input
                    className="font-mono w-full my-1 mx-2 p-1"
                    onChange={(e) => {
                      const ownerArr = owners;
                      ownerArr[n] = e.target.value;
                      return setOwners(ownerArr);
                    }}
                  />
                </li>
              ))}
              <li className="text-center">
                {nOwnerInputs > 1 && (
                  <button
                    className="bg-gray-200 text-red-500 border border-red-300 px-1 text-sm rounded mr-2"
                    onClick={(e) => {
                      e.preventDefault();
                      setOwners(owners.slice(0, nOwnerInputs - 1));
                      setNOwnerInputs(nOwnerInputs - 1);
                    }}
                  >
                    - Remove Owner
                  </button>
                )}
                <button
                  className="bg-gray-200 text-gray-500 border border-gray-300 px-1 text-sm rounded"
                  onClick={(e) => {
                    e.preventDefault();
                    setNOwnerInputs(nOwnerInputs + 1);
                  }}
                >
                  + Add Additional Owner
                </button>
              </li>
              <li className="m-2 p-2 w-5/6 mx-auto">
                <label className="text-sm text-gray-500 p-1">
                  # signatures required per transaction:
                </label>
                <input
                  className="block p-1 m-2"
                  type="number"
                  value={nConfirmations}
                  onChange={(e) => setNConfirmations(parseInt(e.target.value))}
                />
              </li>
            </ul>
            <button
              className="block bg-gradient-to-r from-green-400 to-blue-500 px-3 py-2 text-white text-sm font-semibold rounded mx-auto"
              onClick={deployMultisig}
            >
              Deploy Multisig
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
