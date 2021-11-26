import { CheckIcon, WarningIcon } from '@chakra-ui/icons';
import { Alert, AlertDescription, AlertIcon, AlertTitle, Box, Button, ButtonGroup, Center, Circle, CircularProgress, Collapse, Divider, Fade, Flex, FormControl, FormHelperText, FormLabel, HStack, Image, Input, InputGroup, InputLeftElement, InputRightElement, Link, Spacer, Stack, Switch, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from '@chakra-ui/react';
import { BigNumber } from '@ethersproject/bignumber';
import { MaxUint256 } from '@ethersproject/constants';
import { formatUnits } from '@ethersproject/units';
import capitalize from 'capitalize-sentence';
import ERC20 from 'contracts/ERC20.json';
import * as React from 'react';
import { useMemo } from 'react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaExclamationTriangle, FaFileContract, FaPlusCircle } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import DatePicker from 'src/components/DatePicker';
import AdvancedNumberInputField from 'src/components/Inputs/AdvancedNumberInputField';
import RecipientInput from 'src/components/Inputs/RecipientInput';
import { LKT_TOKEN, LKT_TOKEN_TRON, TOKEN_VAULT, TOKEN_VAULT_TRON } from 'src/constants';
import { useActiveWeb3React } from 'src/hooks';
import { useTransactionAdder } from 'src/hooks/transactions';
import { useTokenContract, useTokenVaultContract } from 'src/hooks/useContract';
import { useToggleModal } from 'src/hooks/useToggleModal';
import useTokensMetadata from 'src/hooks/useTokensMetadata';
import { useActiveUnifiedWeb3 } from 'src/hooks/useUnifiedWeb3';
import { daysBetween, getContract, getExplorerLink, isAddress } from 'src/utils';
import { waitTx } from 'src/utils/tron-helper';

export const refreshTokenVaultFeesTron = async (tokenVault, setFlatFeeLktAmount, setPercentFeeAsBN) => {
  const creationFlatFeeLktAmountAsBN = await tokenVault.getCreationFlatFeeLktAmount().call();
  const creationFlatFeeLktAmount = parseFloat(formatUnits(creationFlatFeeLktAmountAsBN, 18));
  setFlatFeeLktAmount(creationFlatFeeLktAmount);

  console.log('creationFlatFeeLktAmount', creationFlatFeeLktAmount)

  const creationPercentFeeAsBN = await tokenVault.getCreationPercentFee().call();
  setPercentFeeAsBN(creationPercentFeeAsBN);

  console.log('creationPercentFeeAsBN', creationPercentFeeAsBN)
};

export const refreshLktAllowanceTron = async (account, lktToken, tokenVault, setLktAllowanceAsBN) => {
  console.log('tokenVault', tokenVault)
  const allowanceAsBN = await lktToken.allowance(account, tokenVault.address).call();
  setLktAllowanceAsBN(allowanceAsBN);

  console.log('allowanceAsBN', allowanceAsBN)
};

export const refreshTokenDataTron = async (token, setSelectedTokenData) => {
  const name = await token.name().call();
  const symbol = await token.symbol().call();
  const decimals = await token.decimals().call();

  const tokenData = { name, symbol, decimals };
  setSelectedTokenData(tokenData);
};

export const refreshTokenAllowanceTron = async (account, token, tokenVault, setSelectedTokenAllowanceAsBN) => {
  const allowanceAsBN = await token.allowance(account, tokenVault.address).call();
  setSelectedTokenAllowanceAsBN(allowanceAsBN);
};

export const refreshTokenBalanceTron = async (account, token, setTokenBalanceAsBN) => {
  const balanceOfAsBN = await token.balanceOf(account).call();
  setTokenBalanceAsBN(balanceOfAsBN);
};

// approve logic
export const approveTron = async (library, account, needToApproveLkt, needToApproveToken, selectedTokenData, lktToken, tokenVault, addTx, setIsAllowanceLoading, setLktAllowanceAsBN, setSelectedTokenAllowanceAsBN) => {
  try {
    setIsAllowanceLoading(true);

    if (needToApproveLkt) {
      const approveLktTxId = await lktToken.approve(tokenVault.address, MaxUint256).send();

      toast.loading('Your transaction is being confirmed...', { id: approveLktTxId });
      addTx({ hash: approveLktTxId });

      const approveResult = await waitTx(library, approveLktTxId);

      if (approveResult?.receipt?.result === 'SUCCESS') {
        refreshLktAllowanceTron(account, lktToken, tokenVault, setLktAllowanceAsBN);
        if (selectedTokenData.symbol == 'LKT') refreshTokenAllowanceTron(account, lktToken, tokenVault, setSelectedTokenAllowanceAsBN);
      }
    } else if (needToApproveToken) {
      const approveTokenTxId = await token.approve(tokenVault.address, MaxUint256).send();

      toast.loading('Your transaction is being confirmed...', { id: approveTokenTxId });
      addTx({ hash: approveTokenTxId });

      const approveResult = await waitTx(library, approveLktTxId);

      if (approveResult?.receipt?.result === 'SUCCESS') {
        if (selectedTokenData.symbol == 'LKT') refreshTokenAllowanceTron(account, lktToken, tokenVault, setSelectedTokenAllowanceAsBN);
      }
    }
  } catch (err) {
    console.error(err);
    if (err?.error?.message || err?.message || err?.reason) toast.error(capitalize(err?.error?.message || err?.message || err?.reason));
  } finally {
    setIsAllowanceLoading(false);
  }
};

 // lock logic
 const lockTron = async (
    library,
      tokenAddr, totalLockAmountAsBN,
        todayDate, startDate, lStartDate, lEndDate,
          lockMode, recipients, payFeeWithLKT, revocable,
              tokenVault, addTx, setIsLockLoading, setLockTxHash, setIsSuccess) => {
  try {
    setIsLockLoading(true);

    const lockRecipients = recipients.map((x) => ({
      recipientAddress: x.addr,
      amount: x.amountAsBN,
    }));

    let lockTxId = null;
    switch (lockMode) {
      case 'Date':
        const dCliffInDays = daysBetween(todayDate, startDate);
        lockTxId = await tokenVault.addLock(tokenAddr, totalLockAmountAsBN, dCliffInDays, 1, lockRecipients, false, payFeeWithLKT).send();
        break;

      case 'Linearly':
        const lCliffInDays = daysBetween(todayDate, lStartDate);
        const durationInDays = daysBetween(lStartDate, lEndDate);
        lockTxId = await tokenVault.addLock(tokenAddr, totalLockAmountAsBN, lCliffInDays, durationInDays, lockRecipients, revocable, payFeeWithLKT).send();
        break;
    }

    toast.loading('Your transaction is being confirmed...', { id: lockTxId });
    setLockTxHash(lockTxId);
    addTx({ hash: lockTxId });

    const lockResult = await waitTx(library, approveLktTxId);

    if (lockResult?.receipt?.result === 'SUCCESS') {
      setIsSuccess(true);
    }
  } catch (err) {
    console.error(err);
    if (err?.error?.message || err?.message || err?.reason) toast.error(capitalize(err?.error?.message || err?.message || err?.reason));
  } finally {
    setIsLockLoading(false);
  }
};
