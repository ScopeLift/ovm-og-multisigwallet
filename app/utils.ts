import { Contract } from '@ethersproject/contracts';
import { getAddress } from '@ethersproject/address';
import { AddressZero } from '@ethersproject/constants';
import { defaultAbiCoder } from '@ethersproject/abi';
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: any): string | false {
  try {
    return getAddress(value);
  } catch {
    return false;
  }
}

// account is not optional
export function getSigner(library: Web3Provider, account: string): JsonRpcSigner {
  return library.getSigner(account).connectUnchecked();
}

// account is optional
export function getProviderOrSigner(
  library: Web3Provider,
  account?: string
): Web3Provider | JsonRpcSigner {
  return account ? getSigner(library, account) : library;
}

export function getContract(
  address: string,
  ABI: any,
  library: Web3Provider,
  account?: string
): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }

  return new Contract(address, ABI, getProviderOrSigner(library, account) as any);
}

// thanks @ajsantander -- (https://github.com/ajsantander/ovm-og-multisigwallet/blob/master/scripts/validate-owners.js)
export const validateOwners = async ({ owners, required }) => {
  owners = owners.split(',');
  const encodedConstructorParameters = getEncodedConstructorParameters({ owners, required });
  if (!checkBytesAreSafeForOvm(encodedConstructorParameters)) {
    throw new Error('MultiSigWallet constructor parameters are not safe!');
  }
};

const getEncodedConstructorParameters = ({ owners, required }) => {
  return defaultAbiCoder.encode(['address[]', 'uint256'], [owners, required]);
};

const checkBytesAreSafeForOvm = (bytes) => {
  for (let i = 0; i < bytes.length; i += 2) {
    const curByte = bytes.substr(i, 2);
    const opNum = parseInt(curByte, 16);

    if (opNum >= 96 && opNum < 128) {
      i += 2 * (opNum - 95);
      continue;
    }

    if (curByte === '5b') {
      return false;
    }
  }

  return true;
};
