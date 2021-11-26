import { useMemo } from 'react';
import { PROVIDERS } from 'src/constants';

import { useActiveUnifiedWeb3 } from './useUnifiedWeb3';

export function useActiveUnifiedWeb3Discriminator() {
  const { type } = useActiveUnifiedWeb3();

  const isEvm = useMemo(() => {
    return type == PROVIDERS.EVM
  }, [type]);

  const isTron = useMemo(() => {
    return type == PROVIDERS.TRON
  }, [type]);

  return { isEvm , isTron };
}
