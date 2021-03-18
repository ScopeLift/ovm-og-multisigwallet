import { useWeb3React } from '@web3-react/core';
import { config } from '../config';

export const NetworkName = () => {
  const { chainId } = useWeb3React();
  if (!chainId) return null;
  return (
    <>
      <div
        className={[
          'py-1 px-2 text-xs rounded',
          config.networks[chainId] ? 'bg-gradient-to-r from-purple-400 to-red-500' : 'bg-red-400',
        ].join(' ')}
      >
        {config.networks[chainId] ? config.networks[chainId].name : 'Unknown Network'}
      </div>
    </>
  );
};
