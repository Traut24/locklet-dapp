import { Button, Flex, HStack } from '@chakra-ui/react';
import { ChainId as BscChainId } from '@pancakeswap/sdk';
import { ChainId as EthChainId } from '@uniswap/sdk';
import { useMemo } from 'react';
import { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import Logo from 'src/components/Logo';
import ClaimTokens from 'src/components/Modals/Tokens/ClaimTokens';
import LockDetails from 'src/components/Modals/Tokens/LockDetails';
import PullRefund from 'src/components/Modals/Tokens/PullRefund';
import RevokeLock from 'src/components/Modals/Tokens/RevokeLock';
import WalletManager from 'src/components/Modals/WalletManager';
import NetworkManager from 'src/components/NetworkManager';
import NetworkSelector from 'src/components/NetworkSelector';
import BlockSync from 'src/components/Synchronizers/BlockSync';
import MetaDataSync from 'src/components/Synchronizers/MetaDataSync';
import TransactionSync from 'src/components/Synchronizers/TransactionSync';
import Web3Manager from 'src/components/Web3Manager';
import Web3Status from 'src/components/Web3Status';
import { BttcChainId, TrxChainId } from 'src/constants';
import { useActiveUnifiedWeb3 } from 'src/hooks/useUnifiedWeb3';
import HomePage from 'src/pages/Home/HomePage';
import LocksListPage from 'src/pages/Locks/LocksListPage';
import NewTokenLockPage from 'src/pages/Locks/NewTokenLockPage';
import TokenPage from 'src/pages/Tokens/TokenPage';

import { NavMenu } from './Navigation/NavMenu';

import 'src/styles/app.css';

const TEST_NETWORKS_COLORS = {
  [EthChainId.ROPSTEN]: 'pink.400',
  [BscChainId.TESTNET]: 'orange.400',
  [TrxChainId.NILE]: 'red.400',
  [BttcChainId.TESTNET]: 'black',
};

export default function App() {
  // app state
  const { chainId } = useActiveUnifiedWeb3();

  const appNetwork = useSelector((state) => state.app.network);

  // component state
  const isRopsten = useMemo(() => {
    return chainId == EthChainId.ROPSTEN && appNetwork == 'eth';
  }, [chainId, appNetwork]);

  const isBscTestnet = useMemo(() => {
    return chainId == BscChainId.TESTNET && appNetwork == 'bsc';
  }, [chainId, appNetwork]);

  const isNile = useMemo(() => {
    return chainId == TrxChainId.NILE && appNetwork == 'trx';
  }, [chainId, appNetwork]);

  const isBttcTestnet = useMemo(() => {
    return chainId == BttcChainId.TESTNET && appNetwork == 'bttc';
  }, [chainId, appNetwork]);

  return (
    <>
      <Toaster
        position={'bottom-center'}
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          loading: { duration: 1500000 },
          success: { duration: 5000 },
          error: { duration: 8000 },
        }}
      />

      <Flex direction="column" bg="gray.200" height="100vh">
        <Flex align="center" bg="white" color="white" px="6" minH="16">
          <Flex justify="space-between" align="center" w="full">
            <Logo display="block" flexShrink={0} h={{ base: '6', lg: '8' }} marginEnd={{ base: '0', lg: '10' }} />
            <NavMenu.Desktop />

            <HStack pr="2">
              {(isRopsten || isBscTestnet || isNile || isBttcTestnet) && (
                <Button color="white" bgColor={TEST_NETWORKS_COLORS[chainId]} _hover={{ bgColor: TEST_NETWORKS_COLORS[chainId] }} size="sm" cursor="unset">
                  {isRopsten && 'Ropsten'}
                  {(isBscTestnet || isBttcTestnet) && 'Testnet'}
                  {isNile && 'Nile'}
                </Button>
              )}
              <NetworkSelector />
            </HStack>

            <HStack>
              <Web3Status />
            </HStack>
          </Flex>
        </Flex>

        {/* Network */}
        <NetworkManager />

        <Web3Manager>
          {/* Sync */}
          <BlockSync />
          <TransactionSync />
          <MetaDataSync />

          {/* Routes */}
          <Switch>
            <Route path={['/:network']}>
              <Route exact path="/:network" component={HomePage} />

              <Route exact path="/:network/locks/:lockIndex?" component={LocksListPage} />
              <Route exact path="/:network/locks/tokens/new" component={NewTokenLockPage} />

              <Route exact path="/:network/tokens/:tokenAddress/:lockIndex?" component={TokenPage} />
            </Route>

            <Redirect to="/eth" />
          </Switch>
        </Web3Manager>

        {/* Modals */}
        <WalletManager />
        <RevokeLock />
        <ClaimTokens />
        <PullRefund />
        <LockDetails />
      </Flex>
    </>
  );
}
