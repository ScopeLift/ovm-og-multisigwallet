import { FC, useEffect, useRef } from 'react';
import { truncateAddress } from 'utils/truncate';
import jazzicon from '@metamask/jazzicon';

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
  const jazziconRef = useRef<HTMLDivElement>();

  useEffect(() => {
    if (!account || !jazziconRef.current || jazziconRef.current.childElementCount) return;

    const accountjazziconID = account
      .slice(2)
      .split('')
      .map((char) => char.charCodeAt(0))
      .reduce((prev, cur) => prev + cur, 0);
    const jazziconEl = jazzicon(16, accountjazziconID);
    jazziconRef.current?.appendChild(jazziconEl);
  }, [account]);

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
      <div className="ml-2" ref={jazziconRef} />
    </button>
  );
};
