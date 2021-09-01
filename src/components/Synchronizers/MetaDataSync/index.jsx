import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { TRUST_WALLET_NETWORK_ALIAS } from 'src/constants';
import { useActiveWeb3React } from 'src/hooks';
import { APPEND_METADATA } from 'src/store';
import getTokenList from 'src/utils/getTokenList';

export default function MetaDataSync() {
  const { chainId } = useActiveWeb3React();

  const dispatch = useDispatch();

  // TrustWallet token list...
  useEffect(() => {
    if (!chainId) return;

    (async () => {
      const trustWalletTokenList = await getTokenList(chainId);
      if (trustWalletTokenList && trustWalletTokenList?.length > 0)
        dispatch({ type: APPEND_METADATA, key: `token-list-${chainId}`, value: trustWalletTokenList });
    })();
  }, [chainId]);

  return null;
}
