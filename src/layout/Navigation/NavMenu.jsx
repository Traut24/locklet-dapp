import { Box, Flex, HStack } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';

import { NavItem } from './NavItem';

const MobileNavMenu = (props) => {
  const { isOpen } = props;
  return (
    <Flex hidden={!isOpen} as="nav" direction="column" bg="blue.600" position="fixed" height="calc(100vh - 4rem)" top="16" insetX="0" zIndex={10} w="full">
      <Box px="4">
        <NavItem.Mobile active label="Locking" />
        <NavItem.Mobile label="About" href="https://t.me/locklet_finance"></NavItem.Mobile>
      </Box>
    </Flex>
  );
};

const DesktopNavMenu = (props) => {
  const location = useLocation();
  const { pathname } = location;

  return (
    <HStack
      spacing="3"
      flex="1"
      display={{
        base: 'none',
        lg: 'flex',
      }}
    >
      <NavItem.Desktop active={pathname == '/' || pathname == '/home'} label="Home" to="/home" />
      <NavItem.Desktop active={pathname.startsWith('/locks')} label="Locks" to="/locks" />
      <NavItem.Desktop label="About" to="https://t.me/locklet_finance" isExternal />
    </HStack>
  );
};

export const NavMenu = {
  Mobile: MobileNavMenu,
  Desktop: DesktopNavMenu,
};
