import { useWeb3React } from '@web3-react/core';

export const ChainId = () => {
  const { chainId } = useWeb3React();
  if (!chainId) return null;
  return (
    <>
      <div className="py-1 px-2 rounded bg-gradient-to-r from-purple-400 to-red-500 text-xs">
        Chain Id: {chainId}
      </div>
    </>
  );
};
