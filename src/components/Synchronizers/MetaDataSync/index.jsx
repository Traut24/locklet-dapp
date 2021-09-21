import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
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
      let trustWalletTokenList = null;
      try {
        trustWalletTokenList = await getTokenList(chainId);
      } catch (err) {
        console.err(`Unable to retrieve the tokens list from TrustWallet (chainId: ${chainId}):`, err);
      }

      dispatch({ type: APPEND_METADATA, key: `token-list-${chainId}`, value: trustWalletTokenList ?? [] });
    })();
  }, [chainId]);

  return null;
}
