import { Box } from '@chakra-ui/react';
import * as React from 'react';

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
