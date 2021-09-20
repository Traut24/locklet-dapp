import { Button, HStack, Image } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BscLogo from 'src/assets/images/networks/bsc.png';
import EthLogo from 'src/assets/images/networks/eth.png';
import { SET_NETWORK } from 'src/store';
import styled from 'styled-components';

const DropDownContainer = styled('div')`
  margin: 0 auto;
  transition: all 10s ease;
`;

const DropDownListContainer = styled('div')`
  position: absolute;
  z-index: 100;
  width: 200px;
  margin-top: 4px;
`;

const DropDownList = styled('ul')`
  padding: 0;
  margin: 0;
  padding-left: 1em;
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: var(--chakra-radii-md);
  box-sizing: border-box;
  color: black;
  font-size: var(--chakra-fontSizes-sm);
  font-weight: var(--chakra-fontWeights-semibold);
  &:first-child {
    padding-top: 0.8em;
  }
`;

const ListItem = styled('li')`
  list-style: none;
  margin-bottom: 0.8em;
  cursor: pointer;
`;

export const NETWORK_VALUES = ['eth', 'bsc'];
export const NETWORK_LABELS = ['Ethereum', 'Binance Smart Chain']

const options = [
  {
    value: NETWORK_VALUES[0],
    label: NETWORK_LABELS[0],
    icon: EthLogo,
    bgColor: '#bac1ff',
  },
  {
    value: NETWORK_VALUES[1],
    label: 'Binance Smart Chain',
    icon: BscLogo,
    bgColor: 'orange.100',
  },
];

export default function NetworkSelector() {
  // app state
  const dispatch = useDispatch();

  const appNetwork = useSelector((state) => state.app.network);

  useEffect(() => {
    const selectedOption = options.find(x => x.value == appNetwork);
    setSelectedOption(selectedOption);
  }, [appNetwork])

  // component state
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(appNetwork ?? options[0]);

  const toggling = () => setIsOpen(!isOpen);

  const onOptionClicked = (option) => () => {
    if (option.value !== selectedOption.value) dispatch({ type: SET_NETWORK, network: option.value });
    setIsOpen(false);
  };

  return (
    <DropDownContainer>
      <Button onClick={toggling} colorScheme="gray" background={selectedOption.bgColor} variant="solid" color="blackAlpha.900" size="sm">
        <Image src={selectedOption.icon} alt={`${selectedOption.label} Logo`} boxSize="18px" mr="2" />
        {selectedOption.label}
      </Button>
      {isOpen && (
        <DropDownListContainer>
          <DropDownList>
            {options.map((option) => (
              <ListItem onClick={onOptionClicked(option)} key={option.value}>
                <HStack pr="2">
                  <Image src={option.icon} alt={`${option.label} Logo`} boxSize="22px" mr="1" />
                  <span>{option.label}</span>
                </HStack>
              </ListItem>
            ))}
          </DropDownList>
        </DropDownListContainer>
      )}
    </DropDownContainer>
  );
}
