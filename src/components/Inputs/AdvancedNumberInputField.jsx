import { Button, HStack, Input, InputGroup, InputRightAddon, InputRightElement, Text } from '@chakra-ui/react';
import { BigNumber } from '@ethersproject/bignumber';
import { formatUnits } from '@ethersproject/units';
import { BigNumberInput } from 'big-number-input';
import { useState } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';

export default function AdvancedNumberInputField(props) {
  const { decimals, maxAsBN = BigNumber.from(0), showMaxBtn, showPercent, onChange } = props;

  const [inputValueAsBNString, _setInputValue] = useState('0');
  const percentAsBN = maxAsBN.gt(BigNumber.from(0)) ? maxAsBN.div(100) : null;

  const calcPercentage = (valueAsBNString) => {
    if (!valueAsBNString || maxAsBN.eq(BigNumber.from(0))) {
      setPercentage(0);
      return;
    }

    let percentage = BigNumber.from(valueAsBNString).div(percentAsBN);
    setPercentage(percentage);
  };

  const [percentage, setPercentage] = useState(BigNumber.from(0));

  const setInputValue = (valueAsBNString) => {
    if (!valueAsBNString) valueAsBNString = 0;

    const valueAsBN = BigNumber.from(valueAsBNString);
    if (valueAsBN.gt(maxAsBN)) valueAsBNString = maxAsBN.toString();
    if (valueAsBN.lt(BigNumber.from(0))) valueAsBNString = 0;

    _setInputValue(valueAsBNString);

    if (showPercent) calcPercentage(valueAsBNString);
    if (onChange) onChange(BigNumber.from(valueAsBNString));
  };

  const incPercent = () => {
    setInputValue(BigNumber.from(inputValueAsBNString).add(percentAsBN).toString());
  };

  const decPercent = () => {
    setInputValue(BigNumber.from(inputValueAsBNString).sub(percentAsBN).toString());
  };

  return (
    <HStack>
      <InputGroup>
        <BigNumberInput
          decimals={decimals}
          value={inputValueAsBNString}
          min={0}
          max={maxAsBN.toString()}
          onChange={setInputValue}
          renderInput={(props) => <Input {...props} borderTopRightRadius={showPercent && 'none'} borderBottomRadius={showPercent && 'none'} />}
        />
        {showMaxBtn && (
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={() => setInputValue(maxAsBN.toString())}>
              Max
            </Button>
          </InputRightElement>
        )}
        {showPercent && <InputRightAddon children={<Text fontWeight="hairline">{percentage.toString()} %</Text>} />}
      </InputGroup>
      {showPercent && (
        <>
          <Button onClick={decPercent} disabled={inputValueAsBNString == 0}>
            <FaMinus size={10} />
          </Button>
          <Button onClick={incPercent} disabled={inputValueAsBNString == maxAsBN.toString()}>
            <FaPlus size={10} />
          </Button>
        </>
      )}
    </HStack>
  );
}
