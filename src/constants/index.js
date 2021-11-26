import { ChainId as BscChainId } from '@pancakeswap/sdk';
import { ChainId as EthChainId, Token } from '@uniswap/sdk';
import MetamaskIcon from 'src/assets/images/providers/metamask.png';
import TronLinkIcon from 'src/assets/images/providers/tronLinkIcon.png';
import { fortmatic, injected, portis, tronLink, walletconnect, walletlink } from 'src/connectors';

export const __DEV__ = process.env.NODE_ENV === 'development';

/* TRON */
export const TrxChainId = {
  MAINNET: '00000000000000001ebf88508a03865c71d452e25f4d51194196a1d22b6653dc',
  NILE: '0000000000000000d698d4192c56cb6be724a558448e2684802de4d6cd8690dc',
};

/* BTTC */
export const BttcChainId = {
  MAINNET: 199,
  TESTNET: 1028,
};

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

// Block time here is slightly higher (~1s) than average in order to avoid ongoing proposals past the displayed time
export const AVERAGE_BLOCK_TIME_IN_SECS = 13;

export const TOKEN_VAULT = {
  [EthChainId.MAINNET]: '0x3DaE7b94B2E463A09f8B3E2bB08e6a898ADFAdba',
  [EthChainId.ROPSTEN]: '0x5206b68dfac9Ca69177D4D70541e644F9CBC86f4',

  [BscChainId.MAINNET]: '0xc275d3B5197d55119111237D6c2baC2FB089f4B6',
  [BscChainId.TESTNET]: '0x6413981FE0cBF781b0629c7ee1718cec56981DC7',

  [BttcChainId.MAINNET]: '',
  [BttcChainId.TESTNET]: '0x25c3e99f2b16f21Bd6B0FaF451F6c2557E6C7346',
};

export const LKT_TOKEN = {
  [EthChainId.MAINNET]: '0xd9b89eee86b15634c70cab51baf85615a4ab91a1',
  [EthChainId.ROPSTEN]: '0xde8fa069707b6322ad45d001425b617f4f1930bd',

  [BscChainId.MAINNET]: '0xde8fa069707b6322ad45d001425b617f4f1930bd',
  [BscChainId.TESTNET]: '0x6bD8b4C060a90B86C57D71226a7E23Cf9f308429',

  [BttcChainId.MAINNET]: '',
  [BttcChainId.TESTNET]: '0xc75b9a01271ab7b307733c0d12eb90b19807d321',
};

export const TOKEN_VAULT_TRON = {
  [TrxChainId.MAINNET]: '',
  [TrxChainId.NILE]: 'TPUB1Acw4foFoDJE3wERYWb3C3z63A8xg4',
};

export const LKT_TOKEN_TRON = {
  [TrxChainId.MAINNET]: '',
  [TrxChainId.NILE]: 'TYMv24WjzEBgbuz8fSyhHA8SfFVzAfGe4R',
};

export const getLockletToken = (chainId) => {
  return new Token(chainId, LKT_TOKEN[chainId], 18, 'LKT', 'Locklet');
};

export const SUPPORTED_WALLETS = {
  INJECTED: {
    connector: injected,
    name: 'Injected',
    description: 'Injected web3 provider.',
    href: null,
    color: '#010101',
    primary: true,
  },
  METAMASK: {
    connector: injected,
    name: 'MetaMask',
    icon: MetamaskIcon,
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#E8831D',
  },
  TRON_LINK: {
    connector: tronLink,
    name: 'TronLink',
    icon: TronLinkIcon,
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#E8831D',
  },
  /*
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
  */
};

export const PROVIDERS = { EVM: 'EVM', TRON: 'TRON' };

export const NetworkContextName = 'NETWORK';

export const ETH_TRUST_WALLET_ALIAS = 'ethereum';
export const BSC_TRUST_WALLET_ALIAS = 'binance';

export const TRUST_WALLET_NETWORK_ALIAS = {
  [EthChainId.MAINNET]: ETH_TRUST_WALLET_ALIAS,
  [EthChainId.ROPSTEN]: ETH_TRUST_WALLET_ALIAS,

  [BscChainId.MAINNET]: BSC_TRUST_WALLET_ALIAS,
  [BscChainId.TESTNET]: BSC_TRUST_WALLET_ALIAS,
};

export const ETH_COINGECKO_IDENTIFIER = 'ethereum';
export const BSC_COINGECKO_IDENTIFIER = 'binance-smart-chain';

export const COINGECKO_PLATFORM_IDENTIFIER = {
  [EthChainId.MAINNET]: ETH_COINGECKO_IDENTIFIER,
  [EthChainId.ROPSTEN]: ETH_COINGECKO_IDENTIFIER,

  [BscChainId.MAINNET]: BSC_COINGECKO_IDENTIFIER,
  [BscChainId.TESTNET]: BSC_COINGECKO_IDENTIFIER,
};

export const LKT_TOKEN_INFOS = {
  name: 'Locklet',
  symbol: 'LKT',
  decimals: 18,
  logoURI: 'https://www.locklet.finance/static/img/favicon.png',
};

export const LATEST_TOKEN_LOCKS_PAGE_SIZE = 6;
export const ALL_TOKEN_LOCKS_PAGE_SIZE = 12;
export const YOUR_TOKEN_LOCKS_PAGE_SIZE = 6;
export const TOKEN_LOCKS_BY_TOKEN_ADDR_PAGE_SIZE = 12;
