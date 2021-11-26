import { ChainId as BscChainId } from '@pancakeswap/sdk';
import { ChainId as EthChainId } from '@uniswap/sdk';
import { InjectedConnector } from '@web3-react/injected-connector';
import { PortisConnector } from '@web3-react/portis-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';
import { BttcChainId } from 'src/constants';

import { FortmaticConnector } from './FortmaticConnector';
import { NetworkConnector } from './NetworkConnector';

const ETH_NETWORK_URL = process.env.REACT_APP_ETH_NETWORK_URL;
const BSC_NETWORK_URL = process.env.REACT_APP_BSC_NETWORK_URL;
const BTTC_NETWORK_URL = process.env.REACT_APP_BTTC_NETWORK_URL;

const FORMATIC_KEY = process.env.REACT_APP_FORTMATIC_KEY;
const PORTIS_ID = process.env.REACT_APP_PORTIS_ID;

export const ETH_NETWORK_CHAIN_ID = parseInt(process.env.REACT_APP_ETH_CHAIN_ID ?? EthChainId.MAINNET);
export const BSC_NETWORK_CHAIN_ID = parseInt(process.env.REACT_APP_BSC_CHAIN_ID ?? BscChainId.MAINNET);
export const BTTC_NETWORK_CHAIN_ID = parseInt(process.env.REACT_APP_BTTC_CHAIN_ID ?? BttcChainId.MAINNET);

if (typeof ETH_NETWORK_URL === 'undefined') {
  throw new Error(`ETH_NETWORK_URL must be a defined environment variable`);
}

if (typeof BSC_NETWORK_URL === 'undefined') {
  throw new Error(`BSC_NETWORK_URL must be a defined environment variable`);
}

if (typeof BTTC_NETWORK_URL === 'undefined') {
  throw new Error(`BTTC_NETWORK_URL must be a defined environment variable`);
}

export const web3ReactNetwork = (network) => {
  switch (network) {
    case 'eth':
      return new NetworkConnector({ urls: { [ETH_NETWORK_CHAIN_ID]: ETH_NETWORK_URL } });

    case 'bsc':
      return new NetworkConnector({ urls: { [BSC_NETWORK_CHAIN_ID]: BTTC_NETWORK_URL } });

    case 'bttc':
      return new NetworkConnector({ urls: { [BTTC_NETWORK_CHAIN_ID]: BTTC_NETWORK_URL } });
  }
};

export const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 56, 97, 199, 1028],
});

// mainnet only
export const walletconnect = new WalletConnectConnector({
  rpc: { 1: ETH_NETWORK_URL },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
  pollingInterval: 15000,
});

// mainnet only
export const fortmatic = new FortmaticConnector({
  apiKey: FORMATIC_KEY ?? '',
  chainId: 1,
});

// mainnet only
export const portis = new PortisConnector({
  dAppId: PORTIS_ID ?? '',
  networks: [1],
});

// mainnet only
export const walletlink = new WalletLinkConnector({
  url: ETH_NETWORK_URL,
  appName: 'Locklet',
  appLogoUrl: 'https://www.locklet.finance/static/img/favicon.png',
});