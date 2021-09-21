import { ChainId as BscChainId } from '@pancakeswap/sdk';
import { ChainId as EthChainId } from '@uniswap/sdk';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { useHistory, useParams } from 'react-router';
import { useActiveWeb3React } from 'src/hooks';
import { SET_NETWORK } from 'src/store';

export default function NetworkManager() {
  // app state
  const { chainId } = useActiveWeb3React();

  const dispatch = useDispatch();
  const { network } = useParams();

  const appNetwork = useSelector((state) => state.app.network);
  
  useEffect(() => {
    if (network && NETWORK_VALUES.includes(network) && network !== appNetwork) {
      dispatch({ type: SET_NETWORK, network: network });
    }
  }, [network]);

  const history = useHistory();

  useEffect(() => {
    if (chainId && network !== CHAIN_ID_NETWORK_VALUES[chainId]) {
      history.push(`/${CHAIN_ID_NETWORK_VALUES[chainId]}`);
    }
  }, [chainId]);

  return null;
}

export const NETWORK_VALUES = ['eth', 'bsc'];

export const CHAIN_ID_NETWORK_VALUES = {
  [EthChainId.MAINNET]: NETWORK_VALUES[0],
  [EthChainId.ROPSTEN]: NETWORK_VALUES[0],

  [BscChainId.MAINNET]: NETWORK_VALUES[1],
  [BscChainId.TESTNET]: NETWORK_VALUES[1],
};
