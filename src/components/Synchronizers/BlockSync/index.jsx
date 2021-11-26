import { useInterval } from '@chakra-ui/hooks';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useActiveWeb3React } from 'src/hooks';
import useDebounce from 'src/hooks/useDebounce';
import useIsWindowVisible from 'src/hooks/useIsWindowVisible';
import { useActiveUnifiedWeb3 } from 'src/hooks/useUnifiedWeb3';
import { useActiveUnifiedWeb3Discriminator } from 'src/hooks/useWeb3Discriminator';
import { SET_BLOCK_NUMBER } from 'src/store';

export default function BlockSync() {
  const { library, chainId } = useActiveUnifiedWeb3();
  const { isEvm, isTron } = useActiveUnifiedWeb3Discriminator();

  const dispatch = useDispatch();

  const windowVisible = useIsWindowVisible();

  const [state, setState] = useState({
    chainId,
    blockNumber: null,
  });

  const blockNumberCallback = useCallback(
    (blockNumber) => {
      setState((state) => {
        if (chainId === state.chainId) {
          if (typeof state.blockNumber !== 'number') return { chainId, blockNumber };
          return { chainId, blockNumber: Math.max(blockNumber, state.blockNumber) };
        }
        return state;
      });
    },
    [chainId, setState]
  );

  // evm logic, attach/detach listeners
  useEffect(() => {
    if (!isEvm || !library || !chainId || !windowVisible) return undefined;

    setState({ chainId, blockNumber: null });

    library
      .getBlockNumber()
      .then(blockNumberCallback)
      .catch((error) => console.error(`Failed to get block number for chainId: ${chainId}`, error));

    library.on('block', blockNumberCallback);
    return () => {
      library.removeListener('block', blockNumberCallback);
    };
  }, [dispatch, isEvm, chainId, library, blockNumberCallback, windowVisible]);

  // tron logic, pool blocks
  useEffect(() => {
    if (!isTron || !library || !chainId || !windowVisible) return undefined;

    setState({ chainId, blockNumber: null });

    const refreshBlockNumber = () => {
      library
        .trx
        .getCurrentBlock()
        .then((res) => blockNumberCallback(res?.block_header?.raw_data?.number ?? -1))
        .catch((error) => console.error(`Failed to get block number for chainId: ${chainId}`, error));
    };

    refreshBlockNumber();

    setInterval(refreshBlockNumber, 6000);
    return () => {
      clearInterval(refreshBlockNumber);
    }

  }, [dispatch, isTron, chainId, library, blockNumberCallback, windowVisible]);

  const debouncedState = useDebounce(state, 100);

  useEffect(() => {
    if (!debouncedState.chainId || !debouncedState.blockNumber || !windowVisible) return;
    dispatch({ type: SET_BLOCK_NUMBER, chainId: debouncedState.chainId, blockNumber: debouncedState.blockNumber });
  }, [windowVisible, dispatch, debouncedState.blockNumber, debouncedState.chainId]);

  return null;
}
