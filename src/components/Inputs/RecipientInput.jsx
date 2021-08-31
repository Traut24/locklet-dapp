import { Box, Button, CloseButton, Input, InputGroup, InputRightElement } from '@chakra-ui/react';
import { useState } from 'react';
import { useActiveWeb3React } from 'src/hooks';
import { isAddress } from 'src/utils';

import AdvancedNumberInputField from './AdvancedNumberInputField';

export default function RecipientInput(props) {
  const { decimals, maxAsBN, isMeBtnDisabled, showCloseBtn, onChange, onClose } = props;

  const { account } = useActiveWeb3React();

  const [inputAddr, setInputAddr] = useState('');
  const [inputAmount, setInputAmount] = useState(0);

  const onRecipientChange = ({ addr, amountAsBN }) => {
    if (addr !== undefined) setInputAddr(addr);
    if (amountAsBN !== undefined) setInputAmount(amountAsBN);

    onChange({ addr: addr !== undefined ? addr : inputAddr, amountAsBN: amountAsBN !== undefined ? amountAsBN : inputAmount });
  };

  return (
    <Box border="1px" borderColor="gray.200" rounded="md" px="2" py="2" mb="2">
      <InputGroup size="md">
        <Input
          type="text"
          placeholder="0x0000000000000000000000000000000000000000"
          fontWeight="medium"
          isInvalid={inputAddr && !isAddress(inputAddr)}
          value={inputAddr}
          onChange={(e) => {
            onRecipientChange({ addr: e.target.value });
          }}
        />
        <InputRightElement width={!showCloseBtn ? '4.5rem' : '5.5rem'}>
          <Button
            h="1.75rem"
            size="sm"
            mr="2"
            colorScheme={account && inputAddr == account ? 'green' : undefined}
            onClick={() => onRecipientChange({ addr: account })}
            disabled={!account || isMeBtnDisabled}
          >
            Me
          </Button>
          {showCloseBtn && <CloseButton width="2rem" onClick={onClose} mr="1" />}
        </InputRightElement>
      </InputGroup>

      <Box mt="2">
        <AdvancedNumberInputField
          decimals={decimals}
          maxAsBN={maxAsBN}
          showPercent
          onChange={(v) => {
            onRecipientChange({ amountAsBN: v });
          }}
        />
      </Box>
    </Box>
  );
}
