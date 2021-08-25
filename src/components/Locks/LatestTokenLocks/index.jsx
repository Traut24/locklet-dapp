import { Badge, Box, Button, ButtonGroup, Flex, HStack, Link, useColorModeValue as mode, Table, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react';
import { formatUnits } from '@ethersproject/units';
import * as React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { LATEST_TOKEN_LOCKS_PAGE_SIZE } from 'src/constants';
import { useActiveWeb3React } from 'src/hooks';
import { getTokenLocks } from 'src/services/lockletApi';
import { getEtherscanLink } from 'src/utils';

const badgeEnum = {
  active: 'green',
  reviewing: 'orange',
  declined: 'red',
};

const columns = [
  {
    Header: 'Creation Date',
    Cell: function CreationDateCell(data) {
      return '01/01/1996';
    },
  },
  {
    Header: 'Token',
    Cell: function TokenCell(data, chainId) {
      return (
        <HStack>
          {data?.tokenLogoUrl && (
            <Circle rounded="full" size="6">
              <Image src={data.tokenLogoUrl} />
            </Circle>
          )}
          <Link href={getEtherscanLink(chainId, data.tokenAddress, 'token')} color="brand.500" isExternal>
            <Text fontWeight="semibold">{data.tokenSymbol}</Text>
          </Link>
        </HStack>
      );
    },
  },
  {
    Header: 'Locked Amount',
    Cell: function AmountCell(data) {
      return formatUnits(data.totalAmount, data.tokenDecimals);
    },
  },
  {
    Header: 'Unlock Type',
    Cell: function UnlockTypeCell(data) {
      return (
        <Badge variant="outline" colorScheme="purple" rounded="md" fontSize="0.7em" px="2" mr="2">
          Linear
        </Badge>
      );
    },
  },
  {
    Header: 'Unlock Date',
    Cell: function UnlockStartDateCell(data) {
      return '01/01/1996';
    },
  },
  {
    Header: 'Revocable',
    Cell: function StatusCell(data) {
      return (
        <Badge colorScheme="red" rounded="md" fontSize="0.7em" px="2">
          Yes
        </Badge>
      );
    },
  },
  {
    Header: 'Status',
    Cell: function StatusCell(data) {
      return (
        <Badge variant="solid" colorScheme="green" rounded="md" fontSize="0.7em" px="2">
          Locked
        </Badge>
      );
    },
  },
];

export default function LatestTokenLocks() {
  const { chainId } = useActiveWeb3React();

  const [tokenLocks, setTokenLocks] = useState([]);
  const [totalTokenLocks, setTotalTokenLocks] = useState(0);

  const refreshTokenLocks = async () => {
    const { data: tokensLocksData } = await getTokenLocks(chainId, 1, LATEST_TOKEN_LOCKS_PAGE_SIZE);
    if (!tokensLocksData?.results || !tokensLocksData?.totalResults) return;

    setTokenLocks(tokensLocksData.results);
    setTotalTokenLocks(tokensLocksData.totalResults);
  };

  useEffect(() => {
    refreshTokenLocks();
  }, [chainId]);

  return (
    <>
      <Box mx="auto" py="4" px="4" rounded="lg" bg="white" shadow="base" overflowX="auto">
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
            {tokenLocks.map((row, index) => (
              <Tr key={index}>
                {columns.map((column, index) => {
                  const cell = row[column.accessor];
                  const element = column.Cell?.(row, chainId) ?? cell;
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
          <Text color={mode('gray.600', 'gray.400')} fontSize="sm">
            <b>{totalTokenLocks}</b> <i>Token Locks</i>
          </Text>
          <ButtonGroup variant="outline" size="sm">
            <Button as={Link} to="/locks" rel="more">
              View more
            </Button>
          </ButtonGroup>
        </Flex>
      </Box>
    </>
  );
}
