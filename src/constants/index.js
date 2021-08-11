import { ChainId as BscChainId } from '@pancakeswap/sdk';
import { ChainId as EthChainId, Token } from '@uniswap/sdk';
import { fortmatic, injected, portis, walletconnect, walletlink } from 'src/connectors';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

// Block time here is slightly higher (~1s) than average in order to avoid ongoing proposals past the displayed time
export const AVERAGE_BLOCK_TIME_IN_SECS = 13;

export const TOKEN_VAULT = { 
  [EthChainId.MAINNET]: '',
  [EthChainId.ROPSTEN]: '0xCeEcFb1F16aB7EBc166E397083eDFCEF5DC6C53d',
  [BscChainId.MAINNET]: '',
  [BscChainId.TESTNET]: '',
}

export const LKT_TOKEN = {
  [EthChainId.MAINNET]: '0xd9b89eee86b15634c70cab51baf85615a4ab91a1',
  [EthChainId.ROPSTEN]: '0xde8fa069707b6322ad45d001425b617f4f1930bd',
  [BscChainId.MAINNET]: '',
  [BscChainId.TESTNET]: '',
};

export const getLockletToken = (chainId) => {
  return new Token(chainId, LKT_TOKEN[chainId], 18, 'LKT', 'Locklet');
};

export const SUPPORTED_WALLETS = {
  INJECTED: {
    connector: injected,
    name: 'Injected',
    iconName: 'arrow-right.svg',
    description: 'Injected web3 provider.',
    href: null,
    color: '#010101',
    primary: true,
  },
  METAMASK: {
    connector: injected,
    name: 'MetaMask',
    iconName: 'metamask.png',
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#E8831D',
  },
  WALLET_CONNECT: {
    connector: walletconnect,
    name: 'WalletConnect',
    iconName: 'walletConnectIcon.svg',
    description: 'Connect to Trust Wallet, Rainbow Wallet and more...',
    href: null,
    color: '#4196FC',
    mobile: true,
  },
  WALLET_LINK: {
    connector: walletlink,
    name: 'Coinbase Wallet',
    iconName: 'coinbaseWalletIcon.svg',
    description: 'Use Coinbase Wallet app on mobile device',
    href: null,
    color: '#315CF5',
  },
  COINBASE_LINK: {
    name: 'Open in Coinbase Wallet',
    iconName: 'coinbaseWalletIcon.svg',
    description: 'Open in Coinbase Wallet app.',
    href: 'https://go.cb-w.com/mtUDhEZPy1',
    color: '#315CF5',
    mobile: true,
    mobileOnly: true,
  },
  FORTMATIC: {
    connector: fortmatic,
    name: 'Fortmatic',
    iconName: 'fortmaticIcon.png',
    description: 'Login using Fortmatic hosted wallet',
    href: null,
    color: '#6748FF',
    mobile: true,
  },
  Portis: {
    connector: portis,
    name: 'Portis',
    iconName: 'portisIcon.png',
    description: 'Login using Portis hosted wallet',
    href: null,
    color: '#4A6C9B',
    mobile: true,
  },
};

export const NetworkContextName = 'NETWORK';
