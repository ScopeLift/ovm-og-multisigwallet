import React, { FC, useContext } from 'react';
import { ClickableAddress } from './ClickableAddress';
import { OwnersContext } from 'contexts/OwnersContext';

export const OwnersTable: FC = () => {
  const { owners, isAccountOwner, addOwner, replaceOwner, removeOwner } = useContext(OwnersContext);

  const cellStyle = 'border border-gray-500 p-2';

  if (!owners) return <></>;

  return (
    <>
      <div className="flex items-center my-5">
        <h2 className="block text-xl mr-2">Owners</h2>
        {isAccountOwner && (
          <button className="btn-primary" onClick={addOwner}>
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
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};
