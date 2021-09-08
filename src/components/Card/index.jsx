import { Box } from '@chakra-ui/react';
import * as React from 'react';

export const Card = (props) => (
  <Box
    bg="white"
    rounded={{
      md: 'lg',
    }}
    shadow="base"
    overflow="hidden"
    {...props}
  />
);
