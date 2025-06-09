import React from 'react';
import { Box, Flex, Heading, Link as ChakraLink, IconButton, Input, InputGroup, InputLeftElement, Stack, useDisclosure, Collapse, Icon, Text } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { HamburgerIcon, CloseIcon, SearchIcon } from '@chakra-ui/icons';
import { FaMobileAlt, FaTv, FaSnowflake, FaWind, FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';

const NavLink = ({ href, children, icon }) => (
  <ChakraLink
    as={RouterLink}
    to={href}
    px={3}
    py={2}
    rounded={'md'}
    _hover={{
      textDecoration: 'none',
      bg: 'gray.100',
      color: 'brand.primary'
    }}
    color="brand.textDark"
    fontWeight="medium"
    display="flex"
    alignItems="center"
  >
    {icon && <Icon as={icon} mr={2} />} 
    {children}
  </ChakraLink>
);

const Navbar = () => {
  const { isOpen, onToggle } = useDisclosure();
  const { cart } = useCart();
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  const navItems = [
    { label: 'Mobiles', href: '/category/mobiles', icon: FaMobileAlt },
    { label: 'TVs', href: '/category/tvs', icon: FaTv },
    { label: 'Fridges', href: '/category/fridges', icon: FaSnowflake },
    { label: 'ACs', href: '/category/ac', icon: FaWind },
  ];

  return (
    <Box bg="white" borderBottomWidth="1px" borderColor="brand.border" position="sticky" top={0} zIndex="sticky">
      <Flex
        className="container" // Assuming .container provides max-width from global styles
        mx="auto"
        h={{ base: 'auto', md: '70px' }}
        py={{ base: 2, md: 0 }}
        px={{ base: 4 }}
        align={'center'}
        justify={'space-between'}
        flexWrap="wrap"
      >
        <Flex align={'center'}>
          <ChakraLink as={RouterLink} to="/">
            <Heading as="h1" size="lg" fontFamily="brand.secondary" color="brand.primary">
              RefurbishMarket
            </Heading>
          </ChakraLink>
        </Flex>

        <Flex display={{ base: 'none', md: 'flex' }} align={'center'} ml={10}>
          <Stack direction={'row'} spacing={4}>
            {navItems.map((navItem) => (
              <NavLink key={navItem.label} href={navItem.href} icon={navItem.icon}>
                {navItem.label}
              </NavLink>
            ))}
          </Stack>
        </Flex>

        <Flex alignItems={'center'} ml={{ base: 0, md: 'auto' }} mt={{ base: 2, md: 0 }}>
          <InputGroup size="md" maxW={{ base: 'full', md: '250px' }} mr={4}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input 
              type="text" 
              placeholder="Search products... (Ctrl+K)" 
              borderRadius="full" 
              borderColor="brand.border" 
              _focus={{ 
                borderColor: 'brand.primary', 
                ring: 1, 
                ringColor: 'brand.primary' 
              }} 
            />
          </InputGroup>
          <ChakraLink 
            as={RouterLink} 
            to="/cart" 
            position="relative" 
            mr={4} 
            p={2} 
            aria-label="View shopping cart"
          >
            <Icon as={FaShoppingCart} w={6} h={6} color="brand.textDark" _hover={{ color: 'brand.primary' }}/>
            {cartItemCount > 0 && (
              <Box
                as="span"
                position="absolute"
                top="-1px"
                right="-1px"
                fontSize="xs"
                fontWeight="bold"
                color="white"
                bg="brand.accent"
                borderRadius="full"
                px={2}
                py={0.5}
                lineHeight="tight"
              >
                {cartItemCount}
              </Box>
            )}
          </ChakraLink>

          <IconButton
            size={'md'}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label="Open Menu"
            display={{ md: 'none' }}
            onClick={onToggle}
            variant="ghost"
          />
        </Flex>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <Box pb={4} display={{ md: 'none' }} borderTopWidth="1px" borderColor="brand.border" bg="white">
          <Stack as={'nav'} spacing={4} p={4}>
            {navItems.map((navItem) => (
              <NavLink key={navItem.label} href={navItem.href} icon={navItem.icon}>
                {navItem.label}
              </NavLink>
            ))}
             <ChakraLink as={RouterLink} to="/cart" fontWeight="medium" display="flex" alignItems="center" p={2} rounded="md" _hover={{bg: 'gray.100'}}>
                <Icon as={FaShoppingCart} mr={2} /> My Cart
                {cartItemCount > 0 && <Text ml={2} bg="brand.accent" color="white" borderRadius="full" px={2} fontSize="sm">{cartItemCount}</Text>}
            </ChakraLink>
          </Stack>
        </Box>
      </Collapse>
    </Box>
  );
};

export default Navbar;
