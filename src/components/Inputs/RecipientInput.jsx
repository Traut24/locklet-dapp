import { Box, Button, CloseButton, Input, InputGroup, InputRightElement } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { useActiveWeb3React } from 'src/hooks';
import { useActiveUnifiedWeb3 } from 'src/hooks/useUnifiedWeb3';
import { useActiveUnifiedWeb3Discriminator } from 'src/hooks/useWeb3Discriminator';
import { isAddress } from 'src/utils';

import AdvancedNumberInputField from './AdvancedNumberInputField';

export default function RecipientInput(props) {
  const { decimals, maxAsBN, isMeBtnDisabled, showCloseBtn, onChange, onClose } = props;

  const { account } = useActiveUnifiedWeb3();
  const { isEvm, isTron } = useActiveUnifiedWeb3Discriminator();

  const [inputAddr, setInputAddr] = useState('');
  const [inputAmount, setInputAmount] = useState(0);

  const onRecipientChange = ({ addr, amountAsBN }) => {
    if (addr !== undefined) setInputAddr(addr);
    if (amountAsBN !== undefined) setInputAmount(amountAsBN);

    onChange({ addr: addr !== undefined ? addr : inputAddr, amountAsBN: amountAsBN !== undefined ? amountAsBN : inputAmount });
  };

  const placeholder = useMemo(() => {
    if  (isEvm) return '0x0000000000000000000000000000000000000000';
    else if (isTron) return 'TS6nFnvphgLp8nZfwYqoeumvGZZRAyjk8F';
  }, [isEvm, isTron]);

  const isInvalid = useMemo(() => {
    if (isEvm) return inputAddr && !isAddress(inputAddr);
    else if (isTron) return inputAddr && inputAddr.length != 34;
  }, [isEvm, isTron, inputAddr]);

  return (
    <Box border="1px" borderColor="gray.200" rounded="md" px="2" py="2" mb="2">
      <InputGroup size="md">
        <Input
          type="text"
          placeholder={placeholder}
          fontWeight="medium"
          isInvalid={isInvalid}
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
