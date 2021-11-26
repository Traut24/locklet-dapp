import { SimpleGrid } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { FaUsers } from 'react-icons/fa';
import LktLogo from 'src/assets/images/favicon.png';
import { getChainsStats, getMarketStats } from 'src/services/lockletApi';

import { StatCard } from './StatCard';

export default function StatsBar() {
  const [isMounted, setIsMounted] = useState(false);

  const [marketStats, setMarketStats] = useState(null);
  const [chainsStats, setChainsStats] = useState(null);

  const refreshStats = async () => {
    const { data: marketStatsData } = await getMarketStats();
    const { data: chainsStatsData } = await getChainsStats();

    if (!isMounted) return;

    if (marketStatsData) setMarketStats(marketStatsData);
    if (chainsStatsData) setChainsStats(chainsStatsData);
  };

  useEffect(() => {
    setIsMounted(true);
    refreshStats();
    return () => setIsMounted(false);
  }, []);

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 2 }} spacing="6">
      {/* TVL */}
      {/*
          <StatCard
            icon={FaDollarSign}
            accentColor="gray.500"
            data={{
              label: 'Total Value Locked',
              value: 0,
              currency: '$',
            }}
          />
          */}
      {/* Locklet Token */}
      <StatCard
        image={LktLogo}
        data={{
          label: 'Locklet Token',
          value: marketStats?.price ?? null,
          change: {
            percent: marketStats?.price_change_percentage_24h?.value ?? null,
            direction: marketStats?.price_change_percentage_24h?.direction ?? null,
          },
          currency: '$',
        }}
      />
      {/* Total Holders */}
      <StatCard
        icon={FaUsers}
        accentColor="gray.500"
        data={{
          label: 'Total Holders',
          value: chainsStats?._agg?.holders,
        }}
      />
    </SimpleGrid>
  );
}
