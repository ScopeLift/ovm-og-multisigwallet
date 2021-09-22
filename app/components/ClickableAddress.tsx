import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { FC } from 'react';
import { openInEtherscan } from 'utils/openInEtherscan';
import { truncateAddress } from 'utils/truncate';

interface ClickableAddressProps {
  address: string;
  truncate?: boolean;
}

export const ClickableAddress: FC<ClickableAddressProps> = ({ address, truncate = false }) => {
  const { chainId } = useWeb3React<Web3Provider>();

  return (
    <div
      onClick={() => openInEtherscan(address, chainId)}
      className={`flex group hover:underline rounded cursor-alias ${truncate && 'truncate w-44'}`}
      title="Open on Etherscan"
    >
      {truncate ? truncateAddress(address) : address}
    </div>
  );
};
