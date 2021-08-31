import { Web3Provider } from '@ethersproject/providers';
import { InjectedConnector } from '@web3-react/injected-connector';
import { PortisConnector } from '@web3-react/portis-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';

import { FortmaticConnector } from './Fortmatic';
import { NetworkConnector } from './NetworkConnector';

const ETH_NETWORK_URL = process.env.REACT_APP_ETH_NETWORK_URL;
const BSC_NETWORK_URL = process.env.REACT_APP_BSC_NETWORK_URL;

const FORMATIC_KEY = process.env.REACT_APP_FORTMATIC_KEY;
const PORTIS_ID = process.env.REACT_APP_PORTIS_ID;

export const ETH_NETWORK_CHAIN_ID = parseInt(process.env.REACT_APP_ETH_CHAIN_ID ?? '1');
export const BSC_NETWORK_CHAIN_ID = parseInt(process.env.REACT_APP_BSC_CHAIN_ID ?? '56');

if (typeof ETH_NETWORK_URL === 'undefined') {
  throw new Error(`ETH_NETWORK_URL must be a defined environment variable`);
}

if (typeof BSC_NETWORK_URL === 'undefined') {
  throw new Error(`BSC_NETWORK_URL must be a defined environment variable`);
}

export const network = (network) => {
  switch (network) {
    case 'eth':
      return new NetworkConnector({ urls: { [ETH_NETWORK_CHAIN_ID]: ETH_NETWORK_URL } });

    case 'bsc':
      return new NetworkConnector({ urls: { [BSC_NETWORK_CHAIN_ID]: BSC_NETWORK_URL } });
  }
};

let networkLibrary;
export function getNetworkLibrary() {
  return (networkLibrary = networkLibrary ?? new Web3Provider(network.provider));
}

export const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 56, 97],
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
