import { FC, MouseEvent, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { useRouter } from 'next/router';
import { Contract } from '@ethersproject/contracts';
import { abi as factoryAbi } from 'abi/MultiSigWalletFactory.json';
import { config } from 'config';
import { bytesAreSafe } from '../utils';
import { isAddress } from '@ethersproject/address';
import { Form, Field } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import { FieldArray } from 'react-final-form-arrays';
import { FORM_ERROR } from 'final-form';

interface FormValues {
  nConfirms: number;
  owners: string[];
}

interface FormErrors {
  nConfirms?: string;
  owners: string[];
}

interface SetOrDeployMultisigProps {
  address?: string;
}

export const SetOrDeployMultisig: FC<SetOrDeployMultisigProps> = ({ address }) => {
  const { library, chainId } = useWeb3React<Web3Provider>();
  const [inputAddress, setInputAddress] = useState('');
  const router = useRouter();

  const openMultisig = (e: MouseEvent) => {
    e.preventDefault();
    router.push(`/wallet/${inputAddress}`);
  };

  const canSubmit = (values: FormValues, errors: FormErrors) => {
    const hasValues =
      values.nConfirms &&
      values.owners.reduce((prevOwner, curOwner) => prevOwner && Boolean(curOwner?.length), true);
    const hasErrors = Boolean(
      errors.nConfirms?.length || errors.owners.some((owner) => Boolean(owner))
    );

    return hasValues && !hasErrors;
  };

  const deployMultisig = async ({ owners, nConfirms }: FormValues) => {
    try {
      const factory = new Contract(config.networks[chainId].multisigFactoryAddress, factoryAbi);
      const tx = await factory.connect(library.getSigner()).create(owners, nConfirms);
      const receipt = await tx.wait();
      const log = factory.interface.parseLog(
        receipt.logs.find(({ topics }) =>
          topics.includes(factory.interface.getEventTopic('ContractInstantiation'))
        )
      );
      console.log('MultiSigWallet instantiated at:', log.args.instantiation);
      router.push(`/wallet/${log.args.instantiation}`);
    } catch (e) {
      return { [FORM_ERROR]: e.message };
    }
  };

  if (address) return <></>;

  return (
    <div className="flex h-full flex-col items-center mt-10">
      <div className="w-full py-2 px-3 rounded-t bg-gradient-to-r lg:w-1/2 from-purple-400 to-red-500 font-semibold text-white">
        <h2>OG Gnosis Multisig on OVM</h2>
      </div>
      <div className="w-full bg-gray-200 lg:w-1/2 p-5">
        <div>
          <form>
            <label>Enter multisig contract address:</label>
            <input
              className="block m-2 p-2 w-5/6 font-mono mx-auto"
              onChange={(e) => setInputAddress(e.target.value)}
            />
            <button className="btn-primary block mx-auto text-sm" onClick={openMultisig}>
              Open Multisig
            </button>
          </form>
        </div>
        <div className="mx-auto my-5 text-center">- or -</div>
        <div>
          Create multisig:
          <Form
            onSubmit={deployMultisig}
            initialValues={{
              owners: [''],
              nConfirms: 1,
            }}
            mutators={{
              ...arrayMutators,
            }}
            validate={({ owners, nConfirms }: FormValues) => {
              const errors: FormErrors = {
                owners: [],
              };

              if (nConfirms < 1) {
                errors.nConfirms = 'Signature requirement must be at least 1';
              } else if (owners.length && nConfirms > owners.length) {
                errors.nConfirms = 'Cannot require more signatures than owners';
              }

              owners.forEach((owner, index) => {
                if (!owner?.length) return;

                if (!isAddress(owner)) {
                  errors.owners[index] = 'Please enter a valid address';
                } else if (!bytesAreSafe(owner)) {
                  errors.owners[index] =
                    'This address contains a byte sequence that is unsafe as an OVM constructor parameter. Please remove the address here and add it to the multisig after it is deployed.';
                } else if (
                  owners.length -
                    owners.map((o) => o.toUpperCase()).filter((o) => o !== owner.toUpperCase())
                      .length >
                  1
                ) {
                  errors.owners[index] = 'Owner addresses must be unique';
                }
              });

              return errors;
            }}
            render={({
              handleSubmit,
              form: {
                mutators: { push, pop },
              },
              errors,
              submitting,
              submitError,
              values,
            }) => (
              <>
                {Boolean(submitError) && (
                  <div className="bg-red-100 border border-red-500 text-red-500 p-3 m-5">
                    {submitError}
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <ul className="block mx-auto">
                    <FieldArray name="owners">
                      {({ fields }) =>
                        fields.map((address, index) => (
                          <li key={address} className="my-1 p-2 md:w-5/6 mx-auto">
                            <Field name={address} parse={(value) => String(value)}>
                              {({ input, meta }) => (
                                <>
                                  <label className="text-sm text-gray-600">
                                    Owner {index + 1}:
                                  </label>
                                  <input
                                    {...input}
                                    type="text"
                                    className={`font-mono w-full my-1 p-1 ${
                                      meta.error ? 'border border-red-500' : ''
                                    }`}
                                  />
                                  {meta.error && (
                                    <div className="text-red-500 m-1">{meta.error}</div>
                                  )}
                                </>
                              )}
                            </Field>
                          </li>
                        ))
                      }
                    </FieldArray>
                    <li className="text-center">
                      {values.owners.length > 1 && (
                        <button
                          type="button"
                          className="bg-gray-200 text-red-500 border border-red-300 px-1 text-sm rounded mr-2"
                          onClick={() => pop('owners')}
                        >
                          - Remove Owner
                        </button>
                      )}
                      <button
                        type="button"
                        className="bg-gray-200 text-gray-500 border border-gray-300 px-1 text-sm rounded"
                        onClick={() => push('owners', '')}
                      >
                        + Add Additional Owner
                      </button>
                    </li>
                    <li className="m-2 p-2 md:w-5/6 mx-auto">
                      <Field name="nConfirms" parse={(value) => Number.parseInt(value)}>
                        {({ input, meta }) => (
                          <>
                            <label className="text-sm text-gray-500 p-1">
                              # signatures required per transaction:
                            </label>
                            <input
                              {...input}
                              className={`block my-1 p-1 w-full md:w-44 ${
                                meta.error ? 'border border-red-500' : ''
                              }`}
                              type="number"
                              min={1}
                              max={values.owners?.length ?? 1}
                            />
                            {meta.error && <div className="text-red-500 m-1">{meta.error}</div>}
                          </>
                        )}
                      </Field>
                    </li>
                  </ul>
                  <button
                    className="btn-primary block mx-auto text-sm"
                    type="submit"
                    disabled={!canSubmit(values, errors as FormErrors) || submitting}
                  >
                    Deploy Multisig
                  </button>
                </form>
              </>
            )}
          />
        </div>
      </div>
    </div>
  );
};
