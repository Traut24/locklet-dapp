import { useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { usePendingTransactions } from 'src/hooks/transactions';
import { useBlockNumber } from 'src/hooks/useBlockNumber';
import { useActiveUnifiedWeb3 } from 'src/hooks/useUnifiedWeb3';
import { CHECKED_TRANSACTION, FINALIZE_TRANSACTION } from 'src/store';

export function shouldCheck(lastBlockNumber, tx) {
  if (tx.receipt) return false;
  if (!tx.lastCheckedBlockNumber) return true;
  const blocksSinceCheck = lastBlockNumber - tx.lastCheckedBlockNumber;
  if (blocksSinceCheck < 1) return false;
  const minutesPending = (new Date().getTime() - tx.addedTime) / 1000 / 60;
  if (minutesPending > 60) {
    // every 10 blocks if pending for longer than an hour
    return blocksSinceCheck > 9;
  } else if (minutesPending > 5) {
    // every 3 blocks if pending more than 5 minutes
    return blocksSinceCheck > 2;
  } else {
    // otherwise every block
    return true;
  }
}

export default function TransactionSync() {
  const { chainId, library } = useActiveUnifiedWeb3();

  const lastBlockNumber = useBlockNumber();

  const dispatch = useDispatch();
  const state = useSelector((state) => state.transactions);

  const transactions = useMemo(() => {
    return state && chainId ? state[chainId] ?? {} : {};
  }, [chainId, state]);
  
  useEffect(() => {
    if (!chainId || !library || !lastBlockNumber) return;

    Object.keys(transactions)
      .filter((hash) => shouldCheck(lastBlockNumber, transactions[hash]))
      .forEach((hash) => {
        if (hash.startsWith('0x')) checkEthereum(hash, library, chainId, lastBlockNumber, transactions, dispatch);
        else checkTron(hash, library, chainId, lastBlockNumber, transactions, dispatch);
      });
  }, [chainId, library, transactions, lastBlockNumber, dispatch]);

  const pendingTransactions = usePendingTransactions();

  useEffect(() => {
    if (!pendingTransactions) return;

    const pendingTransactionsKeys = Object.keys(pendingTransactions);
    pendingTransactionsKeys.forEach((pendingTxHash) => {
      const pendingTx = pendingTransactions[pendingTxHash];

      const now = new Date().getTime();
      if (pendingTx.addedTime <= new Date(now + 86400 * 1000)) toast.loading('Your transaction is being confirmed...', { id: pendingTx.hash });
    });
  }, [chainId]);

  return null;
}

function checkEthereum(hash, library, chainId, lastBlockNumber, transactions, dispatch) {
  library
    .getTransactionReceipt(hash)
    .then((receipt) => {
      if (receipt) {
        dispatch({
          type: FINALIZE_TRANSACTION,
          chainId,
          hash,
          receipt: {
            blockHash: receipt.blockHash,
            blockNumber: receipt.blockNumber,
            contractAddress: receipt.contractAddress,
            from: receipt.from,
            status: receipt.status,
            to: receipt.to,
            transactionHash: receipt.transactionHash,
            transactionIndex: receipt.transactionIndex,
          },
        });

        const tx = transactions[hash];
        if (tx?.status === 1 || tx?.status === undefined) toast.success('Your transaction was successful', { id: hash });
        else toast.error('An error occurred during your transaction', { id: hash });
      } else {
        dispatch({ type: CHECKED_TRANSACTION, chainId, hash, blockNumber: lastBlockNumber });
      }
    })
    .catch((error) => {
      console.error(`failed to check transaction hash: ${hash}`, error);
    });
}

function checkTron(hash, library, chainId, lastBlockNumber, transactions, dispatch) {
  library
    .trx
    .getTransactionInfo(hash)
    .then((txInfo) => {
      if (Object.keys(txInfo).length > 0) {
        dispatch({
          type: FINALIZE_TRANSACTION,
          chainId,
          hash,
          receipt: {
            blockNumber: txInfo.blockNumber,
            contractAddress: txInfo.contract_address,
            status: txInfo.receipt.result,
            transactionHash: txInfo.id
          },
        });

        const tx = transactions[hash];
        if (tx?.receipt?.status === "SUCCESS") toast.success('Your transaction was successful', { id: hash });
        else toast.error('An error occurred during your transaction', { id: hash });
      } else {
        dispatch({ type: CHECKED_TRANSACTION, chainId, hash, blockNumber: lastBlockNumber });
      }
    })
    .catch((error) => {
      console.error(`failed to check transaction hash: ${hash}`, error);
    });
}