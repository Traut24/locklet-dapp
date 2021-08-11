import { Badge, Box, Button, ButtonGroup, Flex, FormControl, FormLabel, HStack, Input, InputGroup, InputLeftElement, Stack, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import { BsSearch } from "react-icons/bs";
import { FaPlus } from "react-icons/fa";
import { Link } from 'react-router-dom';

const data = [
  {
    role: 'Admin',
    status: 'active',
    earned: '$45,000',
    id: 'blog',
    user: {
      image:
        'https://images.unsplash.com/photo-1512485694743-9c9538b4e6e0?ixid=MXwxMjA3fDB8MHxzZWFyY2h8NDN8fGd1eSUyMGZhY2V8ZW58MHx8MHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=60',
      name: 'Marion Watson',
      email: 'codyfisher@example.com',
    },
  },
  {
    role: 'Marketing Director',
    status: 'reviewing',
    earned: '$4,840',
    id: 'home',
    user: {
      image:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60',
      name: 'Louise Hopkins',
      email: 'jane@example.com',
    },
  },
  {
    role: 'Front Desk Officer',
    status: 'declined',
    id: 'design-system',
    earned: '$89,054',
    user: {
      image:
        'https://images.unsplash.com/photo-1470506028280-a011fb34b6f7?ixid=MXwxMjA3fDB8MHxzZWFyY2h8NjN8fGxhZHklMjBmYWNlfGVufDB8fDB8&ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=60',
      name: 'Susan Schwartz',
      email: 'jenyzx@example.com',
    },
  },
  {
    role: 'Lead Software Engineer',
    status: 'active',
    earned: '$19,954',
    id: 'home-2',
    user: {
      image:
        'https://images.unsplash.com/photo-1533674689012-136b487b7736?ixid=MXwxMjA3fDB8MHxzZWFyY2h8Mjl8fGFmcmljYSUyMGxhZHklMjBmYWNlfGVufDB8fDB8&ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=60',
      name: 'Sade Akinlade',
      email: 'melyb@example.com',
    },
  },
];

const badgeEnum = {
  active: 'green',
  reviewing: 'orange',
  declined: 'red',
};

const columns = [
  {
    Header: 'Member',
    accessor: 'user',
    Cell: function MemberCell(data) {
      return <></>; // <User data={data} />;
    },
  },
  {
    Header: 'Role',
    accessor: 'role',
  },
  {
    Header: 'Status',
    accessor: 'status',
    Cell: function StatusCell(data) {
      return (
        <Badge fontSize="xs" colorScheme={badgeEnum[data]}>
          {data}
        </Badge>
      );
    },
  },
  {
    Header: 'Amount Earned',
    accessor: 'earned',
  },
];

export default function AllTokenLocks() {
  return (
    <>
      <Box mx="auto" py="4" px="4" rounded="lg" bg="white" shadow="base" overflowX="auto">
        <Stack spacing="4" direction={{ base: 'column', md: 'row' }} justify="flex-start" pb="3">
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
          <ButtonGroup size="sm" variant="outline">
            <Button as={Link} to="/locks/tokens/new" iconSpacing="1" leftIcon={<FaPlus />}>
              New Token Lock
            </Button>
          </ButtonGroup>
        </Stack>

        <Table variant="simple" fontSize="md">
          <Thead>
            <Tr>
              {columns.map((column, index) => (
                <Th whiteSpace="nowrap" scope="col" key={index}>
                  {column.Header}
                </Th>
              ))}
              <Th />
            </Tr>
          </Thead>
          <Tbody>
            {data.map((row, index) => (
              <Tr key={index}>
                {columns.map((column, index) => {
                  const cell = row[column.accessor];
                  const element = column.Cell?.(cell) ?? cell;
                  return (
                    <Td whiteSpace="nowrap" key={index}>
                      {element}
                    </Td>
                  );
                })}
                <Td textAlign="right">
                  <Button variant="link" colorScheme="brand">
                    See details
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        <Flex align="center" justify="space-between" mt="4">
          <Text color="gray.600" fontSize="sm">
            <b>{data.length}</b> <i>Token Locks</i>
          </Text>
          <HStack>
            <Text as="b" color="gray.600" fontSize="sm" mr="2">
              Page 1
            </Text>
            <ButtonGroup variant="outline" size="sm">
              <Button as="a" rel="prev">
                Previous
              </Button>
              <Button as="a" rel="next">
                Next
              </Button>
            </ButtonGroup>
          </HStack>
        </Flex>
      </Box>
    </>
  );
}
