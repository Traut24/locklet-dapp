import { Box, Button, ButtonGroup, Spacer, Stack } from '@chakra-ui/react';
import { FaPlus } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';

import TokenLocksTable from '../TokenLocksTable';

export default function AllTokenLocks() {
  // app state
  const appNetwork = useSelector((state) => state.app.network);

  return (
    <>
      <Box mx="auto" py="4" px="4" rounded="lg" bg="white" shadow="base" overflowX="auto">
        <Stack spacing="4" direction={{ base: 'column', md: 'row' }} justify="flex-start" pb="3">
          {/*
          <HStack flexGrow="1">
            <FormControl id="search">
              <InputGroup size="sm">
                <FormLabel srOnly>Filter by token name or address...</FormLabel>
                <InputLeftElement pointerEvents="none" color="gray.400">
                  <BsSearch />
                </InputLeftElement>
                <Input rounded="base" type="search" placeholder="Filter by token name or address..." />
              </InputGroup>
            </FormControl>
          </HStack>
          */}
          <Spacer />
          <ButtonGroup size="sm" variant="outline">
            <Button as={RouterLink} to={`/${appNetwork}/locks/tokens/new`} iconSpacing="1" leftIcon={<FaPlus />}>
              New Token Lock
            </Button>
          </ButtonGroup>
        </Stack>

        <TokenLocksTable mode="full" />
      </Box>
    </>
  );
}
