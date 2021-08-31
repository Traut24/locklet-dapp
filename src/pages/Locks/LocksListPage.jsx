import { Box, Heading } from '@chakra-ui/react';
import AllTokenLocks from 'src/components/Locks/AllTokenLocks';
import YourTokenLocks from 'src/components/Locks/YourTokenLocks';

export default function LocksListPage() {
  return (
    <Box as="section" pt="6" bg="inherit">
      <Box maxW={{ base: 'xl', md: '7xl' }} mx="auto" px={{ base: '6', md: '8' }} pb="6">
        <Box overflowX="auto">
          <Heading fontWeight="semibold" size="lg" mb="4">
            Your Token Locks
          </Heading>

          <YourTokenLocks />
        </Box>
      </Box>

      <Box maxW={{ base: 'xl', md: '7xl' }} mx="auto" px={{ base: '6', md: '8' }} pb="6">
        <Box overflowX="auto">
          <Heading fontWeight="semibold" size="lg" mb="4">
            All Token Locks
          </Heading>

          <AllTokenLocks />
        </Box>
      </Box>
    </Box>
  );
}
