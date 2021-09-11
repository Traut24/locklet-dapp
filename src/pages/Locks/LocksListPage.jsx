import { Box, Heading } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useParams } from 'react-router';
import AllTokenLocks from 'src/components/Locks/AllTokenLocks';
import YourTokenLocks from 'src/components/Locks/YourTokenLocks';
import { useToggleModal } from 'src/hooks/useToggleModal';

export default function LocksListPage() {
  const { lockIndex } = useParams();

  const toggleLockDetailsModal = useToggleModal('lockDetails');

  useEffect(() => {
    if (lockIndex > -1) toggleLockDetailsModal({ lockIndex: lockIndex });
  }, []);

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
