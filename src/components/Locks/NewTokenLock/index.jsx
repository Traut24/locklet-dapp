import { Alert, AlertDescription, AlertIcon, AlertTitle, Badge, Box, Button, ButtonGroup, Collapse, Fade, Flex, FormControl, FormHelperText, FormLabel, HStack, Input, Link, useColorModeValue as mode, ScaleFade, Spacer, Stack, Switch, Tab, TabList, TabPanel, TabPanels, Tabs, Text, useNumberInput } from '@chakra-ui/react';
import { BigNumber } from '@ethersproject/bignumber';
import { MaxUint256 } from '@ethersproject/constants';
import { formatUnits } from '@ethersproject/units';
import capitalize from 'capitalize-sentence'
import * as React from 'react';
import { useMemo } from 'react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaExclamationTriangle, FaPlusCircle } from 'react-icons/fa';
import DatePicker from 'src/components/DatePicker';
import AdvancedNumberInputField from 'src/components/Inputs/AdvancedNumberInputField';
import RecipientInput from 'src/components/Inputs/RecipientInput';
import { LKT_TOKEN, TOKEN_VAULT } from 'src/constants';
import { useActiveWeb3React } from 'src/hooks';
import { useTransactionAdder } from 'src/hooks/transactions';
import { useTokenContract, useTokenVaultContract } from 'src/hooks/useContract';
import { useToggleModal } from 'src/hooks/useToggleModal';
import { daysBetween, isAddress } from 'src/utils';

