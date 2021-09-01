import {
  Badge,
  Button,
  ButtonGroup,
  Center,
  Circle,
  CircularProgress,
  Flex,
  Heading,
  HStack,
  Image,
  Link,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
} from '@chakra-ui/react';
import { formatUnits } from '@ethersproject/units';
import * as React from 'react';
import { useEffect } from 'react';
import { useMemo } from 'react';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ALL_TOKEN_LOCKS_PAGE_SIZE, LATEST_TOKEN_LOCKS_PAGE_SIZE } from 'src/constants';
import { useActiveWeb3React } from 'src/hooks';
import { getTokenLocks } from 'src/services/lockletApi';
import { formatDate, formatTime, getExplorerLink } from 'src/utils';

export const TOKEN_LOCKS_TABLE_COLUMNS = [
  {
    Header: 'Creation Date',
    Cell: function CreationDateCell({ data }) {
      let date = data?.creationTime;
      if (!(date instanceof Date)) date = new Date(data?.creationTime);
      return formatDate(date);
    },
  },
  {
    Header: 'Token',
    Cell: function TokenCell({ data, chainId }) {
      return (
        <HStack>
          {data?.tokenLogoUrl && (
            <Circle rounded="full" size="5">
              <Image src={data.tokenLogoUrl} />
            </Circle>
          )}
          <Link href={getExplorerLink(chainId, data.tokenAddress, 'token')} color="brand.500" isExternal>
            <Text fontWeight="semibold">{data.tokenSymbol}</Text>
          </Link>
        </HStack>
      );
    },
  },
  {
    Header: 'Amount',
    Cell: function AmountCell({ data, account = null }) {
      let amount = data?.totalAmount;
      if (typeof data?.isInitiator !== 'undefined' && data?.isInitiator == false && account)
        amount = data?.recipients?.find((x) => x.recipientAddress == account)?.amount;
      return formatUnits(amount, data.tokenDecimals);
    },
  },
  {
    Header: 'Unlock Type',
    Cell: function UnlockTypeCell({ data }) {
      const isLinear = data?.isLinear;
      return (
        <Badge variant="outline" colorScheme={isLinear ? 'purple' : 'messenger'} rounded="md" fontSize="0.7em" px="2" mr="2">
          {isLinear ? 'Linear' : 'Unique'}
        </Badge>
      );
    },
  },
  {
    Header: 'Unlock Date',
    Cell: function UnlockStartDateCell({ data }) {
      let date = data?.startTime;
      if (!(date instanceof Date)) date = new Date(data?.startTime);
      return (
        <>
          <Tooltip label={formatTime(date)} placement="bottom" closeOnClick={false} rounded="md">
            {formatDate(date)}
          </Tooltip>
        </>
      );
    },
  },
  {
    Header: 'Revocable',
    Cell: function StatusCell({ data }) {
      const isRevocable = data?.isRevocable;
      return (
        <Badge colorScheme={isRevocable ? 'red' : 'green'} rounded="md" fontSize="0.7em" px="2">
          {isRevocable ? 'Yes' : 'No'}
        </Badge>
      );
    },
  },
  {
    Header: 'Status',
    Cell: function StatusCell({ data }) {
      let currentDate = new Date();
      let startDate = data?.startTime;
      if (!(startDate instanceof Date)) startDate = new Date(data?.startTime);

      const isLocked = startDate > currentDate;
      const isRevoked = data?.isRevoked;
      return (
        <Badge variant="solid" colorScheme={isRevoked ? 'red' : (isLocked ? 'green' : 'blackAlpha')} rounded="md" fontSize="0.7em" px="2">
          {isRevoked ? 'Revoked' : (isLocked ? 'Locked' : 'Unlocked')}
        </Badge>
      );
    },
  },
];

export default function TokenLocksTable(props) {
  // app state
  const { chainId } = useActiveWeb3React();

  // props
  const { mode } = props;

  // component state
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [tokenLocks, setTokenLocks] = useState([]);
  const [totalTokenLocks, setTotalTokenLocks] = useState(0);

  // locks management
  const refreshTokenLocks = async (page) => {
    setIsLoading(true);
    setCurrentPage(page);

    let _tokenLocks = [];
    let _totalTokenLocks = 0;
    try {
      const { data: tokensLocksData } = await getTokenLocks(chainId, page, mode == 'full' ? ALL_TOKEN_LOCKS_PAGE_SIZE : LATEST_TOKEN_LOCKS_PAGE_SIZE);
      if (tokensLocksData?.results) {
        _tokenLocks = tokensLocksData.results;
        _totalTokenLocks = tokensLocksData.totalResults;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTokenLocks(_tokenLocks);
      setTotalTokenLocks(_totalTokenLocks);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    refreshTokenLocks(1);
  }, [chainId]);

  // pagination management
  const totalPages = useMemo(() => {
    return Math.ceil(totalTokenLocks / ALL_TOKEN_LOCKS_PAGE_SIZE);
  }, [totalTokenLocks]);

  const onPreviousClick = () => {
    const nextPage = currentPage - 1;
    if (nextPage < 1) nextPage = 1;

    refreshTokenLocks(nextPage);
  };

  const onNextClick = () => {
    const nextPage = currentPage + 1;
    if (nextPage > totalPages) nextPage = totalPages;

    refreshTokenLocks(nextPage);
  };

  const isPreviousDisabled = useMemo(() => currentPage == 1, [currentPage]);
  const isNextDisabled = useMemo(() => currentPage == totalPages || totalPages == 0, [currentPage, totalPages]);

  return (
    <>
      {isLoading ? (
        <Center>
          <Heading size="md" fontWeight="normal" mr="2">
            Loading...
          </Heading>
          <CircularProgress size="25px" color="brand.500" isIndeterminate />
        </Center>
      ) : (
        <>
          <Table variant="simple" fontSize="md">
            <Thead>
              <Tr>
                {TOKEN_LOCKS_TABLE_COLUMNS.map((column, index) => (
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
                  {TOKEN_LOCKS_TABLE_COLUMNS.map((column, index) => {
                    const cell = row[column.accessor];
                    const element = column.Cell?.({ data: row, chainId }) ?? cell;
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
              <b>{totalTokenLocks}</b> <i>Token Locks</i>
            </Text>
            <ButtonGroup variant="outline" size="sm">
              {mode == 'full' ? (
                <HStack>
                  <Text as="b" color="gray.600" fontSize="sm" mr="2">
                    Page {currentPage}
                  </Text>
                  <ButtonGroup variant="outline" size="sm">
                    <Button onClick={onPreviousClick} disabled={isPreviousDisabled || isLoading}>
                      Previous
                    </Button>
                    <Button onClick={onNextClick} disabled={isNextDisabled || isLoading}>
                      Next
                    </Button>
                  </ButtonGroup>
                </HStack>
              ) : (
                <Button as={RouterLink} to="/locks" rel="more">
                  View more
                </Button>
              )}
            </ButtonGroup>
          </Flex>
        </>
      )}
    </>
  );
}
