import { SimpleGrid } from '@chakra-ui/react';
import { FaDollarSign, FaUsers } from 'react-icons/fa';
import LktLogo from 'src/assets/images/favicon.png';

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
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing="6">
      {data.map((stat, index) => {
        const { icon, image, color: accentColor } = illustrations[stat.id];
        return <StatCard icon={icon} accentColor={accentColor} image={image} key={index} data={stat} />;
      })}
    </SimpleGrid>
  );
}