export default function NewTokenLock() {
  // app state
  const { chainId, account } = useActiveWeb3React();
  const addTx = useTransactionAdder();

  // component state
  const [isSuccess, setIsSuccess] = useState(false);

  const [isTokenSelected, setIsTokenSelected] = useState(false);
  const [isTokenErrored, setIsTokenErrored] = useState(false);
  const [selectedTokenData, setSelectedTokenData] = useState(null);
  const [selectedTokenAllowanceAsBN, setSelectedTokenAllowanceAsBN] = useState(BigNumber.from(0));
  const [tokenBalanceAsBN, setTokenBalanceAsBN] = useState(BigNumber.from(0));

  const [flatFeeLktAmount, setFlatFeeLktAmount] = useState(0);
  const [percentFeeAsBN, setPercentFeeAsBN] = useState(BigNumber.from(0));

  const [lktAllowanceAsBN, setLktAllowanceAsBN] = useState(BigNumber.from(0));

  const [isAllowanceLoading, setIsAllowanceLoading] = useState(false);
  const [isLockLoading, setIsLockLoading] = useState(false);

  // form controls
  const [tokenAddr, setTokenAddr] = useState(null);

  const [totalLockAmountAsBN, setTotalLockAmountAsBN] = useState(BigNumber.from(0));

  const [recipients, setRecipients] = useState([{ addr: '', amountAsBN: BigNumber.from(0) }]);

  const [lockMode, setLockMode] = useState('Date');

  const todayDate = new Date();

  const tomorrowDate = new Date();
  tomorrowDate.setDate(todayDate.getDate() + 1);
  tomorrowDate.setHours(0, 0, 0, 0);

  const [startDate, setStartDate] = useState(tomorrowDate);
  const [lStartDate, setLStartDate] = useState(tomorrowDate);

  const minLEndDate = new Date();
  minLEndDate.setDate(tomorrowDate.getDate() + 1);

  const [lEndDate, setLEndDate] = useState(minLEndDate);

  const [canBeRevocable, setCanBeRevocable] = useState(false);
  const [revocable, setRevocable] = useState(false);

  const [payFeeWithLKT, setPayFeeWithLKT] = useState(true);

  // form handlers
  const onTokenAddrChange = (e) => {
    setTokenAddr(e.target.value);
  };

  const onTotalLockAmountChange = (amountAsBN) => {
    setTotalLockAmountAsBN(amountAsBN);
  };

  const onAddRecipientClick = () => {
    setRecipients([...recipients, { addr: '', amountAsBN: BigNumber.from(0) }]);
  };

  const onRemoveRecipientClick = (i) => {
    let _recipients = [...recipients];
    _recipients.splice(i, 1);
    setRecipients(_recipients);
  };

  const onRecipientChange = (i, { addr, amountAsBN }) => {
    let _recipients = [...recipients];
    if (addr !== undefined) _recipients[i].addr = addr;
    if (amountAsBN !== undefined) _recipients[i].amountAsBN = BigNumber.from(amountAsBN);
    setRecipients(_recipients);
  };

  const onTabChange = (tabIndex) => {
    setLockMode(tabIndex == 0 ? 'Date' : 'Linearly');

    if (tabIndex == 0) setRevocable(false);
    setCanBeRevocable(tabIndex == 1);
  };

  // component memo
  const hasMeRecipient = useMemo(() => {
    return recipients.some((r) => r.addr == account);
  }, [recipients]);

  const hasDuplicateRecipients = useMemo(() => {
    const recipientsAddrs = recipients.map((x) => x.addr);
    return (new Set(recipientsAddrs)?.size ?? 0) !== recipientsAddrs.length;
  }, [recipients]);

  const amountsMatch = useMemo(() => {
    const recipientsTotalAmount = Object.values(recipients)
      .reduce((left, { amountAsBN }) => left.add(amountAsBN), BigNumber.from(0))
      ?.toString();
    return recipientsTotalAmount == totalLockAmountAsBN;
  }, [recipients, totalLockAmountAsBN]);

  const hasRecipientsWithInvalidAddrs = useMemo(() => {
    return recipients.some((x) => !isAddress(x.addr));
  }, [recipients]);

  const isEndDateSameAsStartDate = useMemo(() => {
    return lStartDate.getFullYear() == lEndDate.getFullYear() && lStartDate.getMonth() == lEndDate.getMonth() && lStartDate.getDate() == lEndDate.getDate();
  }, [lStartDate, lEndDate]);

  const isEndDateLowerThanStartDate = useMemo(() => {
    return lEndDate < lStartDate;
  }, [lStartDate, lEndDate]);

  const isValidLock = useMemo(() => {
    let _isValidLock = totalLockAmountAsBN > 0 && amountsMatch && !hasDuplicateRecipients && !hasRecipientsWithInvalidAddrs;
    if (_isValidLock && lockMode == 'Linearly') _isValidLock = !isEndDateSameAsStartDate && !isEndDateLowerThanStartDate;
    return _isValidLock;
  }, [
    totalLockAmountAsBN,
    amountsMatch,
    hasDuplicateRecipients,
    hasRecipientsWithInvalidAddrs,
    lockMode,
    isEndDateSameAsStartDate,
    isEndDateLowerThanStartDate,
  ]);

  const totalLockAmountWithFeeAsBN = useMemo(() => {
    if (!selectedTokenData) return BigNumber.from(0);

    const percentFeeAmountAsBN = totalLockAmountAsBN.div(10000).mul(percentFeeAsBN);
    return payFeeWithLKT ? totalLockAmountAsBN : totalLockAmountAsBN.add(percentFeeAmountAsBN);
  }, [totalLockAmountAsBN, payFeeWithLKT, selectedTokenData]);

  const totalLockAmountWithFeeAsNumber = useMemo(() => {
    if (!selectedTokenData) return 0;

    return parseFloat(formatUnits(totalLockAmountWithFeeAsBN, selectedTokenData.decimals));
  }, [totalLockAmountWithFeeAsBN, selectedTokenData]);

  const needToApproveLkt = useMemo(() => {
    let _needToApproveLkt = false;
    if (payFeeWithLKT) _needToApproveLkt = lktAllowanceAsBN.lt(flatFeeLktAmount);
    return _needToApproveLkt;
  }, [lktAllowanceAsBN, flatFeeLktAmount, payFeeWithLKT]);

  const needToApproveToken = useMemo(() => {
    return selectedTokenAllowanceAsBN.lt(totalLockAmountWithFeeAsBN);
  }, [selectedTokenAllowanceAsBN, totalLockAmountWithFeeAsBN]);

  // token vault management
  const tokenVaultAddr = TOKEN_VAULT[chainId];
  const tokenVault = useTokenVaultContract(tokenVaultAddr);

  const lktTokenAddr = LKT_TOKEN[chainId];
  const lktToken = useTokenContract(lktTokenAddr);

  const refreshTokenVaultFees = async () => {
    const creationFlatFeeLktAmountAsBN = await tokenVault.getCreationFlatFeeLktAmount();
    const creationFlatFeeLktAmount = parseFloat(formatUnits(creationFlatFeeLktAmountAsBN, 18));
    setFlatFeeLktAmount(creationFlatFeeLktAmount);

    const creationPercentFeeAsBN = await tokenVault.getCreationPercentFee();
    setPercentFeeAsBN(creationPercentFeeAsBN);
  };

  const refreshLktAllowance = async () => {
    const allowanceAsBN = await lktToken.allowance(account, tokenVault.address);
    setLktAllowanceAsBN(allowanceAsBN);
  };

  useEffect(() => {
    refreshTokenVaultFees();
    refreshLktAllowance();
  }, [chainId]);

  const toggleWalletModal = useToggleModal('walletManager');

  // token management
  const token = useTokenContract(tokenAddr);

  const refreshTokenData = async () => {
    const name = await token.name();
    const symbol = await token.symbol();
    const decimals = await token.decimals();

    const tokenData = { name, symbol, decimals };
    setSelectedTokenData(tokenData);
  };

  const refreshTokenAllowance = async () => {
    const allowanceAsBN = await token.allowance(account, tokenVault.address);
    setSelectedTokenAllowanceAsBN(allowanceAsBN);
  };

  const refreshTokenBalance = async () => {
    const balanceOfAsBN = await token.balanceOf(account);
    setTokenBalanceAsBN(balanceOfAsBN);
  };

  useEffect(() => {
    setSelectedTokenData(null);
    setSelectedTokenAllowanceAsBN(BigNumber.from(0));
    setTokenBalanceAsBN(BigNumber.from(0));
    setIsTokenErrored(false);

    if (tokenAddr?.length == 42 && token) {
      (async () => {
        try {
          await refreshTokenData();

          if (account) {
            refreshTokenBalance();
            refreshTokenAllowance();
          }

          setIsTokenSelected(true);
        } catch (err) {
          setIsTokenErrored(true);
          console.error(err);
        }
      })();
    }
  }, [token, tokenAddr, isTokenSelected]);

  useEffect(() => {
    if (account && selectedTokenData) refreshTokenBalance(selectedTokenData.decimals);
  }, [account]);

  // approve logic
  const approve = async () => {
    try {
      setIsAllowanceLoading(true);

      if (needToApproveLkt) {
        const approveLktTx = await lktToken.approve(tokenVault.address, MaxUint256);

        toast.loading('Your transaction is being confirmed...', { id: approveLktTx.hash });
        addTx(approveLktTx);

        const approveResult = await approveLktTx.wait();
        if (approveResult?.status === 1) refreshLktAllowance();
      } else if (needToApproveToken) {
        const approveTokenTx = await token.approve(tokenVault.address, MaxUint256);

        toast.loading('Your transaction is being confirmed...', { id: approveTokenTx.hash });
        addTx(approveTokenTx);

        const approveResult = await approveTokenTx.wait();
        if (approveResult?.status === 1) refreshTokenAllowance();
      }
    } catch (err) {
      console.error(err);
      if (err?.error?.message || err?.message || err?.reason) toast.error(capitalize(err?.error?.message || err?.message || err?.reason));
    } finally {
      setIsAllowanceLoading(false);
    }
  };

  // lock logic
  const lock = async () => {
    try {
      setIsLockLoading(true);

      const lockRecipients = recipients.map((x) => ({
        recipientAddress: x.addr,
        amount: x.amountAsBN,
      }));

      let lockTx = null;
      switch (lockMode) {
        case 'Date':
          const dCliffInDays = daysBetween(todayDate, startDate);
          lockTx = await tokenVault.addLock(tokenAddr, totalLockAmountAsBN, dCliffInDays, 1, lockRecipients, false, payFeeWithLKT);
          break;

        case 'Linearly':
          const lCliffInDays = daysBetween(todayDate, lStartDate);
          const durationInDays = daysBetween(lStartDate, lEndDate);
          lockTx = await tokenVault.addLock(tokenAddr, totalLockAmountAsBN, lCliffInDays, durationInDays, lockRecipients, revocable, payFeeWithLKT);
          break;
      }

      toast.loading('Your transaction is being confirmed...', { id: lockTx.hash });
      addTx(lockTx);

      const lockResult = await lockTx.wait();
      if (lockResult?.status === 1) console.log('Success!');
    } catch (err) {
      console.error(err);
      if (err?.error?.message || err?.message || err?.reason) toast.error(capitalize(err?.error?.message || err?.message || err?.reason));
    } finally {
      setIsLockLoading(false);
    }
  };

  return (
    <Box as="section" px="4" py="4" bg="inherit">
      <Box maxW={{ base: 'xl', md: '7xl' }} mx="auto" px={{ md: '8' }}>
        <Box maxW="xl" mx="auto" py="6" px="8" rounded={{ md: 'lg' }} bg="white" shadow="base">
          {!isSuccess ? (
            <>
              <Box mb="5">
                <HStack justify="start">
                  <Text as="h3" fontWeight="bold" fontSize="lg">
                    New Token Lock
                  </Text>
                </HStack>

                <Text fontSize="sm" mt="1" color="gray.600">
                  If you have the slightest doubt or interrogation about the use of this service, please take a look at our{' '}
                  <Link href="#" color="brand.500" isExternal>
                    documentation
                  </Link>
                  .
                </Text>
              </Box>

              <form>
                <Stack direction={{ base: 'column' }} spacing="2" mb="3">
                  <FormControl>
                    <FormLabel>Token address</FormLabel>
                    <FormHelperText mb="2">Enter the token address</FormHelperText>
                    <Input type="text" onChange={onTokenAddrChange} placeholder="0xd9b89eee86b15634c70cab51baf85615a4ab91a1" />
                  </FormControl>
                </Stack>
              </form>

              <Collapse in={isTokenErrored} animateOpacity>
                <Alert status="error" rounded="md" mb="5">
                  <AlertIcon />
                  <Text>
                    <strong>Cannot find a token with this address.</strong>
                    <br />
                    Please check your input and the selected network.
                  </Text>
                </Alert>
              </Collapse>

              <Collapse in={isTokenSelected && !isSuccess} animateOpacity>
                {selectedTokenData && (
                  <>
                    <Alert status="success" variant="top-accent" rounded="md" mb="5">
                      <AlertIcon />
                      {selectedTokenData.name} (<b>{selectedTokenData.symbol}</b>) — {selectedTokenData.decimals} Decimals
                    </Alert>

                    <form>
                      <Stack direction={{ base: 'column' }} spacing="2" mb="5">
                        <FormControl mb="3">
                          <FormLabel>Total amount</FormLabel>
                          <FormHelperText mb="2">Enter the total amount of tokens to lock</FormHelperText>
                          <AdvancedNumberInputField value={0} maxAsBN={tokenBalanceAsBN} showMaxBtn onChange={onTotalLockAmountChange} />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Recipients</FormLabel>
                          <FormHelperText mb="2">Enter all recipients of this lock as well as their associated amount</FormHelperText>

                          {!amountsMatch && (
                            <Alert status="warning" rounded="md" mb="2">
                              <AlertIcon />
                              <Text>
                                The total amount of{' '}
                                <Box as="span" fontWeight="semibold">
                                  all recipients does not match the total amount of this lock
                                </Box>
                                .
                              </Text>
                            </Alert>
                          )}

                          {hasDuplicateRecipients && (
                            <Alert status="warning" rounded="md" mb="2">
                              <AlertIcon />
                              <Text>
                                You have{' '}
                                <Box as="span" fontWeight="semibold">
                                  duplicate recipients
                                </Box>{' '}
                                in your lock.
                              </Text>
                            </Alert>
                          )}

                          {recipients.map((r, i) => (
                            <RecipientInput
                              key={i}
                              decimals={selectedTokenData.decimals}
                              maxAsBN={totalLockAmountAsBN}
                              onChange={(addr, amountAsBN) => onRecipientChange(i, addr, amountAsBN)}
                              isMeBtnDisabled={account && hasMeRecipient}
                              showCloseBtn={i !== 0}
                              onClose={() => onRemoveRecipientClick(i)}
                            />
                          ))}

                          <Flex mb="3">
                            <Spacer />
                            <ButtonGroup size="sm" variant="outline">
                              <Button iconSpacing="1" leftIcon={<FaPlusCircle />} onClick={onAddRecipientClick}>
                                Add
                              </Button>
                            </ButtonGroup>
                          </Flex>

                          <Flex flexDirection="column" alignItems="center" mb="4">
                            <FormLabel>How do you want the tokens to be unlocked?</FormLabel>
                            <Tabs align="center" variant="soft-rounded" colorScheme="brand" w="100%" onChange={onTabChange}>
                              <TabList>
                                <Tab>On a date</Tab>
                                <Tab>Linearly over time</Tab>
                              </TabList>
                              <TabPanels>
                                <TabPanel id="date" p="3">
                                  <Text fontSize="sm" color="gray.500" mb="4">
                                    All the tokens will be unlocked for each participant on the given date
                                  </Text>
                                  <DatePicker minDate={tomorrowDate} selectedDate={startDate} onChange={(d) => setStartDate(d)} />
                                </TabPanel>
                                <TabPanel id="linearly" p="3">
                                  <Text fontSize="sm" color="gray.500" mb="4">
                                    The tokens will be gradually unlocked in a linear fashion
                                    <br />
                                    from the start date to the end date
                                  </Text>

                                  {isEndDateSameAsStartDate && (
                                    <Alert status="warning" rounded="md" mb="2">
                                      <AlertIcon />
                                      <Text>
                                        The{' '}
                                        <Box as="span" fontWeight="semibold">
                                          end date cannot be the same as the start date
                                        </Box>
                                        .
                                      </Text>
                                    </Alert>
                                  )}

                                  {isEndDateLowerThanStartDate && (
                                    <Alert status="warning" rounded="md" mb="2">
                                      <AlertIcon />
                                      <Text>
                                        The{' '}
                                        <Box as="span" fontWeight="semibold">
                                          end date cannot be lower than the start date
                                        </Box>
                                        .
                                      </Text>
                                    </Alert>
                                  )}

                                  <FormLabel textAlign="center">Start date</FormLabel>
                                  <DatePicker minDate={tomorrowDate} selectedDate={lStartDate} onChange={(d) => setLStartDate(d)} />
                                  <FormLabel textAlign="center" mt="4">
                                    End date
                                  </FormLabel>
                                  <DatePicker minDate={minLEndDate} selectedDate={lEndDate} onChange={(d) => setLEndDate(d)} />
                                </TabPanel>
                              </TabPanels>
                            </Tabs>
                          </Flex>

                          <FormControl mb="4">
                            <Flex alignItems="center">
                              <FormLabel htmlFor="revocable-lock" mb="1">
                                Would you like this lock to be revocable?
                              </FormLabel>
                              <Switch
                                id="revocable-lock"
                                colorScheme="brand"
                                isChecked={revocable}
                                onChange={(e) => setRevocable(e.target.checked)}
                                isDisabled={!canBeRevocable}
                              />
                            </Flex>
                            {revocable && (
                              <FormHelperText>
                                <Text mb="1">Once created, you will be able to revoke this lock at any time.</Text>
                                <Text mb="1">
                                  The{' '}
                                  <Box as="span" fontWeight="semibold">
                                    tokens already unlocked at the time of revocation will be allocated to their respective recipients
                                  </Box>{' '}
                                  and{' '}
                                  <Box as="span" fontWeight="semibold">
                                    those remaining will be allocated to you
                                  </Box>
                                  .
                                </Text>
                                <HStack>
                                  <FaExclamationTriangle />
                                  <Text fontWeight="light">
                                    This is only recommended in very rare cases.{' '}
                                    <Link href="#" color="brand.500" isExternal>
                                      Read more...
                                    </Link>
                                  </Text>
                                </HStack>
                              </FormHelperText>
                            )}
                          </FormControl>

                          <FormControl mb="4">
                            <Flex alignItems="center">
                              <FormLabel htmlFor="pay-fee-with-lkt" mb="1">
                                Would you like to pay the fees in LKT?
                              </FormLabel>
                              <Switch id="pay-fee-with-lkt" defaultChecked colorScheme="brand" onChange={(e) => setPayFeeWithLKT(e.target.checked)} />
                            </Flex>
                          </FormControl>

                          <Box border="1px" borderColor="gray.200" borderRadius="md" p="4" mb="4">
                            <Flex>
                              <Text>Fee:</Text>
                              <Spacer />
                              <Text>{payFeeWithLKT ? `${flatFeeLktAmount} LKT` : `${formatUnits(percentFeeAsBN, 2)}%`}</Text>
                            </Flex>
                            <Flex>
                              <Text>Total:</Text>
                              <Spacer />
                              <Text>
                                {totalLockAmountWithFeeAsNumber} {selectedTokenData.symbol}
                              </Text>
                            </Flex>
                          </Box>
                          {account ? (
                            <Flex>
                              <Button
                                colorScheme="brand"
                                size="lg"
                                flex="1"
                                mr="1"
                                onClick={approve}
                                isDisabled={!isValidLock || (!needToApproveLkt && !needToApproveToken)}
                                isLoading={isAllowanceLoading}
                                loadingText="Approving"
                              >
                                Approve&nbsp;<Text fontWeight="light">{needToApproveLkt ? 'LKT' : needToApproveToken ? selectedTokenData.symbol : null}</Text>
                              </Button>
                              <Button
                                colorScheme="brand"
                                size="lg"
                                flex="1"
                                ml="1"
                                onClick={lock}
                                isDisabled={!isValidLock || needToApproveLkt || needToApproveToken}
                                isLoading={isLockLoading}
                                loadingText="Locking"
                              >
                                Lock
                              </Button>
                            </Flex>
                          ) : (
                            <Flex>
                              <Button colorScheme="brand" size="lg" flex="1" mr="1" onClick={toggleWalletModal}>
                                Connect to a wallet
                              </Button>
                            </Flex>
                          )}
                        </FormControl>
                      </Stack>
                    </form>
                  </>
                )}
              </Collapse>
            </>
          ) : (
            <Fade in={isSuccess}>
              <Alert
                status="success"
                variant="subtle"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                textAlign="center"
                height="200px"
                rounded="md"
              >
                <AlertIcon boxSize="40px" mr={0} />
                <AlertTitle mt={4} mb={1} fontSize="lg">
                  Transaction confirmed!
                </AlertTitle>
                <AlertDescription maxWidth="sm" alignItems="center" textAlign="center" alignSelf="center">
                  <Text>Your lock has been created successfully.</Text>
                  <Link href="#" color="brand.800" isExternal>
                    View on Explorer
                  </Link>{' — '}
                  <Link href="#" color="brand.800" isExternal>
                    Your Locks
                  </Link>
                </AlertDescription>
              </Alert>
            </Fade>
          )}
        </Box>
      </Box>
    </Box>
  );
}
