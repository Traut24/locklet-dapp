import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { NetworkContextName, PROVIDERS } from 'src/constants';

import { useTronWeb } from './useTronWeb';

export function useActiveUnifiedWeb3() {
  const context = useUnifiedWeb3();
  const contextNetwork = useNetworkUnifiedWeb3();

  return context.active ? context : contextNetwork;
}

export function useNetworkUnifiedWeb3() {
  // app state
  const appNetwork = useSelector((state) => state.app.network);

  const web3ReactContextNetwork = useWeb3React(NetworkContextName);
  const tronContextNetwork = useTronWeb(NetworkContextName);

  const context = useMemo(() => {
    if (appNetwork == 'eth' || appNetwork == 'bsc' || appNetwork == 'bttc') {
      return { type: PROVIDERS.EVM, ...web3ReactContextNetwork };
    } else if (appNetwork == 'trx') {
      return { type: PROVIDERS.TRON, ...tronContextNetwork };
    }
  }, [appNetwork, web3ReactContextNetwork, tronContextNetwork]);

  return context;
}

export function useUnifiedWeb3() {
  // app state
  const appNetwork = useSelector((state) => state.app.network);
  
  const {
    active: web3ReactActive,
    chainId: web3ReactChainId,
    account: web3ReactAccount,
    connector: web3ReactConnector,
    error: web3ReactError,
    library: web3ReactLibrary
  } = useWeb3React();
  const { active: tronActive, chainId: tronChainId, account: tronAccount, connector: tronConnector, error: tronError, library: tronLibrary } = useTronWeb();

  const active = useMemo(() => {
    return web3ReactActive || tronActive;
  }, [web3ReactActive, tronActive]);

  const chainId = useMemo(() => {
    if (web3ReactActive) return web3ReactChainId;
    else if (tronActive) return tronChainId;
    else return null;
  }, [web3ReactActive, web3ReactChainId, tronActive, tronChainId]);

  const account = useMemo(() => {
    if (web3ReactActive) return web3ReactAccount;
    else if (tronActive) return tronAccount;
    else return null;
  }, [web3ReactActive, web3ReactAccount, tronActive, tronAccount]);

  const connector = useMemo(() => {
    if (web3ReactActive) return web3ReactConnector;
    else if (tronActive) return tronConnector;
    else return null;
  }, [web3ReactActive, web3ReactConnector, tronActive, tronConnector]);

  const error = useMemo(() => {
    return web3ReactError ?? tronError;
  }, [web3ReactError, tronError]);

  const library = useMemo(() => {
    if (web3ReactActive) return web3ReactLibrary;
    else if (tronActive) return tronLibrary;
    else return null;
  }, [web3ReactActive, web3ReactLibrary, tronActive, tronLibrary]);

  const type = useMemo(() => {
    if (appNetwork == 'eth' || appNetwork == 'bsc' || appNetwork == 'bttc') {
      return PROVIDERS.EVM;
    } else if (appNetwork == 'trx') {
      return PROVIDERS.TRON;
    }
  }, [appNetwork]);

  return { type, active, chainId, account, connector, error, library };
}
