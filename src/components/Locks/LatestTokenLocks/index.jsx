import { Badge, Box, Button, ButtonGroup, Center, CircularProgress, Flex, Heading, HStack, Link, useColorModeValue as mode, Table, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react';
import { formatUnits } from '@ethersproject/units';
import * as React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { LATEST_TOKEN_LOCKS_PAGE_SIZE } from 'src/constants';
import { useActiveWeb3React } from 'src/hooks';
import { getTokenLocks } from 'src/services/lockletApi';
import { getEtherscanLink } from 'src/utils';

import TokenLocksTable from '../TokenLocksTable';

export default function LatestTokenLocks() {
  return (
    <>
      <Box mx="auto" py="4" px="4" rounded="lg" bg="white" shadow="base" overflowX="auto">
        <TokenLocksTable mode="latest" />
      </Box>
    </>
  );
}
