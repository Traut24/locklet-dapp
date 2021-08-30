import { SimpleGrid } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { FaDollarSign, FaUsers } from 'react-icons/fa';
import LktLogo from 'src/assets/images/favicon.png';
import { getChainsStats, getMarketStats } from 'src/services/lockletApi';

import { StatCard } from './StatCard';

export const illustrations = {
  TVL: {
    icon: FaDollarSign,
    color: 'gray.500',
  },
  LKT: {
    image: LktLogo,
  },
  HODL: {
    icon: FaUsers,
    color: 'gray.500',
  },
};

export const data = [
  {
    id: 'TVL',
    label: 'Total Value Locked',
    value: 5604.16,
    currency: '$',
  },
  {
    id: 'LKT',
    label: 'Locklet Token',
    value: 391.59,
    change: {
      value: 30.98,
      percent: +1.84,
    },
    currency: '$',
  },
  {
    id: 'HODL',
    label: 'Holders',
    value: 177,
    change: {
      value: 12,
      percent: -0.72,
    },
  },
];

export default function Stats(props) {
  const [marketStats, setMarketStats] = useState(null);
  const [chainsStats, setChainsStats] = useState(null);

  const refreshStats = async () => {
    const { data: marketStatsData } = await getMarketStats();
    const { data: chainsStatsData } = await getChainsStats();

    if (marketStatsData) setMarketStats(marketStatsData);
    if (chainsStatsData) setChainsStats(chainsStatsData);
  };

  useEffect(() => {
    refreshStats();
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
          },
          currency: '$',
        }}
      />
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
