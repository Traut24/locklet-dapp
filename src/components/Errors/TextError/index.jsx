import { WarningTwoIcon } from '@chakra-ui/icons';
import { Center, Heading } from '@chakra-ui/react';

export default function TextError({ text = 'An error has occurred', iconSize = 6, ...props }) {
  return (
    <Center {...props}>
      <Heading size="md" fontWeight="normal" mr="2">
        {text}
      </Heading>
      <WarningTwoIcon w={iconSize} h={iconSize} />
    </Center>
  );
}
