import { Box, Heading } from '@chakra-ui/react';
import NewTokenLock from 'src/components/Locks/NewTokenLock';
import { LKT_TOKEN } from 'src/constants';
import { useActiveWeb3React } from 'src/hooks';
import { useTransactionAdder } from 'src/hooks/transactions';
import { useTokenContract } from 'src/hooks/useContract';

const NewTokenLockPage = () => {
  const { account, chainId, library } = useActiveWeb3React();
  const addTransaction = useTransactionAdder();

  const lktTokenAddr = LKT_TOKEN[chainId];
  const lktToken = useTokenContract(lktTokenAddr);

  return (
    <Box as="section" pt="6" bg="inherit">
      <Box maxW={{ base: 'xl', md: '7xl' }} mx="auto" px={{ base: '6', md: '8' }}>
        <Box overflowX="auto">
          <NewTokenLock />
        </Box>
      </Box>
    </Box>
  );
};

export default NewTokenLockPage;
