import { ChakraProvider, Flex, HStack } from '@chakra-ui/react';
import { Toaster } from 'react-hot-toast';
import { Redirect, Route, Switch } from 'react-router-dom';
import Logo from 'src/components/Logo';
import RevokeLock from 'src/components/Modals/Tokens/RevokeLock';
import WalletManager from 'src/components/Modals/WalletManager';
import NetworkSelector from 'src/components/NetworkSelector';
import BlockSync from 'src/components/Synchronizers/BlockSync';
import MetaDataSync from 'src/components/Synchronizers/MetaDataSync';
import TransactionSync from 'src/components/Synchronizers/TransactionSync';
import Web3ReactManager from 'src/components/Web3ReactManager';
import Web3Status from 'src/components/Web3Status';
import HomePage from 'src/pages/Home/HomePage';
import LocksListPage from 'src/pages/Locks/LocksListPage';
import NewTokenLockPage from 'src/pages/Locks/NewTokenLockPage';

import { NavMenu } from './Navigation/NavMenu';
import { theme } from './Theme';

const AppWrapper = () => {
  return (
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  );
};

const App = () => {
  return (
    <>
      <Toaster
        position={'bottom-center'}
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          loading: { duration: 900000 },
          success: { duration: 5000 },
          error: { duration: 8000 },
        }}
      />

      {/*
      <Box as="section">
        <Stack
          direction={{ base: 'column', sm: 'row' }}
          justifyContent="center"
          alignItems="center"
          py="3"
          px={{ base: '3', md: '6', lg: '8' }}
          color="white"
          bg="brand.600"
        >
          <HStack spacing="3">
            <Text fontWeight="medium">
              The private sale will open on{' '}
              <strong>
                <u>Tuesday, June 29, 2021 at 6:00 PM UTC</u>
              </strong>
              .
            </Text>
          </HStack>
        </Stack>
      </Box>
      */}

      <Flex direction="column" bg="gray.200" height="100vh">
        <Flex align="center" bg="white" color="white" px="6" minH="16">
          <Flex justify="space-between" align="center" w="full">
            <Logo display="block" flexShrink={0} h={{ base: '6', lg: '8' }} marginEnd={{ base: '0', lg: '10' }} />
            <NavMenu.Desktop />

            <HStack pr="2">
              <NetworkSelector />
            </HStack>

            <HStack>
              <Web3Status />
            </HStack>
          </Flex>
        </Flex>

        <Web3ReactManager>
          <BlockSync />
          <TransactionSync />
          <MetaDataSync />

          <Switch>
            <Route exact path="/" component={HomePage} />
            <Route exact path="/home" component={HomePage} />

            <Route exact path="/locks" component={LocksListPage} />
            <Route exact path="/locks/tokens/new" component={NewTokenLockPage} />

            <Redirect to="/home" />
          </Switch>
        </Web3ReactManager>

        <WalletManager />
        <RevokeLock />
      </Flex>
    </>
  );
};

export default AppWrapper;
