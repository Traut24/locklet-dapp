import { Alert, AlertDescription, AlertIcon, AlertTitle, Badge, Box, Button, Circle, HStack, Image, Link, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, SimpleGrid, Spacer, Table, Tbody, Td, Text, Th, Thead, Tooltip, Tr } from '@chakra-ui/react';
import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { formatUnits } from '@ethersproject/units';
import ERC20 from 'contracts/ERC20.json';
import { addDays } from 'date-fns/esm';
import { useEffect, useMemo, useState } from 'react';
import { FaReceipt } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { Link as RouterLink, useHistory, useLocation } from 'react-router-dom';
import TextLoader from 'src/components/Loaders/TextLoader';
import { TOKEN_VAULT } from 'src/constants';
import { useActiveWeb3React } from 'src/hooks';
import { useTokenVaultContract } from 'src/hooks/useContract';
import { useToggleModal } from 'src/hooks/useToggleModal';
import useTokensMetadata from 'src/hooks/useTokensMetadata';
import { getTokenLockTxHash } from 'src/services/lockletApi';
import { formatDate, formatTime, getExplorerLink, shortenAddress, shortenTxHash } from 'src/utils';

export default function LockDetails() {
  // app state
  const { chainId, library } = useActiveWeb3React();

  const appNetwork = useSelector((state) => state.app.network);

  const history = useHistory();
  const location = useLocation();

  const tokensMetadata = useTokensMetadata();

  // modal state
  const lockDetailsModalOpen = useSelector((state) => state.modals.lockDetails.show);
  const restrictedTokenAddr = useSelector((state) => state.modals.lockDetails.restrictedTokenAddr);

  const onLockDetailsModalClose = () => {
    const { pathname } = location;

    const locksPageRegExp = /^\/\w+\/locks\/\d(\/?)$/m;
    const tokenPageLocksRegExp = /^\/\w+\/tokens\/.*\/\d(\/?)$/m;

    if (locksPageRegExp.exec(pathname) !== null) {
      history.push(`/${appNetwork}/locks`);
    } else if (tokenPageLocksRegExp.exec(pathname) !== null) {
      history.push(`/${appNetwork}/tokens/${restrictedTokenAddr}`);
    }
  };

  const toggleLockDetailsModal = useToggleModal('lockDetails', onLockDetailsModalClose);

  useEffect(() => {
    if (lockDetailsModalOpen) toggleLockDetailsModal(); // close modal if chain change
  }, [chainId]);

  const lockIndex = useSelector((state) => state.modals.lockDetails.lockIndex);

  const lockIndexAsNumber = useMemo(() => {
    if (lockIndex === undefined || lockIndex === null) return null;
    return parseFloat(formatUnits(lockIndex, 0));
  }, [lockIndex]);

  // append friendly url
  useEffect(() => {
    if (lockIndexAsNumber !== null) {
      const { pathname } = location;

      if (pathname.startsWith(`/${appNetwork}/locks`)) history.push(`/${appNetwork}/locks/${lockIndexAsNumber}`);
      else if (pathname.startsWith(`/${appNetwork}/tokens`)) history.push(`/${appNetwork}/tokens/${restrictedTokenAddr}/${lockIndexAsNumber}`);
    }
  }, [lockIndexAsNumber]);

  // token vault management
  const tokenVaultAddr = TOKEN_VAULT[chainId];
  const tokenVault = useTokenVaultContract(tokenVaultAddr);

  const [isLoading, setIsLoading] = useState(true);
  const [lockDetails, setLockDetails] = useState(null);
  const [tokenInfos, setTokenInfos] = useState(null);

  const refreshLockDetails = async () => {
    let _lockDetails = null;
    try {
      _lockDetails = await tokenVault.getLock(lockIndexAsNumber);
      setLockDetails(_lockDetails);
    } catch (err) {
      console.error(err);
      toggleLockDetailsModal();
      return;
    }

    const tokenAddress = _lockDetails.lock.tokenAddress;
    if (restrictedTokenAddr && restrictedTokenAddr?.toLowerCase() !== tokenAddress?.toLowerCase()) {
      toggleLockDetailsModal();
      return;
    }

    const tokenContract = new Contract(tokenAddress, ERC20.abi, library);

    const tokenName = await tokenContract.name();
    const tokenSymbol = await tokenContract.symbol();
    const tokenDecimals = await tokenContract.decimals();

    let tokenLogoUrl = null;

    const trustWalletInfos = tokensMetadata?.find((x) => x.address?.toLowerCase() == tokenAddress?.toLowerCase());
    if (trustWalletInfos) tokenLogoUrl = trustWalletInfos.logoURI;

    setTokenInfos({ tokenAddress, tokenName, tokenSymbol, tokenDecimals, tokenLogoUrl });
    setIsLoading(false);
  };

  const isLinear = useMemo(() => {
    if (!lockDetails) return null;
    return lockDetails.lock.durationInDays > 1;
  }, [lockDetails]);

  const isRevocable = useMemo(() => {
    if (!lockDetails) return null;
    return lockDetails.lock.isRevocable;
  }, [lockDetails]);

  const isRevoked = useMemo(() => {
    if (!lockDetails) return null;
    return lockDetails.lock.isRevoked;
  }, [lockDetails]);

  const creationDate = useMemo(() => {
    if (!lockDetails) return null;
    return new Date(lockDetails.lock.creationTime.toNumber() * 1000);
  }, [lockDetails]);

  const startDate = useMemo(() => {
    if (!lockDetails) return null;
    return new Date(lockDetails.lock.startTime.toNumber() * 1000);
  }, [lockDetails]);

  const isLocked = useMemo(() => {
    if (!startDate) return null;
    const currentDate = new Date();
    return startDate > currentDate;
  }, [startDate]);

  const endDate = useMemo(() => {
    if (!startDate) return null;
    return addDays(startDate, lockDetails.lock.durationInDays);
  }, [startDate]);

  const totalAmount = useMemo(() => {
    if (!lockDetails || !tokenInfos) return null;

    let _totalAmount = BigNumber.from(0);
    for (let recipient of lockDetails.recipients) {
      _totalAmount = _totalAmount.add(recipient.amount);
    }
    return formatUnits(_totalAmount, tokenInfos.tokenDecimals);
  }, [lockDetails, tokenInfos]);

  const initiatorAddress = useMemo(() => {
    if (!lockDetails) return null;
    return lockDetails.lock.initiatorAddress;
  }, [lockDetails]);

  // tx hash
  const [txHash, setTxHash] = useState(null);

  const tryRefreshTxHash = async () => {
    try {
      const txHashData = await getTokenLockTxHash(chainId, lockIndexAsNumber);
      if (txHashData?.status == 200 && txHashData?.data !== '') setTxHash(txHashData.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (tokenVault && lockIndexAsNumber !== null && tokensMetadata !== undefined) {
      refreshLockDetails();
      tryRefreshTxHash();
    }
  }, [tokenVault, lockIndexAsNumber, tokensMetadata]);

  useEffect(() => {
    if (!lockIndexAsNumber) {
      setIsLoading(true);
      setLockDetails(null);
      setTokenInfos(null);
      setTxHash(null);
    }
  }, [lockIndexAsNumber]);

  return (
    <Modal isOpen={lockDetailsModalOpen} onClose={toggleLockDetailsModal} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader pb="0">
          Token Lock Details <small>#{lockIndexAsNumber}</small>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {isLoading ? (
            <TextLoader mt="6" />
          ) : (
            <>
              <Box mb="4">
                <Text>
                  <Badge variant="outline" colorScheme={isLinear ? 'purple' : 'messenger'} rounded="md" px="4" mr="2" verticalAlign="baseline">
                    {isLinear ? 'Linear' : 'Unique'}
                  </Badge>
                  {isLinear ? (
                    <>
                      {isLocked ? 'Will be ' : 'Has been '} unlocked from{' '}
                      <Tooltip label={formatTime(startDate)} placement="bottom" closeOnClick={false} rounded="md">
                        <Text as="span" fontWeight="medium">
                          {formatDate(startDate)}
                        </Text>
                      </Tooltip>{' '}
                      to{' '}
                      <Tooltip label={formatTime(endDate)} placement="bottom" closeOnClick={false} rounded="md">
                        <Text as="span" fontWeight="medium">
                          {formatDate(endDate)}
                        </Text>
                      </Tooltip>
                      .
                    </>
                  ) : (
                    <>
                      {isLocked ? 'Will be ' : 'Has been '} unlocked on{' '}
                      <Tooltip label={formatTime(startDate)} placement="bottom" closeOnClick={false} rounded="md">
                        <Text as="span" fontWeight="medium">
                          {formatDate(startDate)}
                        </Text>
                      </Tooltip>
                      .
                    </>
                  )}
                </Text>

                <Alert status={isRevocable ? (isRevoked ? 'error' : 'warning') : 'success'} rounded="md" mt="2">
                  <AlertIcon />
                  <AlertTitle mr={2}>
                    {isRevocable ? (isRevoked ? 'This lock has been revoked.' : 'This lock is revocable.') : 'This lock is immutable.'}
                  </AlertTitle>
                  {isRevocable && (
                    <AlertDescription>
                      <Link href="https://docs.locklet.finance/locks/create-a-lock#what-is-a-revocable-lock" color="brand.500" isExternal>
                        Read more...
                      </Link>
                    </AlertDescription>
                  )}
                </Alert>

                {txHash && (
                  <Alert status="info" rounded="md" mt="2">
                    <AlertIcon />
                    <AlertTitle mr={2}>Transaction:</AlertTitle>
                    <AlertDescription>
                      <Link href={getExplorerLink(chainId, txHash, 'transaction')} color="brand.500" fontWeight="semibold" isExternal>
                        <HStack spacing="1">
                          <FaReceipt />
                          <Text>{shortenTxHash(txHash)}</Text>
                        </HStack>
                      </Link>
                    </AlertDescription>
                  </Alert>
                )}
              </Box>

              <SimpleGrid columns={3} spacing={4} backgroundColor="gray.50" rounded="md" px="4" py="2" mb="4">
                {/* Token */}
                <Box>
                  <Text fontSize="lg" fontWeight="semibold">
                    Token
                  </Text>

                  <HStack>
                    {tokenInfos.tokenLogoUrl && (
                      <Circle rounded="full" size="5">
                        <Image src={tokenInfos.tokenLogoUrl} />
                      </Circle>
                    )}
                    <Link as={RouterLink} to={`/${appNetwork}/tokens/${tokenInfos.tokenAddress}`} color="brand.500" isExternal>
                      <Text fontWeight="semibold">{tokenInfos.tokenSymbol}</Text>
                    </Link>
                  </HStack>
                </Box>

                {/* Amount */}
                <Box>
                  <Text fontSize="lg" fontWeight="semibold">
                    Amount
                  </Text>

                  <Text>{totalAmount}</Text>
                </Box>

                {/* Status */}
                <Box>
                  <Text fontSize="lg" fontWeight="semibold">
                    Status
                  </Text>

                  <Badge
                    variant="solid"
                    colorScheme={isRevoked ? 'red' : isLocked ? 'green' : 'blackAlpha'}
                    rounded="md"
                    fontSize="0.7em"
                    px="2"
                    verticalAlign="baseline"
                  >
                    {isRevoked ? 'Revoked' : isLocked ? 'Locked' : 'Unlocked'}
                  </Badge>
                </Box>
              </SimpleGrid>

              {/* Recipients */}
              <Box>
                <Text fontSize="lg" fontWeight="semibold">
                  Recipients
                </Text>

                <Table variant="striped" fontSize="md">
                  <Thead>
                    <Tr>
                      <Th whiteSpace="nowrap" scope="col">
                        Address
                      </Th>
                      <Th whiteSpace="nowrap" scope="col">
                        Amount
                      </Th>
                      <Th whiteSpace="nowrap" scope="col">
                        Claimed
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {lockDetails?.recipients.map((row, index) => (
                      <Tr key={index}>
                        <Td whiteSpace="nowrap">
                          <Link href={getExplorerLink(chainId, row.recipientAddress, 'address')} color="brand.500" isExternal>
                            {shortenAddress(row.recipientAddress)}
                          </Link>
                        </Td>
                        <Td whiteSpace="nowrap">{formatUnits(row.amount, tokenInfos.tokenDecimals)}</Td>
                        <Td whiteSpace="nowrap">{formatUnits(row.amountClaimed, tokenInfos.tokenDecimals)}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </>
          )}
        </ModalBody>

        <ModalFooter>
          <Text fontSize="small" fontStyle="italic">
            This lock was created by{' '}
            <Link href={initiatorAddress && getExplorerLink(chainId, initiatorAddress, 'address')} color="brand.500" isExternal>
              {initiatorAddress && shortenAddress(initiatorAddress)}
            </Link>{' '}
            on {creationDate && formatDate(creationDate)}.
          </Text>
          <Spacer />
          <Button variant="ghost" onClick={toggleLockDetailsModal}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
