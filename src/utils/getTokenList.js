import axios from 'axios';
import { getTrustWalletTokenListUrl, TRUST_WALLET_NETWORK_ALIAS } from 'src/constants';

export default async function getTokenList(networkId) {
  const tokenListUrl = getTrustWalletTokenListUrl(TRUST_WALLET_NETWORK_ALIAS[networkId]);
  const { data } = await axios.get(tokenListUrl);
  return data?.tokens;
};