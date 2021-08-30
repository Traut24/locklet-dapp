import { useWeb3React } from '@web3-react/core';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { APPEND_METADATA } from 'src/store';
import getTokenList from 'src/utils/getTokenList';

export default function MetaDataSync({ children }) {
  const { chainId } = useWeb3React();

  const dispatch = useDispatch();

  // TrustWallet token list...
  useEffect(() => {
    (async () => {
      const trustWalletTokenList = await getTokenList(chainId);
      if (trustWalletTokenList && trustWalletTokenList?.length > 0)
        dispatch({ type: APPEND_METADATA, key: `token-list-${chainId}`, value: trustWalletTokenList });
    })();
  }, [chainId]);

  return null;
}
