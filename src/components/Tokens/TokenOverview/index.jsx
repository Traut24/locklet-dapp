import { Skeleton } from '@chakra-ui/react'
import { formatUnits } from 'ethers/lib/utils';
import numeral from 'numeral'
import { useMemo } from 'react';
import { Card } from 'src/components/Card';
import { CardContent } from 'src/components/Card/CardContent';
import { CardHeader } from 'src/components/Card/CardHeader';
import { Property } from 'src/components/Card/Property';

export default function TokenOverview(props) {
  const { tokenInfos, totalLocked = 0 } = props;

  const totalSupply = useMemo(() => {
    if (!tokenInfos) return null;
    return formatUnits(tokenInfos?.tokenTotalSupply, tokenInfos?.tokenDecimals);
  }, [tokenInfos])

  const totalLockedPercent = useMemo(() => {
    if (!totalSupply || !totalLocked) return 0;
    return ((totalSupply - totalLocked) / totalSupply) * 100
  }, [totalSupply, totalLocked]);

  return (
    <Card>
      <CardHeader title="Overview" />
      <CardContent>
        <Property label="Name" value={tokenInfos?.tokenName} />
        <Property label="Symbol" value={tokenInfos?.tokenSymbol} />
        <Property label="Decimals" value={tokenInfos?.tokenDecimals} />
        <Property label="Total Supply" value={totalSupply ? numeral(totalSupply).format('0,0') : null} />
        <Property label="Total Locked" value={<>{totalLocked} <small>({totalLockedPercent}%)</small></>} />
      </CardContent>
    </Card>
  );
}
