import { useWeb3React } from '@web3-react/core';

export const ChainId = () => {
  const { chainId } = useWeb3React();
  if (!chainId) return null;
  return (
    <>
      <div className="py-1 px-2 rounded border border-gray-400 text-xs text-gray-400 mr-2">
        Chain Id: {chainId}
      </div>
    </>
  );
};
