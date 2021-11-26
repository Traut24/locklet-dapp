import { useSelector } from 'react-redux';

import { useActiveUnifiedWeb3 } from './useUnifiedWeb3';

export function useBlockNumber() {
  const { chainId } = useActiveUnifiedWeb3();

  return useSelector((state) => state.app?.blockNumber[chainId ?? -1]);
}
