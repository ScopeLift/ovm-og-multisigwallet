import { FC, useEffect, useState, useContext } from 'react';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { Modal, ModalContext } from 'components/Modal';
import { abi as multisigAbi } from 'abi/MultiSigWallet.json';
import { CloseIcon } from 'components/Images';
import useSWR from 'swr';
import { fetcher } from 'utils/fetcher';
import { Form, Field } from 'react-final-form';
import { FORM_ERROR } from 'final-form';

interface FormValues {
  nConfirms: number;
}

interface FormErrors {
  nConfirms?: string;
}

interface ConfirmsModalProps {
  address: string;
  currentConfirmations: number;
}

export const ConfirmsModal: FC<ConfirmsModalProps> = ({ address, currentConfirmations }) => {
  const { library } = useWeb3React<Web3Provider>();
  const { clearModal } = useContext(ModalContext);
  const contract = new Contract(address, multisigAbi);
  const {
    data: owners,
    mutate,
  }: {
    data?: string[];
    mutate: Function;
  } = useSWR(library ? [address, 'getOwners'] : null, {
    fetcher: fetcher(library, multisigAbi),
  });

  useEffect(() => {
    mutate(undefined, true);
  }, []);

  const canSubmit = (values: FormValues, errors: FormErrors) => {
    const hasValues = values.nConfirms && values.nConfirms !== currentConfirmations;
    const hasErrors = Boolean(Object.keys(errors).length);

    return hasValues && !hasErrors;
  };

  const changeRequirement = async (nConfirms: number) => {
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

  const sendTx = async ({ nConfirms }: FormValues) => {
    try {
      const receipt = await changeRequirement(nConfirms);
      clearModal();
      return receipt;
    } catch (e) {
      return { [FORM_ERROR]: e.message };
    }
  };

  const itemStyle = 'flex justify-between items-center';
  const inputStyle = 'border border-gray-500 w-40 font-mono';
  const labelStyle = '';

  return (
    <Modal>
      <div className="flex justify-between w-full bg-gray-200 p-3 font-semibold">
        <h2>Change Signature Requirement</h2>
        <CloseIcon
          className="opacity-50 hover:opacity-80 hover:cursor-pointer"
          onClick={() => clearModal()}
        />
      </div>
      <Form
        onSubmit={sendTx}
        initialValues={{
          nConfirms: currentConfirmations,
        }}
        validate={({ nConfirms }: FormValues) => {
          const errors: FormErrors = {};
          if (nConfirms < 1) {
            errors.nConfirms = 'Signature requirement must be at least 1';
          } else if (nConfirms > (owners?.length ?? 1)) {
            errors.nConfirms = 'Cannot require more signatures than owners';
          }

          return errors;
        }}
        render={({ handleSubmit, errors, submitting, values, submitError }) => (
          <>
            {Boolean(submitError) && (
              <div className="bg-red-100 border border-red-500 text-red-500 p-3 m-5">
                {submitError}
              </div>
            )}
            <form className="pb-5" onSubmit={handleSubmit}>
              <ul>
                <li>
                  <Field name="nConfirms" parse={(value) => Number.parseInt(value)}>
                    {({ input, meta }) => (
                      <div className="flex-col m-4">
                        <div className={itemStyle}>
                          <label className={labelStyle}># signatures required</label>
                          <input
                            {...input}
                            type="number"
                            min={1}
                            max={owners?.length ?? 1}
                            className={`${inputStyle} ${
                              meta.error ? 'border border-red-500 text-red-500' : ''
                            }`}
                          />
                        </div>
                        {meta.error && (
                          <div className="text-right text-red-500 m-1">{meta.error}</div>
                        )}
                      </div>
                    )}
                  </Field>
                </li>
              </ul>
              <button
                disabled={!canSubmit(values, errors as FormErrors) || submitting}
                className="btn-primary block mx-auto"
                type="submit"
              >
                Submit
              </button>
            </form>
          </>
        )}
      />
    </Modal>
  );
};
