import { Contract } from '@ethersproject/contracts';
import { useMemo } from 'react';
import { abi, bytecode } from '../../build/contracts/ovm/MultiSigWallet.json';
import { getContract } from '../utils';
import { useWeb3React } from '@web3-react/core';

function useContract(
  address: string | undefined,
  ABI: any,
  withSignerIfPossible = true
): Contract | null {
  const { library, account } = useWeb3React();
  return useMemo(() => {
    if (!address || !ABI || !library) return null;
    try {
      return getContract(
        address,
        ABI,
        library,
        withSignerIfPossible && account ? account : undefined
      );
    } catch (error) {
      console.error('Failed to get contract', error);
      return null;
    }
  }, [address, ABI, library, withSignerIfPossible, account]);
}

export function useMultisigContract(
  address?: string,
  withSignerIfPossible?: boolean
): Contract | null {
  return useContract(address, abi, withSignerIfPossible);
}
