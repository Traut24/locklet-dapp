import { Alert, AlertDescription, AlertIcon, AlertTitle, Badge, Box, Button, Center, Circle, CircularProgress, Heading, HStack, Image, Link, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, SimpleGrid, Spacer, Table, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react';
import { Contract } from '@ethersproject/contracts';
import ERC20 from 'contracts/ERC20.json';
import { addDays } from 'date-fns/esm';
import { formatUnits } from 'ethers/lib/utils';
import { BigNumber } from 'ethers/node_modules/@ethersproject/contracts/node_modules/@ethersproject/bignumber';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import TextLoader from 'src/components/Loaders/TextLoader';
import { TOKEN_VAULT } from 'src/constants';
import { useActiveWeb3React } from 'src/hooks';
import { useTokenVaultContract } from 'src/hooks/useContract';
import { useToggleModal } from 'src/hooks/useToggleModal';
import useTokensMetadata from 'src/hooks/useTokensMetadata';
import { formatDate, getExplorerLink, shortenAddress } from 'src/utils';

export default function LockDetails() {
  // app state
  const { chainId, library } = useActiveWeb3React();

  const tokensMetadata = useTokensMetadata();

  // modal state
  const lockDetailsModalOpen = useSelector((state) => state.modals.lockDetails.show);
  const toggleLockDetailsModal = useToggleModal('lockDetails');

  useEffect(() => {
    if (lockDetailsModalOpen) toggleLockDetailsModal(); // close modal if chain change
  }, [chainId]);

  const lockIndex = useSelector((state) => state.modals.lockDetails.lockIndex);

  const lockIndexAsNumber = useMemo(() => {
    if (lockIndex === undefined || lockIndex === null) return null;
    return parseFloat(formatUnits(lockIndex, 0));
  }, [lockIndex]);

  // token vault management
  const tokenVaultAddr = TOKEN_VAULT[chainId];
  const tokenVault = useTokenVaultContract(tokenVaultAddr);

  const [isLoading, setIsLoading] = useState(true);
  const [lockDetails, setLockDetails] = useState(null);
  const [tokenInfos, setTokenInfos] = useState(null);

  const refreshLockDetails = async () => {
    const _lockDetails = await tokenVault.getLock(lockIndexAsNumber);
    setLockDetails(_lockDetails);

    const tokenAddress = _lockDetails.lock.tokenAddress;
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

  useEffect(() => {
    if (tokenVault && lockIndexAsNumber !== null) refreshLockDetails();
  }, [tokenVault, lockIndexAsNumber]);

  useEffect(() => {
    if (!lockIndexAsNumber) {
      setIsLoading(true);
      setLockDetails(null);
      setTokenInfos(null);
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
                      <Text as="span" fontWeight="medium">
                        {formatDate(startDate)}
                      </Text>{' '}
                      to{' '}
                      <Text as="span" fontWeight="medium">
                        {formatDate(endDate)}
                      </Text>
                      .
                    </>
                  ) : (
                    <>
                      {isLocked ? 'Will be ' : 'Has been '} unlocked on{' '}
                      <Text as="span" fontWeight="medium">
                        {formatDate(startDate)}
                      </Text>
                      .
                    </>
                  )}
                </Text>

                <Alert status={isRevocable ? (isRevoked ? 'error' : 'warning') : 'success'} rounded="md" mt="2">
                  <AlertIcon />
                  <AlertTitle mr={2}>
                    {isRevocable ? (isRevoked ? 'This lock has been revoked.' : 'This lock is revocable.') : 'This lock is immutable.'}
                  </AlertTitle>
                  <AlertDescription>
                    <Link href="#" color="brand.500" isExternal>
                      Read more...
                    </Link>
                  </AlertDescription>
                </Alert>
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
                    <Link as={RouterLink} to={`/tokens/${tokenInfos.tokenAddress}`} color="brand.500" isExternal>
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

                  <Badge variant="solid" colorScheme={isRevoked ? 'red' : isLocked ? 'green' : 'blackAlpha'} rounded="md" fontSize="0.7em" px="2" verticalAlign="baseline">
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
                      <Tr>
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
