import React, { FC, useContext } from 'react';
import { ClickableAddress } from './ClickableAddress';
import { OwnersContext } from 'contexts/OwnersContext';
import { ModalContext } from './Modal';
import { AddOwnerModal, ReplaceOwnerModal } from './OwnerModal';
import { ToastContext } from './Toast';

interface OwnersTableProps {
  account: string;
  address: string;
}

export const OwnersTable: FC<OwnersTableProps> = ({ account, address }) => {
  const { owners, isAccountOwner, removeOwner } = useContext(OwnersContext);
  const { setModal } = useContext(ModalContext);
  const { setToast } = useContext(ToastContext);

  const showAddOwnerModal = () => {
    if (!account)
      return setToast({
        type: 'error',
        content: 'Please connect your wallet before you manage owners.',
        timeout: 5000,
      });

    setModal({ content: <AddOwnerModal address={address} /> });
  };

  const showReplaceOwnerModal = (ownerToBeReplaced: string) => {
    if (!account)
      return setToast({
        type: 'error',
        content: 'Please connect your wallet before you manage owners.',
        timeout: 5000,
      });

    setModal({
      content: <ReplaceOwnerModal address={address} ownerToBeReplaced={ownerToBeReplaced} />,
    });
  };

  const tryRemoveOwner = async (owner: string) => {
    if (!account)
      return setToast({
        type: 'error',
        content: 'Please connect your wallet before you manage owners.',
        timeout: 5000,
      });

    removeOwner(owner);
  };

  const cellStyle = 'border border-gray-500 p-2';

  if (!owners) return <></>;

  return (
    <>
      <div className="flex items-center my-5">
        <h2 className="block text-xl mr-2">Owners</h2>
        {isAccountOwner && (
          <button className="btn-primary" onClick={() => showAddOwnerModal()}>
            Add Owner
          </button>
        )}
      </div>
      <table className="table-fixed font-mono border border-gray-500">
        <thead>
          <tr>
            <th className={cellStyle}>Owner Address</th>
            {isAccountOwner && <th className={cellStyle}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {owners.map((owner) => (
            <tr key={owner}>
              <td className={cellStyle}>
                <ClickableAddress address={owner} withJazzicon />
              </td>
              {isAccountOwner && (
                <td className={cellStyle}>
                  <button
                    className="px-2 mr-2 font-sans rounded border border-gray-300 text-sm"
                    onClick={() => showReplaceOwnerModal(owner)}
                  >
                    Replace
                  </button>
                  <button
                    className="px-2 font-sans rounded border border-gray-300 text-sm"
                    onClick={() => tryRemoveOwner(owner)}
                  >
                    Remove
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};
