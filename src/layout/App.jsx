import { Button, Flex, HStack } from '@chakra-ui/react';
import { ChainId as BscChainId } from '@pancakeswap/sdk';
import { ChainId as EthChainId } from '@uniswap/sdk';
import { useEffect, useMemo } from 'react';
import { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import Logo from 'src/components/Logo';
import ClaimTokens from 'src/components/Modals/Tokens/ClaimTokens';
import LockDetails from 'src/components/Modals/Tokens/LockDetails';
import PullRefund from 'src/components/Modals/Tokens/PullRefund';
import RevokeLock from 'src/components/Modals/Tokens/RevokeLock';
import WalletManager from 'src/components/Modals/WalletManager';
import NetworkSelector from 'src/components/NetworkSelector';
import BlockSync from 'src/components/Synchronizers/BlockSync';
import MetaDataSync from 'src/components/Synchronizers/MetaDataSync';
import TransactionSync from 'src/components/Synchronizers/TransactionSync';
import Web3ReactManager from 'src/components/Web3ReactManager';
import Web3Status from 'src/components/Web3Status';
import { useActiveWeb3React } from 'src/hooks';
import HomePage from 'src/pages/Home/HomePage';
import LocksListPage from 'src/pages/Locks/LocksListPage';
import NewTokenLockPage from 'src/pages/Locks/NewTokenLockPage';
import TokenPage from 'src/pages/Tokens/TokenPage';
import { useLocation } from 'react-router-dom';
import queryString from 'query-string';

import { NavMenu } from './Navigation/NavMenu';
import { useDispatch } from 'react-redux';
import { SET_NETWORK } from 'src/store';
import { NETWORK_VALUES } from 'src/components/NetworkSelector';

const TEST_NETWORKS_COLORS = {
  [EthChainId.ROPSTEN]: 'pink.400',
  [BscChainId.TESTNET]: 'orange.400',
};

export default function App() {
  // app state
  const { chainId } = useActiveWeb3React();

  const appNetwork = useSelector((state) => state.app.network);

  // component state
  const isRopsten = useMemo(() => {
    return chainId == EthChainId.ROPSTEN && appNetwork == 'eth';
  }, [chainId, appNetwork]);

  const isBscTestnet = useMemo(() => {
    return chainId == BscChainId.TESTNET && appNetwork == 'bsc';
  }, [chainId, appNetwork]);

  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    const { search } = location;
    const query = queryString.parse(search);

    const network = query?.network;

    if (network && NETWORK_VALUES.includes(network)) {
      dispatch({ type: SET_NETWORK, network: network });
    }
  }, [])


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
              {(isRopsten || isBscTestnet) && (
                <Button color="white" bgColor={TEST_NETWORKS_COLORS[chainId]} _hover={{ bgColor: TEST_NETWORKS_COLORS[chainId] }} size="sm" cursor="unset">
                  {isRopsten && 'Ropsten'}
                  {isBscTestnet && 'Testnet'}
                </Button>
              )}
              <NetworkSelector />
            </HStack>

            <HStack>
              <Web3Status />
            </HStack>
          </Flex>
        </Flex>

        <Web3ReactManager>
          {/* Sync */}
          <BlockSync />
          <TransactionSync />
          <MetaDataSync />

          {/* Routes */}
          <Switch>
            <Route exact path="/" component={HomePage} />
            <Route exact path="/home" component={HomePage} />

            <Route exact path="/locks" component={LocksListPage} />
            <Route exact path="/locks/:lockIndex" component={LocksListPage} />
            <Route exact path="/locks/tokens/new" component={NewTokenLockPage} />

            <Route exact path="/tokens/:tokenAddress" component={TokenPage} />
            <Route exact path="/tokens/:tokenAddress/locks/:lockIndex" component={TokenPage} />

            <Redirect to="/home" />
          </Switch>
        </Web3ReactManager>

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
