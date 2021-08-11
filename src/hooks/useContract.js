import ERC20 from 'contracts/ERC20.json';
import LockletTokenVault from 'contracts/LockletTokenVault.json';
import { useMemo } from 'react';
import { getContract } from 'src/utils';

import { useActiveWeb3React } from './index';

// returns null on errors
function useContract(address, ABI, withSignerIfPossible = true) {
  const { library, account } = useActiveWeb3React();

  return useMemo(() => {
    if (!address || !ABI || !library) return null;
    try {
      return getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined);
    } catch (error) {
      console.error('Failed to get contract', error);
      return null;
    }
  }, [address, ABI, library, withSignerIfPossible, account]);
}

export function useTokenContract(tokenAddress, withSignerIfPossible) {
  return useContract(tokenAddress, ERC20.abi, withSignerIfPossible);
}

export function useTokenVaultContract(contractAddress, withSignerIfPossible) {
  return useContract(contractAddress, LockletTokenVault.abi, withSignerIfPossible);
}
