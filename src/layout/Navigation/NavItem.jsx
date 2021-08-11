import { Box, HStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const DesktopNavItem = (props) => {
  const { icon, label, to = '/', active, isExternal } = props;
  return (
    <HStack
      as={!isExternal ? Link : 'a'}
      to={!isExternal ? to : undefined}
      href={isExternal ? to : undefined}
      target={isExternal && '_blank'}
      aria-current={active ? 'page' : undefined}
      spacing="2"
      px="3"
      py="2"
      rounded="md"
      transition="all 0.2s"
      color="black"
      _hover={{
        bg: 'blackAlpha.200',
      }}
      _activeLink={{
        bgGradient: 'linear(to-r, #b2f44e, #71e6f5)',
        color: 'black',
      }}
    >
      {icon && (
        <Box aria-hidden fontSize="md">
          {icon}
        </Box>
      )}
      <Box fontWeight="semibold">{label}</Box>
    </HStack>
  );
};

const MobileNavItem = (props) => {
  const { label, href = '#', active } = props;
  return (
    <Link
      as="a"
      display="block"
      href={href}
      target="_blank"
      px="3"
      py="3"
      rounded="md"
      fontWeight="semibold"
      aria-current={active ? 'page' : undefined}
      _hover={{
        bg: 'whiteAlpha.200',
      }}
      _activeLink={{
        bg: 'blackAlpha.300',
        color: 'white',
      }}
    >
      {label}
    </Link>
  );
};

export const NavItem = {
  Desktop: DesktopNavItem,
  Mobile: MobileNavItem,
};
