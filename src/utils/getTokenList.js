import axios from 'axios';
import { getTrustWalletTokenListUrl, LKT_BEP20_TOKEN_INFOS, LKT_ERC20_TOKEN_INFOS, TRUST_WALLET_NETWORK_ALIAS } from 'src/constants';
import { ChainId as BscChainId } from '@pancakeswap/sdk';
import { ChainId as EthChainId } from '@uniswap/sdk';
import { network } from 'src/connectors';

export default async function getTokenList(networkId) {
  const tokenListUrl = getTrustWalletTokenListUrl(TRUST_WALLET_NETWORK_ALIAS[networkId]);
  const { data } = await axios.get(tokenListUrl);

  let tokens = data?.tokens ?? [];
  if (networkId == EthChainId.MAINNET || networkId == EthChainId.ROPSTEN) tokens.push(LKT_ERC20_TOKEN_INFOS);
  else if (networkId == BscChainId.MAINNET || network == BscChainId.TESTNET) tokens.push(LKT_BEP20_TOKEN_INFOS);

  return tokens;
}
