import { Box, Button, ButtonGroup, Flex, HStack, Table, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import TextLoader from 'src/components/Loaders/TextLoader';
import { TOKEN_LOCKS_BY_TOKEN_ADDR_PAGE_SIZE } from 'src/constants';
import { useActiveWeb3React } from 'src/hooks';
import { useToggleModal } from 'src/hooks/useToggleModal';
import { getTokenLocksByTokenAddr } from 'src/services/lockletApi';

import { TOKEN_LOCKS_TABLE_COLUMNS } from '../TokenLocksTable';

export default function TokenLocksByTokenAddr(props) {
  const { tokenAddress } = props;

  return (
    <>
      <Box mx="auto" py="4" px="4" rounded="lg" bg="white" shadow="base" overflowX="auto">
        <TokenLocksInternalTable tokenAddress={tokenAddress} />
      </Box>
    </>
  );
}

function TokenLocksInternalTable(props) {
  // app state
  const { chainId } = useActiveWeb3React();

  const toggleLockDetailsModal = useToggleModal('lockDetails');

  // props
  const { tokenAddress } = props;

  // component state
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [tokenLocks, setTokenLocks] = useState([]);
  const [totalTokenLocks, setTotalTokenLocks] = useState(0);

  // locks management
  const refreshTokenLocks = async () => {
    setIsLoading(true);
    setCurrentPage(1);

    let _tokenLocks = [];
    let _totalTokenLocks = 0;

    try {
      const { data: tokensLocksData } = await getTokenLocksByTokenAddr(chainId, tokenAddress);
      if (tokensLocksData && tokensLocksData?.length > 0) {
        _tokenLocks = tokensLocksData;
        _totalTokenLocks = tokensLocksData?.length;
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
    refreshTokenLocks();
  }, [chainId, tokenAddress]);

  // pagination management
  const totalPages = useMemo(() => {
    return Math.ceil(totalTokenLocks / TOKEN_LOCKS_BY_TOKEN_ADDR_PAGE_SIZE);
  }, [totalTokenLocks]);

  const paggedTokenLocks = useMemo(() => {
    return tokenLocks?.slice((currentPage - 1) * TOKEN_LOCKS_BY_TOKEN_ADDR_PAGE_SIZE, currentPage * TOKEN_LOCKS_BY_TOKEN_ADDR_PAGE_SIZE);
  }, [tokenLocks, currentPage]);

  const onPreviousClick = () => {
    const nextPage = currentPage - 1;
    if (nextPage < 1) nextPage = 1;

    setCurrentPage(nextPage);
  };

  const onNextClick = () => {
    const nextPage = currentPage + 1;
    if (nextPage > totalPages) nextPage = totalPages;

    setCurrentPage(nextPage);
  };

  const isPreviousDisabled = useMemo(() => currentPage == 1, [currentPage]);
  const isNextDisabled = useMemo(() => currentPage == totalPages || totalPages == 0, [currentPage, totalPages]);

  return (
    <>
      {isLoading ? (
        <TextLoader />
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
              {paggedTokenLocks.map((row, index) => (
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
                    <Button variant="link" colorScheme="brand" onClick={() => toggleLockDetailsModal({ lockIndex: row.id, restrictedTokenAddr: tokenAddress })}>
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
            </ButtonGroup>
          </Flex>
        </>
      )}
    </>
  );
}
