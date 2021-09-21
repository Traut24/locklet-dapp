import { Skeleton } from '@chakra-ui/react'
import { formatUnits } from 'ethers/lib/utils';
import numeral from 'numeral'
import { useEffect, useMemo, useState } from 'react';
import { Card } from 'src/components/Card';
import { CardContent } from 'src/components/Card/CardContent';
import { CardHeader } from 'src/components/Card/CardHeader';
import { Property } from 'src/components/Card/Property';
import { useActiveWeb3React } from 'src/hooks';
import { getTokenLocksByTokenAddr } from 'src/services/lockletApi';

export default function TokenOverview(props) {
  // app state
  const { chainId } = useActiveWeb3React();

  // props
  const { tokenInfos } = props;

  // component state
  const [tokenLocksByTokenAddr, setTokenLocksByTokenAddr] = useState([]);

  const refreshTokenLocksByTokenAddr = async () => {
    let _tokenLocksByTokenAddr = [];

    try {
      const { data: tokensLocksData } = await getTokenLocksByTokenAddr(chainId, tokenInfos?.tokenAddress);
      if (tokensLocksData) _tokenLocksByTokenAddr = tokensLocksData;
    } catch (err) {
      console.error(err);
    } finally {
      setTokenLocksByTokenAddr(_tokenLocksByTokenAddr);
    }
  };

  useEffect(() => {
    if (tokenInfos && tokenInfos?.tokenAddress) refreshTokenLocksByTokenAddr();
  }, [tokenInfos])

  const totalLocked = useMemo(() => {
    if (!tokenLocksByTokenAddr) return null;

    return tokenLocksByTokenAddr.filter(x => x.isActive && !x.isRevoked && new Date(x.startTime) > new Date()).reduce((a, b) => {
      const _a = tokenLocksByTokenAddr[a];
      const _b = tokenLocksByTokenAddr[b];

      let _res = 0;
      if (_a !== undefined) _res = formatUnits(_a.totalAmount, _a.tokenDecimals);
      if (_b !== undefined) _res += formatUnits(_b.totalAmount, _b.tokenDecimals);

      return _res;
    }, 0);
  }, [tokenLocksByTokenAddr])

  const totalSupply = useMemo(() => {
    if (!tokenInfos) return null;
    return formatUnits(tokenInfos?.tokenTotalSupply, tokenInfos?.tokenDecimals);
  }, [tokenInfos])

  const totalLockedPercent = useMemo(() => {
    if (!totalSupply || !totalLocked) return 0;
    return (100 * totalLocked) / totalSupply
  }, [totalSupply, totalLocked]);

  return (
    <Card>
      <CardHeader title="Overview" />
      <CardContent>
        <Property label="Name" value={tokenInfos?.tokenName} />
        <Property label="Symbol" value={tokenInfos?.tokenSymbol} />
        <Property label="Decimals" value={tokenInfos?.tokenDecimals} />
        <Property label="Total Supply" value={totalSupply ? numeral(totalSupply).format('0,0') : null} />
        <Property label="Total Locked" value={
          totalLocked !== null ? (
            <>{numeral(totalLocked).format('0,0')} <small>({totalLockedPercent?.toFixed(2)}%)</small></>
          ) : null
        } />
      </CardContent>
    </Card>
  );
}
