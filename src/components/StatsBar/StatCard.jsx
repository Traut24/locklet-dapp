import { Box, Circle, Flex, Heading, HStack, Image, useColorModeValue as mode, Skeleton, Text } from '@chakra-ui/react';

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

  const direction = change?.direction;
  const isNegative = change?.percent < 0;

  return (
    <Box bg={'white'} px="6" py="4" shadow="base" rounded="lg">
      <HStack>
        <Circle bg={accentColor} color="white" rounded="full" size="6">
          {icon && <Box as={icon} />}
          {image && <Image src={image} />}
        </Circle>
        <Text fontWeight="medium" color="gray.500">
          {label}
        </Text>
      </HStack>

      <Heading as="h4" size="lg" my="3" fontWeight="semibold">
        <Skeleton rounded="md" width={!value && '100px'} isLoaded={value}>
          {currency}
          {format(value)}
        </Skeleton>
      </Heading>

      {change && (
        <Flex justify="space-between" align="center" fontWeight="medium" fontSize="sm">
          <Skeleton rounded="md" width={!change?.percent && '60px'} isLoaded={change?.percent}>
            <HStack spacing="0" color="gray.500">
              <Indicator type={direction ?? (isNegative ? 'down' : 'up')} />
              <Text>
                {/* direction == 'down' || isNegative ? '-' : '+' */}
                {change.percent}%
              </Text>
            </HStack>
          </Skeleton>
        </Flex>
      )}
    </Box>
  );
};
