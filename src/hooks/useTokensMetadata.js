import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { useActiveWeb3React } from '.';

export default function useTokensMetadata() {
  const { chainId } = useActiveWeb3React();

  const metadata = useSelector((state) => state.metadata);

  const chainTokenList = useMemo(() => {
    return metadata[`token-list-${chainId}`];
  }, [chainId, metadata]);

  return chainTokenList;
}
