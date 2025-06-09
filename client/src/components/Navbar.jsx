import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Link as ChakraLink,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  useDisclosure,
  Collapse,
  Icon,
  Text,
  Container,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Divider
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { HamburgerIcon, CloseIcon, SearchIcon } from '@chakra-ui/icons';
import { FaMobileAlt, FaTv, FaSnowflake, FaWind, FaShoppingCart, FaUserCircle, FaPlusCircle } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const NavLink = ({ href, children, icon, onClick }) => (
  <ChakraLink
    as={RouterLink}
    to={href}
    onClick={onClick} 
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
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Added as per diff, may be used for redirect logic elsewhere or future use
  const cartItemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const navItems = [
    { label: 'Mobiles', href: '/category/Mobiles', icon: FaMobileAlt },
    { label: 'TVs', href: '/category/TVs', icon: FaTv },
    { label: 'Fridges', href: '/category/Fridges', icon: FaSnowflake },
    { label: 'ACs', href: '/category/ACs', icon: FaWind }, 
  ];

  const handleLogout = () => {
    logout();
    navigate('/'); 
  };

  return (
    <Box bg="white" borderBottomWidth="1px" borderColor="brand.borderColor" position="sticky" top={0} zIndex="sticky">
      <Container maxW="container.xl">
        <Flex
          h={{ base: 'auto', md: '70px' }}
          py={{ base: 2, md: 0 }}
          px={{ base: 0 }}
          align={'center'}
          justify={'space-between'}
          flexWrap="wrap"
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
                type="search"
                placeholder="Search products..."
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
              display="flex" 
              alignItems="center"
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
                  px={1.5}
                  py={0.5}
                  lineHeight="tight"
                  aria-hidden="true"
                >
                  {cartItemCount}
                </Box>
              )}
            </ChakraLink>

            {!isLoading && (
              isAuthenticated && user ? (
                <Menu>
                  <MenuButton 
                    as={Button} 
                    rounded={'full'} 
                    variant={'link'} 
                    cursor={'pointer'} 
                    minW={0} 
                    _hover={{textDecoration: 'none'}}
                    aria-label="User menu"
                    title={user.name || user.email}
                  >
                    <Icon as={FaUserCircle} w={6} h={6} color="brand.textDark" />
                  </MenuButton>
                  <MenuList zIndex="popover">
                    <MenuItem as={RouterLink} to="/profile">My Profile</MenuItem>
                    <MenuItem as={RouterLink} to="/orders">My Orders</MenuItem>
                    {user?.role === 'seller' && (
                      <MenuItem as={RouterLink} to="/add-product" icon={<Icon as={FaPlusCircle} />}>Add Product</MenuItem>
                    )}
                    <MenuDivider />
                    <MenuItem onClick={handleLogout} color="red.500">Logout</MenuItem>
                  </MenuList>
                </Menu>
              ) : (
                <Stack direction="row" spacing={2}>
                  <Button as={RouterLink} to="/login" size="sm" variant="outline" colorScheme="blue">Login</Button>
                  <Button as={RouterLink} to="/register" size="sm" colorScheme="green">Sign Up</Button>
                </Stack>
              )
            )}

            <IconButton
              size={'md'}
              icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
              aria-label={isOpen ? "Close Menu" : "Open Menu"}
              aria-expanded={isOpen}
              display={{ md: 'none' }}
              onClick={onToggle}
              variant="ghost"
              ml={2}
            />
          </Flex>
        </Flex>
      </Container>

      <Collapse in={isOpen} animateOpacity>
        <Box pb={4} display={{ md: 'none' }} borderTopWidth="1px" borderColor="brand.borderColor" bg="white">
          <Container maxW="container.xl">
            <Stack as={'nav'} aria-label="Mobile navigation" spacing={4} p={4} > 
              {navItems.map((navItem) => (
                <NavLink key={navItem.label} href={navItem.href} icon={navItem.icon} onClick={onToggle}>
                  {navItem.label}
                </NavLink>
              ))}
              <ChakraLink as={RouterLink} to="/cart" fontWeight="medium" display="flex" alignItems="center" p={2} rounded="md" _hover={{bg: 'gray.100', color: 'brand.primary'}} color="brand.textDark" onClick={onToggle}>
                  <Icon as={FaShoppingCart} mr={2} aria-hidden="true" /> My Cart
                  {cartItemCount > 0 && <Text as="span" ml={2} bg="brand.accent" color="white" borderRadius="full" px={2} fontSize="sm">{cartItemCount}</Text>}
              </ChakraLink>
              <Divider borderColor="brand.borderColor" my={2} />
              {!isLoading && isAuthenticated && user ? (
                <>
                  {user?.role === 'seller' && (
                    <NavLink href="/add-product" icon={FaPlusCircle} onClick={onToggle}>Add New Product</NavLink>
                  )}
                  <NavLink href="/profile" icon={FaUserCircle} onClick={onToggle}>My Profile</NavLink>
                  <Button 
                    onClick={() => { handleLogout(); onToggle(); }} 
                    colorScheme="red" 
                    variant="ghost" 
                    justifyContent="flex-start" 
                    pl={3} 
                    py={2} 
                    fontWeight="medium" 
                    fontFamily="body"
                    leftIcon={<Icon as={FaUserCircle} />}
                    width="full"
                    _hover={{bg: 'gray.100', color: 'red.500'}}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <NavLink href="/login" icon={FaUserCircle} onClick={onToggle}>Login</NavLink>
                  <NavLink href="/register" icon={FaUserCircle} onClick={onToggle}>Sign Up</NavLink>
                </>
              )}
            </Stack>
          </Container>
        </Box>
      </Collapse>
    </Box>
  );
};

export default Navbar;
