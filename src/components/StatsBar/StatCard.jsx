import { Box, Circle, Flex, Heading, HStack, Image, useColorModeValue as mode, Text } from '@chakra-ui/react';

import { Indicator } from './Indicator';

function format(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    currency: 'USD',
  }).format(value);
}

export const StatCard = (props) => {
  const { data, accentColor, icon, image } = props;
  const { label, currency, value, change } = data;
  const isNegative = change?.percent < 0;

  return (
    <Box bg={'white'} px="6" py="4" shadow="base" rounded="lg">
      <HStack>
        <Circle bg={accentColor} color="white" rounded="full" size="6">
          {icon && <Box as={icon} />}
          {image && <Image src={image} />}
        </Circle>
        <Text fontWeight="medium" color={mode('gray.500', 'gray.400')}>
          {label}
        </Text>
      </HStack>

      <Heading as="h4" size="lg" my="3" fontWeight="extrabold">
        {currency}
        {format(value)}
      </Heading>
      {change && (
        <Flex justify="space-between" align="center" fontWeight="medium" fontSize="sm">
          <HStack spacing="0" color={mode('gray.500', 'gray.400')}>
            <Indicator type={isNegative ? 'down' : 'up'} />
            <Text>
              {currency}
              {format(change.value)} ({isNegative ? '' : '+'}
              {change.percent}%)
            </Text>
          </HStack>
        </Flex>
      )}
    </Box>
  );
};
