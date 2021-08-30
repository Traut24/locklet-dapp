import { useCallback, useEffect, useMemo, useState } from 'react';
import copy from 'copy-to-clipboard';
import { useActiveWeb3React } from '.';
import { useSelector } from 'react-redux';

export default function useTokensMetadata() {
  const { chainId } = useActiveWeb3React();

  const metadata = useSelector(state => state.metadata);

  const chainTokenList = useMemo(() => {
    return metadata[`token-list-${chainId}`];
  }, [chainId]);

  return chainTokenList;
}
