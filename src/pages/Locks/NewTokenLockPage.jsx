import { Box } from '@chakra-ui/react';
import NewTokenLock from 'src/components/Locks/NewTokenLock';

export default function NewTokenLockPage() {
  return (
    <Box as="section" pt="6" bg="inherit">
      <Box maxW={{ base: 'xl', md: '7xl' }} mx="auto" px={{ base: '6', md: '8' }}>
        <Box overflowX="auto">
          <NewTokenLock />
        </Box>
      </Box>
    </Box>
  );
}
