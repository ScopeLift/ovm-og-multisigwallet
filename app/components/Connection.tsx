import { FC, useEffect, useRef } from 'react';
import { truncateAddress } from 'utils/truncate';
import Jazzicon from './Jazzicon';

interface ConnectionProps {
  active: boolean;
  account: string;
  activatingConnector: boolean;
  showConnectionModal: () => void;
}

export const Connection: FC<ConnectionProps> = ({
  active,
  account,
  activatingConnector,
  showConnectionModal,
}) => {
  return (
    <button
      className="flex items-center ml-4 p-1 rounded border-2 border-gray-100"
      onClick={() => showConnectionModal()}
    >
      {active && account ? (
        <span className="font-mono">{truncateAddress(account)}</span>
      ) : !!activatingConnector ? (
        'Activating...'
      ) : (
        'Connect Wallet'
      )}
      <Jazzicon address={account} />
    </button>
  );
};
