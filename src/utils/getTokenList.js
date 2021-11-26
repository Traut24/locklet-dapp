import axios from 'axios';
import { LKT_TOKEN, LKT_TOKEN_INFOS, TRUST_WALLET_NETWORK_ALIAS } from 'src/constants';

export const getTrustWalletTokenListUrl = (blockchain) => {
  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${blockchain}/tokenlist.json`;
};

export default async function getTokenList(networkId) {
  const networkAlias = TRUST_WALLET_NETWORK_ALIAS[networkId];
  if (!networkAlias) return;

  const tokenListUrl = getTrustWalletTokenListUrl(networkAlias);
  const { data } = await axios.get(tokenListUrl);

  let tokens = data?.tokens ?? [];

  tokens.push({
    ...LKT_TOKEN_INFOS,
    address: LKT_TOKEN[networkId],
  });

  return tokens;
}
