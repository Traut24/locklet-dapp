import { Alert, AlertIcon, Box, Button, FormControl, FormLabel, Heading, HStack, Icon, useColorModeValue as mode, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, PinInput, PinInputField, Progress, Stack, Text } from '@chakra-ui/react';
import { formatUnits, parseEther } from '@ethersproject/units';
import capitalize from 'capitalize-sentence';
import React, { useState } from 'react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { MdRefresh } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import LatestTokenLocks from 'src/components/Locks/LatestTokenLocks';
import StatsBar from 'src/components/StatsBar';
import { LKT_TOKEN, PRIVATE_SALE_CONTRACT } from 'src/constants';
import { useActiveWeb3React } from 'src/hooks';
import { useTransactionAdder } from 'src/hooks/transactions';
import { usePrivateSaleContract, useTokenContract } from 'src/hooks/useContract';

const HomePage = () => {
  const { account, chainId, library } = useActiveWeb3React();
  const addTransaction = useTransactionAdder();

  const lktTokenAddr = LKT_TOKEN[chainId];
  const lktToken = useTokenContract(lktTokenAddr);

  return (
    <Box as="section" pt="6" bg="inherit">
      <Box maxW="7xl" mx="auto" px={{ base: '6', md: '8' }} pb="6">
        <StatsBar />
      </Box>

      <Box maxW={{ base: 'xl', md: '7xl' }} mx="auto" px={{ base: '6', md: '8' }}>
        <Box overflowX="auto">
          <Heading fontWeight="semibold" size="lg" mb="4">
            Latest Token Locks
          </Heading>

          <LatestTokenLocks />
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage;
