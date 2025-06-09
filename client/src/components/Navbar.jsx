import React from 'react';
import { Box, Flex, Heading, Link as ChakraLink, IconButton, Input, InputGroup, InputLeftElement, Stack, useDisclosure, Collapse, Icon, Text, Container } from '@chakra-ui/react';
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
    fontFamily="body"
  >
    {icon && <Icon as={icon} mr={2} aria-hidden="true" />} 
    {children}
  </ChakraLink>
);

const Navbar = () => {
  const { isOpen, onToggle } = useDisclosure();
  const { cartItems } = useCart();
  const cartItemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const navItems = [
    { label: 'Mobiles', href: '/category/mobiles', icon: FaMobileAlt },
    { label: 'TVs', href: '/category/tvs', icon: FaTv },
    { label: 'Fridges', href: '/category/fridges', icon: FaSnowflake },
    { label: 'ACs', href: '/category/ac', icon: FaWind },
    // Consider fetching categories dynamically or defining them in a central place if they grow
  ];

  return (
    <Box bg="white" borderBottomWidth="1px" borderColor="brand.borderColor" position="sticky" top={0} zIndex="sticky">
      <Container maxW="container.xl">
        <Flex
          h={{ base: 'auto', md: '70px' }}
          py={{ base: 2, md: 0 }}
          px={{ base: 0 }} // Container handles horizontal padding
          align={'center'}
          justify={'space-between'}
          flexWrap="wrap" // Allow wrapping for smaller screens if items don't fit
        >
          <Flex align={'center'}>
            <ChakraLink as={RouterLink} to="/">
              <Heading as="h1" size="lg" fontFamily="heading" color="brand.primary">
                RefurbishMarket
              </Heading>
            </ChakraLink>
          </Flex>

          <Flex display={{ base: 'none', md: 'flex' }} align={'center'} ml={10}>
            <Stack as="nav" aria-label="Main navigation" direction={'row'} spacing={4}>
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
                <SearchIcon color="gray.400" aria-hidden="true" />
              </InputLeftElement>
              <Input 
                type="search" // Use type="search" for semantic correctness
                placeholder="Search products... (Ctrl+K)" 
                aria-label="Search products"
                borderRadius="full" 
                borderColor="brand.borderColor" 
                _focus={{ 
                  borderColor: 'brand.primary', 
                  boxShadow: `0 0 0 1px var(--chakra-colors-brand-primary)`
                }} 
              />
            </InputGroup>
            <ChakraLink 
              as={RouterLink} 
              to="/cart" 
              position="relative" 
              mr={4} 
              p={2} 
              aria-label={`View shopping cart, ${cartItemCount} item${cartItemCount !== 1 ? 's' : ''}`}
              _hover={{ color: 'brand.primary' }}
            >
              <Icon as={FaShoppingCart} w={6} h={6} color="brand.textDark" _hover={{ color: 'inherit' }} aria-hidden="true" />
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
                  px={1.5} // Adjusted padding for better fit with single digit
                  py={0.5}
                  lineHeight="tight"
                  aria-hidden="true" // Content is already in aria-label of parent link
                >
                  {cartItemCount}
                </Box>
              )}
            </ChakraLink>

            <IconButton
              size={'md'}
              icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
              aria-label={isOpen ? "Close Menu" : "Open Menu"}
              aria-expanded={isOpen}
              display={{ md: 'none' }}
              onClick={onToggle}
              variant="ghost"
            />
          </Flex>
        </Flex>
      </Container>

      <Collapse in={isOpen} animateOpacity>
        <Box pb={4} display={{ md: 'none' }} borderTopWidth="1px" borderColor="brand.borderColor" bg="white">
          <Container maxW="container.xl">
            <Stack as={'nav'} aria-label="Mobile navigation" spacing={4} p={4} > 
              {navItems.map((navItem) => (
                <NavLink key={navItem.label} href={navItem.href} icon={navItem.icon}>
                  {navItem.label}
                </NavLink>
              ))}
              <ChakraLink as={RouterLink} to="/cart" fontWeight="medium" display="flex" alignItems="center" p={2} rounded="md" _hover={{bg: 'gray.100', color: 'brand.primary'}} color="brand.textDark">
                  <Icon as={FaShoppingCart} mr={2} aria-hidden="true" /> My Cart
                  {cartItemCount > 0 && <Text as="span" ml={2} bg="brand.accent" color="white" borderRadius="full" px={2} fontSize="sm">{cartItemCount}</Text>}
              </ChakraLink>
            </Stack>
          </Container>
        </Box>
      </Collapse>
    </Box>
  );
};

export default Navbar;
