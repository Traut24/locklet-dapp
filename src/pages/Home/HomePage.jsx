import { Box, Heading } from '@chakra-ui/react';
import React from 'react';
import { useParams } from 'react-router';
import LatestTokenLocks from 'src/components/Locks/LatestTokenLocks';
import StatsBar from 'src/components/StatsBar';

export default function HomePage() {
  return (
    <Box as="section" pt="6" bg="inherit">
      <Box maxW="7xl" mx="auto" px={{ base: '6', md: '8' }} pb="6">
        <StatsBar />
      </Box>

      <Box maxW={{ base: 'xl', md: '7xl' }} mx="auto" px={{ base: '6', md: '8' }} pb="6">
        <Box overflowX="auto">
          <Heading fontWeight="semibold" size="lg" mb="4">
            Latest Token Locks
          </Heading>

          <LatestTokenLocks />
        </Box>
      </Box>
    </Box>
  );
}
