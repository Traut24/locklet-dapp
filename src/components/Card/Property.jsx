import { Box, Flex, Skeleton } from '@chakra-ui/react';
import { useMemo } from 'react';
import * as React from 'react';

export const Property = (props) => {
  const { label, value, ...flexProps } = props;

  return (
    <Flex
      as="dl"
      direction={{
        base: 'column',
        sm: 'row',
      }}
      px="6"
      py="4"
      _even={{
        bg: 'gray.50',
      }}
      {...flexProps}
    >
      <Box as="dt" minWidth="180px">
        {label}
      </Box>
      <Box as="dd" flex="1" fontWeight="semibold">
        <Skeleton rounded="md" width="150px" isLoaded={value !== undefined && value !== null}>
          {value ?? 'Loading...'}
        </Skeleton>
      </Box>
    </Flex>
  );
};
