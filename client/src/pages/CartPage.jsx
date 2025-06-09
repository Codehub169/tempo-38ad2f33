import React, { useContext } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  Box, Container, Heading, Text, Button, VStack, HStack, 
  Image, IconButton, Flex, Divider, Alert, AlertIcon, Icon
} from '@chakra-ui/react';
import { FaTrash, FaPlus, FaMinus, FaShoppingCart, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { CartContext } from '../contexts/CartContext';

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useContext(CartContext);
  const navigate = useNavigate();

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(id, newQuantity);
    }
  };

  if (cart.length === 0) {
    return (
      <Container maxW="container.md" py={10} textAlign="center">
        <VStack spacing={6}>
          <Icon as={FaShoppingCart} w={20} h={20} color="gray.300" />
          <Heading as="h2" size="xl" fontFamily="var(--font-secondary)">Your Cart is Empty</Heading>
          <Text color="var(--text-light)">Looks like you haven't added anything to your cart yet. Start shopping to find great deals!</Text>
          <Button as={RouterLink} to="/" colorScheme="blue" className="btn btn-primary" leftIcon={<FaArrowLeft />}>
            Start Shopping
          </Button>
        </VStack>
      </Container>
    );
  }

  const cartTotal = getCartTotal();

  return (
    <Container maxW="container.lg" py={8} bg="white" borderRadius={{ base: 'none', md: 'lg'}} shadow={{ base: 'none', md: 'sm'}} my={{ base: 0, md: 5}}>
      <Heading as="h1" size="xl" fontFamily="var(--font-secondary)" mb={8} textAlign="center">
        Your Shopping Cart
      </Heading>

      <VStack spacing={6} align="stretch" divider={<Divider borderColor="var(--border-color)" />}>
        {cart.map(item => (
          <Flex key={item.id} direction={{ base: 'column', sm: 'row' }} align={{ base: 'flex-start', sm: 'center' }} justify="space-between" p={4} borderWidth="1px" borderColor="var(--border-color)" borderRadius="md">
            <HStack spacing={4} mb={{ base: 4, sm: 0}} align="center" width={{ base: 'full', sm: 'auto'}}>
              <Image src={item.imageUrl || 'https://via.placeholder.com/80x80.png?text=Product'} alt={item.name} boxSize="80px" objectFit="cover" borderRadius="md" />
              <Box>
                <Heading as="h4" size="sm" fontWeight="medium" noOfLines={2}><RouterLink to={`/product/${item.id}`}>{item.name}</RouterLink></Heading>
                <Text fontSize="sm" color="var(--text-light)">{item.condition}</Text>
                <Text fontSize="md" fontWeight="bold" color="var(--primary-color)">${item.price.toFixed(2)}</Text>
              </Box>
            </HStack>
            
            <HStack spacing={3} align="center" width={{ base: 'full', sm: 'auto'}} justify={{base: 'space-between', sm: 'flex-end'}}>
              <HStack maxW="120px">
                <IconButton icon={<FaMinus />} size="sm" onClick={() => handleQuantityChange(item.id, item.quantity - 1)} isDisabled={item.quantity <= 1} aria-label="Decrease quantity" variant="outline" />
                <Text px={2} fontWeight="semibold">{item.quantity}</Text>
                <IconButton icon={<FaPlus />} size="sm" onClick={() => handleQuantityChange(item.id, item.quantity + 1)} aria-label="Increase quantity" variant="outline" />
              </HStack>
              <Text fontWeight="bold" minW="80px" textAlign="right">${(item.price * item.quantity).toFixed(2)}</Text>
              <IconButton icon={<FaTrash />} colorScheme="red" variant="ghost" onClick={() => removeFromCart(item.id)} aria-label="Remove item" />
            </HStack>
          </Flex>
        ))}
      </VStack>

      <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'stretch', md: 'flex-start'}} mt={10} gap={6}>
        <VStack align={{ base: 'stretch', md: 'flex-start' }} spacing={4} flex={1}>
          <Button as={RouterLink} to="/" variant="outline" colorScheme="blue" leftIcon={<FaArrowLeft />} className="btn btn-secondary">
            Continue Shopping
          </Button>
          <Button colorScheme="red" variant="ghost" onClick={clearCart} leftIcon={<FaTrash />}>
            Clear Cart
          </Button>
        </VStack>

        <Box flex={1} maxW={{ md: '400px' }} bg="gray.50" p={6} borderRadius="lg" borderWidth="1px" borderColor="var(--border-color)">
          <Heading as="h3" size="lg" fontFamily="var(--font-secondary)" mb={6}>Order Summary</Heading>
          <VStack spacing={3} align="stretch" mb={6}>
            <Flex justify="space-between">
              <Text color="var(--text-light)">Subtotal ({cart.reduce((acc, item) => acc + item.quantity, 0)} items)</Text>
              <Text fontWeight="medium">${cartTotal.toFixed(2)}</Text>
            </Flex>
            <Flex justify="space-between">
              <Text color="var(--text-light)">Shipping</Text>
              <Text fontWeight="medium">FREE</Text> {/* Placeholder */}
            </Flex>
            <Divider my={2} />
            <Flex justify="space-between" fontWeight="bold" fontSize="xl">
              <Text>Total</Text>
              <Text color="var(--primary-color)">${cartTotal.toFixed(2)}</Text>
            </Flex>
          </VStack>
          <Button 
            colorScheme="green" 
            size="lg" 
            w="full" 
            className="btn btn-primary" 
            onClick={() => navigate('/checkout')}
            rightIcon={<FaArrowRight />}
            py={7}
            _hover={{ bg: 'green.600'}}
          >
            Proceed to Checkout
          </Button>
        </Box>
      </Flex>
    </Container>
  );
};

export default CartPage;
