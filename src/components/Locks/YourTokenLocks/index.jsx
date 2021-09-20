import { ArrowForwardIcon, SettingsIcon } from '@chakra-ui/icons';
import { Alert, AlertIcon, Badge, Box, Button, ButtonGroup, Center, CircularProgress, Flex, Heading, HStack, IconButton, Menu, MenuButton, MenuItem, MenuList, Table, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react';
import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { formatUnits } from '@ethersproject/units';
import ERC20 from 'contracts/ERC20.json';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ExternalLink as LinkIcon } from 'react-feather';
import { FaBan, FaCoins, FaExpandAlt, FaEye, FaInfoCircle, FaLayerGroup, FaList, FaReceipt, FaRegEye } from 'react-icons/fa';
import TextLoader from 'src/components/Loaders/TextLoader';
import { TOKEN_VAULT, YOUR_TOKEN_LOCKS_PAGE_SIZE } from 'src/constants';
import { useActiveWeb3React } from 'src/hooks';
import { useTokenVaultContract } from 'src/hooks/useContract';
import { useToggleModal } from 'src/hooks/useToggleModal';
import useTokensMetadata from 'src/hooks/useTokensMetadata';
import { toLockWithRecipients } from 'src/utils/converter';

import { TOKEN_LOCKS_TABLE_COLUMNS } from '../TokenLocksTable';

