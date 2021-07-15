import { useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { useRouter } from 'next/router';
import { Contract } from '@ethersproject/contracts';
import { abi as factoryAbi } from 'abi/MultiSigWalletFactory.json';
import { config } from 'config';
import { ArrowCircleRightIcon } from '@heroicons/react/outline';
import { LightningBoltIcon } from '@heroicons/react/solid';

export const SetOrDeployMultisig = ({ address }: { address?: string }) => {
  const { library, chainId } = useWeb3React<Web3Provider>();
  const [error, setError] = useState('');
  const [inputAddress, setInputAddress] = useState('');
  const [nOwnerInputs, setNOwnerInputs] = useState(1);
  const [owners, setOwners] = useState<string[]>([]);
  const [nConfirmations, setNConfirmations] = useState(1);
  const router = useRouter();

  const openMultisig = (e) => {
    e.preventDefault();
    router.push(`/wallet/${inputAddress}`);
  };

  const deployMultisig = async (e) => {
    e.preventDefault();
    try {
      const factory = new Contract(config.networks[chainId].multisigFactoryAddress, factoryAbi);
      const tx = await factory.connect(library.getSigner()).create(owners, nConfirmations);
      const receipt = await tx.wait();
      const log = factory.interface.parseLog(
        receipt.logs.find(({ topics }) =>
          topics.includes(factory.interface.getEventTopic('ContractInstantiation'))
        )
      );
      console.log('MultiSigWallet instantiated at:', log.args.instantiation);
      router.push(`/wallet/${log.args.instantiation}`);
    } catch (e) {
      setError(e.message);
    }
  };

  if (address) return <></>;
  return (
    <div className="flex h-full flex-col items-center my-10">
      <div className="w-1/2 max-w-xl">
        <div className="px-7 py-5 rounded-t-lg bg-gradient-to-r from-purple-400 to-red-400 font-semibold text-white">
          <h2 className="text-lg leading-6 font-medium text-gray-100">OG Gnosis Multisig on OVM</h2>
        </div>
        <div className="bg-gradient-to-b from-gray-100 to-gray-200 py-5 px-8 rounded-b-lg">
          {error && <div>{error}</div>}
          <div className="my-5">
            <form className="my-2">
              <label className="block text-sm font-medium text-gray-700">
                Enter multisig contract address:
              </label>
              <input
                type="text"
                className="block my-2 font-mono text-sm w-full rounded-md border-gray-300"
                onChange={(e) => setInputAddress(e.target.value)}
              />
              <button
                className="group flex justify-center items-center px-4 py-2 mt-4 mb-6 mx-auto font-medium text-white text-sm bg-gradient-to-r from-green-400 to-blue-500 opacity-80 hover:opacity-90 rounded"
                onClick={openMultisig}
              >
                View Multisig <ArrowCircleRightIcon className="ml-1 -mr-1 h-4 w-4" />
              </button>
            </form>
          </div>
          <Divider />
          <div className="my-5">
            <h3 className="block text-sm font-medium text-gray-700">Deploy new multisig:</h3>
            <form>
              <ul className="block mx-auto">
                {[...Array(nOwnerInputs).keys()].map((n) => (
                  <li key={n} className="my-1 p-2">
                    <label className="text-sm text-gray-700">Owner {n + 1}:</label>
                    <input
                      type="text"
                      className="block my-1 font-mono w-full rounded-md border-gray-300 text-sm"
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
                      className=" text-red-500 border border-red-300 px-1 text-sm rounded mr-2"
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
                    className=" text-gray-500 border border-gray-400 px-1 text-sm rounded"
                    onClick={(e) => {
                      e.preventDefault();
                      setNOwnerInputs(nOwnerInputs + 1);
                    }}
                  >
                    + Add Additional Owner
                  </button>
                </li>
                <li className="mx-2 my-6 w-5/6">
                  <label className="text-sm text-gray-700">
                    # signatures required per transaction:
                  </label>
                  <input
                    className="block my-1 text-sm rounded-md border-gray-300"
                    type="number"
                    value={nConfirmations}
                    onChange={(e) => setNConfirmations(parseInt(e.target.value))}
                  />
                </li>
              </ul>
              <button
                className="group flex justify-center items-center px-4 py-2 mt-4 mb-6 mx-auto font-medium text-white text-sm bg-gradient-to-r from-green-400 to-blue-500 opacity-80 hover:opacity-90 rounded"
                onClick={deployMultisig}
              >
                Deploy Multisig <LightningBoltIcon className="ml-2 -mr-1 h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const Divider = () => {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-gray-300" />
      </div>
      <div className="relative flex justify-center">
        <span className="px-2 bg-gray-100 text-sm text-gray-500">or</span>
      </div>
    </div>
  );
};
