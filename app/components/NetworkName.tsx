import { useWeb3React } from '@web3-react/core';
import { FC } from 'react';
import { config } from '../config';

interface NetworkNameProps {
  showConnectionModal: () => void;
}

export const NetworkName: FC<NetworkNameProps> = ({ showConnectionModal }) => {
  const { chainId } = useWeb3React();
  if (!chainId) return null;

  return (
    <>
      <button
        onClick={() => showConnectionModal()}
        className={[
          'flex items-center py-1 px-2 text-xs rounded',
          config.networks[chainId] ? 'bg-gradient-to-r from-purple-400 to-red-500' : 'bg-red-400',
        ].join(' ')}
      >
        {config.networks[chainId] ? config.networks[chainId].name : 'Unknown Network'}
      </button>
    </>
  );
};