export default function YourTokenLocks() {
  // app state
  const { chainId, account, library } = useActiveWeb3React();

  const tokensMetadata = useTokensMetadata();

  const toggleRevokeLockModal = useToggleModal('revokeLock');
  const toggleClaimTokensModal = useToggleModal('claimTokens');
  const togglePullRefundModal = useToggleModal('pullRefund');
  const toggleLockDetailsModal = useToggleModal('lockDetails');

  // component state
  const tokenVaultAddr = TOKEN_VAULT[chainId];
  const tokenVault = useTokenVaultContract(tokenVaultAddr);

  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [tokenLocks, setTokenLocks] = useState([]);
  const [totalTokenLocks, setTotalTokenLocks] = useState(0);

  // locks management
  const refreshTokenLocks = async () => {
    setIsLoading(true);
    setCurrentPage(1);

    let mergedTokenLocks = [];

    try {
      const initiatorTokenLocks = await tokenVault.getLocksByInitiator(account);
      if (initiatorTokenLocks && initiatorTokenLocks?.length > 0)
        mergedTokenLocks = mergedTokenLocks.concat(initiatorTokenLocks.map((x) => toLockWithRecipients(x, 'Initiator')));
    } catch (err) {
      console.error(err);
    }

    try {
      const recipientTokenLocks = await tokenVault.getLocksByRecipient(account);
      if (recipientTokenLocks && recipientTokenLocks?.length > 0)
        mergedTokenLocks = mergedTokenLocks.concat(recipientTokenLocks.map((x) => toLockWithRecipients(x, 'Recipient')));
    } catch (err) {
      console.error(err);
    }

    mergedTokenLocks = await Promise.all(
      mergedTokenLocks.map(async (x) => {
        let claimAmount = BigNumber.from(0);
        if (!x.isInitiator) {
          try {
            claimAmount = (await tokenVault.getClaimByLockAndRecipient(x.id, account))[1] ?? BigNumber.from(0);
          } catch (err) { }
        }

        return {
          ...x,
          claimAmount: claimAmount,
        };
      })
    );

    mergedTokenLocks = mergedTokenLocks.sort((a, b) => b.idAsNumber - a.idAsNumber);

    setTokenLocks(mergedTokenLocks);
    setTotalTokenLocks(mergedTokenLocks?.length);

    setIsLoading(false);
  };

  useEffect(() => {
    refreshTokenLocks();
  }, [chainId]);

  const totalDistinctTokenLocks = useMemo(() => {
    return [...new Set(tokenLocks.map((x) => x.idAsNumber))]?.length;
  }, [tokenLocks]);

  const [tokensInfos, setTokensInfos] = useState([]);

  const refreshTokensInfos = async () => {
    const tokensAddresses = [...new Set(tokenLocks.map((x) => x.tokenAddress))];

    let _tokensInfos = [];
    for (let tokenAddress of tokensAddresses) {
      if (!_tokensInfos[tokenAddress]) {
        const tokenContract = new Contract(tokenAddress, ERC20.abi, library);

        const tokenName = await tokenContract.name();
        const tokenSymbol = await tokenContract.symbol();
        const tokenDecimals = await tokenContract.decimals();

        let tokenLogoUrl = null;

        const trustWalletInfos = tokensMetadata?.find((x) => x.address?.toLowerCase() == tokenAddress?.toLowerCase());
        if (trustWalletInfos) tokenLogoUrl = trustWalletInfos.logoURI;

        const tokenRefundAmount = await tokenVault.getRefundAmount(tokenAddress);

        _tokensInfos[tokenAddress] = { tokenName, tokenSymbol, tokenDecimals, tokenLogoUrl, tokenRefundAmount };
      }
    }

    setTokensInfos(_tokensInfos);
  };

  const tokenLocksWithInfos = useMemo(() => {
    if (!tokenLocks) return;
    if (!tokensInfos) return tokenLocks;
    return tokenLocks.map((x) => ({ ...x, ...tokensInfos[x.tokenAddress] }));
  }, [tokenLocks, tokensInfos]);

  useEffect(() => {
    refreshTokensInfos();
  }, [tokenLocks, tokensMetadata]);

  // callbacks
  const onClaimSuccess = useCallback(() => {
    refreshTokenLocks();
  });

  const onRevokeSuccess = useCallback(() => {
    refreshTokenLocks();
  });

  const onPullRefundSuccess = useCallback(() => {
    refreshTokenLocks();
  });

  // pagination management
  const totalPages = useMemo(() => {
    return Math.ceil(totalTokenLocks / YOUR_TOKEN_LOCKS_PAGE_SIZE);
  }, [totalTokenLocks]);

  const paggedTokenLocks = useMemo(() => {
    return tokenLocksWithInfos?.slice((currentPage - 1) * YOUR_TOKEN_LOCKS_PAGE_SIZE, currentPage * YOUR_TOKEN_LOCKS_PAGE_SIZE);
  }, [tokenLocksWithInfos, currentPage]);

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
    <Box mx="auto" py="4" px="4" rounded="lg" bg="white" shadow="base" overflowX="auto">
      {isLoading && (
        <TextLoader />
      )}

      {!isLoading && (!paggedTokenLocks || paggedTokenLocks?.length == 0) && (
        <Alert status="warning" mb="2" rounded="md">
          <AlertIcon />
          You have not created any locks and no locks have been intended for you.
        </Alert>
      )}

      {!isLoading && (
        <>
          <Table variant="simple" fontSize="md">
            <Thead>
              <Tr>
                <Th whiteSpace="nowrap" scope="col">
                  Id
                </Th>
                <Th whiteSpace="nowrap" scope="col">
                  Role
                </Th>
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
                  <Td whiteSpace="nowrap">
                    <Button variant="link" colorScheme="brand" onClick={() => toggleLockDetailsModal({ lockIndex: row.id })}>
                      {row?.idAsNumber}
                    </Button>
                  </Td>
                  <Td whiteSpace="nowrap">
                    {row?.isInitiator ? (
                      <Badge variant="solid" colorScheme="blue" rounded="md" fontSize="0.7em" px="2" mr="2">
                        Initiator
                      </Badge>
                    ) : (
                      <Badge variant="solid" colorScheme="pink" rounded="md" fontSize="0.7em" px="2" mr="2">
                        Recipient
                      </Badge>
                    )}
                  </Td>
                  {TOKEN_LOCKS_TABLE_COLUMNS.map((column, index) => {
                    const cell = row[column.accessor];
                    const element = column.Cell?.({ data: row, chainId, account }) ?? cell;
                    return (
                      <Td whiteSpace="nowrap" key={index}>
                        {element}
                      </Td>
                    );
                  })}
                  <Td textAlign="right">
                    <Menu>
                      <MenuButton as={IconButton} aria-label="Options" icon={<SettingsIcon />} variant="outline"
                        bgColor={row.isInitiator ? "blue.500" : "pink.500"}
                        _hover={{ bgColor: row.isInitiator ? "blue.600" : "pink.600" }}
                        _active={{ bgColor: row.isInitiator ? "blue.600" : "pink.600" }}
                        color="white"
                      />
                      <MenuList>
                        {row.isInitiator ? (
                          <MenuItem
                            icon={<FaBan />}
                            isDisabled={!row.isRevocable || row.isRevoked}
                            onClick={() => toggleRevokeLockModal({ lockIndex: row.idAsNumber, onSuccess: onRevokeSuccess })}
                          >
                            Revoke Lock
                          </MenuItem>
                        ) : (
                          <MenuItem icon={<FaCoins />}
                            isDisabled={row.isRevoked}
                            onClick={() => toggleClaimTokensModal({ lockIndex: row.idAsNumber, claimAmount: formatUnits(row.claimAmount, row.tokenDecimals), onSuccess: onClaimSuccess })}>
                            Claim Tokens
                          </MenuItem>
                        )}
                        <MenuItem icon={<ArrowForwardIcon />}
                          isDisabled={!row.tokenRefundAmount || row.tokenRefundAmount.lte(BigNumber.from(0))}
                          onClick={() => togglePullRefundModal({ tokenAddress: row.tokenAddress, refundAmount: formatUnits(row.tokenRefundAmount, row.tokenDecimals), onSuccess: onPullRefundSuccess })}>
                          Pull Refund
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          <Flex align="center" justify="space-between" mt="4">
            <Text color="gray.600" fontSize="sm">
              <b>{totalDistinctTokenLocks}</b> <i>Token Locks</i>
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
    </Box>
  );
}
