import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  Box, Container, Heading, Text, Button, VStack, HStack, 
  Image, IconButton, Flex, Divider, Icon, Link as ChakraLink, useToast
} from '@chakra-ui/react';
import { FaTrash, FaPlus, FaMinus, FaShoppingCart, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartItemCount } = useCart();
  const navigate = useNavigate();
  const toast = useToast();

  const handleQuantityChange = (id, currentQuantity, change, stock) => {
    const newQuantity = currentQuantity + change;
    const itemStock = stock || 0; // Ensure stock is a number

    if (newQuantity >= 1) {
      if (newQuantity > itemStock) {
        toast({
          title: 'Maximum stock reached',
          description: `You can only add up to ${itemStock} units for this item.`,
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        updateQuantity(id, itemStock);
      } else {
        updateQuantity(id, newQuantity);
      }
    } else if (newQuantity === 0) {
      removeFromCart(id); // This will show its own toast from CartContext
    }
  };

  const handleClearCart = () => {
    clearCart();
    toast({
        title: 'Cart Cleared',
        description: 'Your shopping cart has been emptied.',
        status: 'info',
        duration: 3000,
        isClosable: true,
    });
  }

  if (cartItems.length === 0) {
    return (
      <Container maxW="container.md" py={10} textAlign="center">
        <VStack spacing={6}>
          <Icon as={FaShoppingCart} w={20} h={20} color="gray.300" />
          <Heading as="h2" size="xl" fontFamily="heading">Your Cart is Empty</Heading>
          <Text color="brand.textLight">Looks like you haven't added anything to your cart yet. Start shopping to find great deals!</Text>
          <Button as={RouterLink} to="/" colorScheme="blue" leftIcon={<FaArrowLeft />}>
            Start Shopping
          </Button>
        </VStack>
      </Container>
    );
  }

  const cartTotal = getCartTotal();
  const totalItems = getCartItemCount();

  return (
    <Container maxW="container.lg" py={8} bg="gray.50" borderRadius={{ base: 'none', md: 'lg'}} shadow={{ base: 'none', md: 'sm'}} my={{ base: 0, md: 5}}>
      <Heading as="h1" size="xl" fontFamily="heading" mb={8} textAlign="center" color="brand.textDark">
        Your Shopping Cart
      </Heading>

      <VStack spacing={6} align="stretch" divider={<Divider borderColor="brand.borderColor" />}>
        {cartItems.map(item => {
          const itemStock = item.stock_quantity || item.stock || 0;
          return (
            <Flex 
              key={item.id} 
              direction={{ base: 'column', sm: 'row' }} 
              align={{ base: 'flex-start', sm: 'center' }} 
              justify="space-between" 
              p={4} 
              bg="white"
              borderWidth="1px" 
              borderColor="brand.borderColor" 
              borderRadius="md"
              shadow="sm"
            >
              <HStack spacing={4} mb={{ base: 4, sm: 0}} align="center" width={{ base: 'full', sm: 'auto'}} flex={{sm: 1}}>
                <Image src={item.imageUrl || 'https://via.placeholder.com/80x80.png?text=Product'} alt={item.name} boxSize="80px" objectFit="cover" borderRadius="md" />
                <Box>
                  <ChakraLink as={RouterLink} to={`/product/${item.id}`} _hover={{textDecoration: 'underline', color: 'brand.primary'}}>
                    <Heading as="h4" size="sm" fontWeight="medium" noOfLines={2} color="brand.textDark">{item.name}</Heading>
                  </ChakraLink>
                  <Text fontSize="sm" color="brand.textLight">{item.conditionGrade || item.condition}</Text>
                  <Text fontSize="md" fontWeight="bold" color="brand.primary">${item.price.toFixed(2)}</Text>
                </Box>
              </HStack>
              
              <HStack spacing={{base: 2, md: 3}} align="center" width={{ base: 'full', sm: 'auto'}} justify={{base: 'space-between', sm: 'flex-end'}}>
                <HStack maxW="120px">
                  <IconButton icon={<FaMinus />} size="sm" onClick={() => handleQuantityChange(item.id, item.quantity, -1, itemStock)} isDisabled={item.quantity <= 1} aria-label="Decrease quantity" variant="outline" />
                  <Text px={2} fontWeight="semibold" minW="20px" textAlign="center">{item.quantity}</Text>
                  <IconButton icon={<FaPlus />} size="sm" onClick={() => handleQuantityChange(item.id, item.quantity, 1, itemStock)} isDisabled={item.quantity >= itemStock} aria-label="Increase quantity" variant="outline" />
                </HStack>
                <Text fontWeight="bold" minW="80px" textAlign="right" color="brand.textDark">${(item.price * item.quantity).toFixed(2)}</Text>
                <IconButton icon={<FaTrash />} colorScheme="red" variant="ghost" onClick={() => removeFromCart(item.id)} aria-label="Remove item" />
              </HStack>
            </Flex>
          );
        })}
      </VStack>

      <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'stretch', md: 'flex-start'}} mt={10} gap={6}>
        <VStack align={{ base: 'stretch', md: 'flex-start' }} spacing={4} flex={1}>
          <Button as={RouterLink} to="/" variant="outline" colorScheme="blue" leftIcon={<FaArrowLeft />}>
            Continue Shopping
          </Button>
          <Button colorScheme="red" variant="ghost" onClick={handleClearCart} leftIcon={<FaTrash />}>
            Clear Cart
          </Button>
        </VStack>

        <Box flex={1} maxW={{ md: '400px' }} bg="white" p={6} borderRadius="lg" borderWidth="1px" borderColor="brand.borderColor" shadow="lg">
          <Heading as="h3" size="lg" fontFamily="heading" mb={6} color="brand.textDark">Order Summary</Heading>
          <VStack spacing={3} align="stretch" mb={6}>
            <Flex justify="space-between">
              <Text color="brand.textLight">Subtotal ({totalItems} item{totalItems === 1 ? '' : 's'})</Text>
              <Text fontWeight="medium" color="brand.textDark">${cartTotal.toFixed(2)}</Text>
            </Flex>
            <Flex justify="space-between">
              <Text color="brand.textLight">Shipping</Text>
              <Text fontWeight="medium" color="green.500">FREE</Text> {/* Placeholder */}
            </Flex>
            <Divider my={2} borderColor="brand.borderColor"/>
            <Flex justify="space-between" fontWeight="bold" fontSize="xl">
              <Text color="brand.textDark">Total</Text>
              <Text color="brand.primary">${cartTotal.toFixed(2)}</Text>
            </Flex>
          </VStack>
          <Button 
            colorScheme="green" 
            size="lg" 
            w="full" 
            onClick={() => navigate('/checkout')}
            rightIcon={<FaArrowRight />}
            py={7}
            _hover={{ bg: 'green.600'}}
            isDisabled={cartItems.length === 0}
          >
            Proceed to Checkout
          </Button>
        </Box>
      </Flex>
    </Container>
  );
};

export default CartPage;
