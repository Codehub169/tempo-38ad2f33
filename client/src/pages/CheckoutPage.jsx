import React, { useState, useContext } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  Box, Container, Heading, Text, Button, VStack, HStack, 
  FormControl, FormLabel, Input, SimpleGrid, Divider, 
  Alert, AlertIcon, Icon, Select
} from '@chakra-ui/react';
import { FaShoppingCart, FaCreditCard, FaLock } from 'react-icons/fa';
import { CartContext } from '../contexts/CartContext';

const CheckoutPage = () => {
  const { cart, getCartTotal, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'US', // Default country
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const cartTotal = getCartTotal();

  if (cart.length === 0 && !loading) { // Prevent redirect if already processing order
    navigate('/'); // Redirect to home if cart is empty
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    for (const key in formData) {
      if (formData[key].trim() === '') {
        setError(`Please fill in all fields. ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} is missing.`);
        setLoading(false);
        return;
      }
    }
    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
        setError('Please enter a valid email address.');
        setLoading(false);
        return;
    }
    // Simulate API call for order placement
    try {
      // In a real app: await placeOrderApi({ cart, formData, total: cartTotal });
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      
      const orderDetails = {
        orderNumber: `RM${Date.now().toString().slice(-6)}`,
        items: cart,
        total: cartTotal,
        shippingAddress: {
            fullName: formData.fullName,
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
            country: formData.country,
        }
      };

      clearCart(); 
      navigate('/order-confirmation', { state: { orderDetails } });
    } catch (apiError) {
      setError('There was an issue placing your order. Please try again.');
      console.error('Order placement error:', apiError);
    }
    setLoading(false);
  };

  return (
    <Container maxW="container.lg" py={8}>
      <Heading as="h1" size="xl" fontFamily="var(--font-secondary)" mb={8} textAlign="center">
        Secure Checkout
      </Heading>

      <Flex direction={{ base: 'column-reverse', md: 'row' }} gap={10}>
        {/* Shipping & Payment Form */}
        <Box flex={2} bg="white" p={{base: 4, md: 8}} borderRadius="lg" shadow="sm">
          <form onSubmit={handleSubmit}>
            <VStack spacing={6} align="stretch">
              <Heading as="h2" size="lg" fontFamily="var(--font-secondary)" mb={2}>Shipping Information</Heading>
              {error && <Alert status="error" borderRadius="md"><AlertIcon />{error}</Alert>}
              
              <FormControl isRequired>
                <FormLabel>Full Name</FormLabel>
                <Input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Doe" borderColor="var(--border-color)"/>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Email Address</FormLabel>
                <Input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" borderColor="var(--border-color)"/>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Street Address</FormLabel>
                <Input name="address" value={formData.address} onChange={handleChange} placeholder="123 Main St" borderColor="var(--border-color)"/>
              </FormControl>
              <SimpleGrid columns={{base: 1, sm: 2}} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>City</FormLabel>
                  <Input name="city" value={formData.city} onChange={handleChange} placeholder="New York" borderColor="var(--border-color)"/>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Postal Code</FormLabel>
                  <Input name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="10001" borderColor="var(--border-color)"/>
                </FormControl>
              </SimpleGrid>
              <FormControl isRequired>
                <FormLabel>Country</FormLabel>
                <Select name="country" value={formData.country} onChange={handleChange} borderColor="var(--border-color)">
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    {/* Add more countries as needed */}
                </Select>
              </FormControl>

              <Divider my={4}/>

              <Heading as="h2" size="lg" fontFamily="var(--font-secondary)" mb={2} display="flex" alignItems="center">
                <Icon as={FaLock} mr={2} color="green.500"/> Payment Details
              </Heading>
              <Text fontSize="sm" color="var(--text-light)" mb={4}>Payment processing is mocked. No real card details are stored or processed.</Text>
              <FormControl isRequired>
                <FormLabel>Card Number</FormLabel>
                <Input name="cardNumber" value={formData.cardNumber} onChange={handleChange} placeholder="•••• •••• •••• ••••" borderColor="var(--border-color)"/>
              </FormControl>
              <SimpleGrid columns={2} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Expiry Date</FormLabel>
                  <Input name="expiryDate" value={formData.expiryDate} onChange={handleChange} placeholder="MM/YY" borderColor="var(--border-color)"/>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>CVV</FormLabel>
                  <Input name="cvv" value={formData.cvv} onChange={handleChange} placeholder="123" borderColor="var(--border-color)"/>
                </FormControl>
              </SimpleGrid>

              <Button 
                type="submit" 
                colorScheme="green" 
                size="lg" 
                w="full" 
                className="btn btn-primary" 
                isLoading={loading}
                loadingText="Processing Order..."
                leftIcon={<FaCreditCard />}
                mt={4} py={7}
                 _hover={{ bg: 'green.600'}}
              >
                Place Order & Pay ${cartTotal.toFixed(2)}
              </Button>
            </VStack>
          </form>
        </Box>

        {/* Order Summary */}
        <Box flex={1} bg="gray.50" p={{base:4, md:6}} borderRadius="lg" h="fit-content" shadow="sm" borderWidth="1px" borderColor="var(--border-color)">
          <Heading as="h3" size="lg" fontFamily="var(--font-secondary)" mb={6} display="flex" alignItems="center">
            <Icon as={FaShoppingCart} mr={2} color="var(--primary-color)" /> Order Summary
          </Heading>
          <VStack spacing={3} align="stretch" divider={<Divider borderColor="gray.300" />}>
            {cart.map(item => (
              <HStack key={item.id} justify="space-between" py={2}>
                <HStack spacing={3}>
                  <Box boxSize="50px" bg="white" borderRadius="md" borderWidth="1px" borderColor="var(--border-color)" p="2px">
                     <img src={item.imageUrl || 'https://via.placeholder.com/50x50.png'} alt={item.name} style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit'}}/>
                  </Box>
                  <Box>
                    <Text fontWeight="medium" fontSize="sm" noOfLines={1}>{item.name}</Text>
                    <Text fontSize="xs" color="var(--text-light)">Qty: {item.quantity}</Text>
                  </Box>
                </HStack>
                <Text fontWeight="medium" fontSize="sm">${(item.price * item.quantity).toFixed(2)}</Text>
              </HStack>
            ))}
          </VStack>
          <Divider my={4} borderColor="gray.300" />
          <VStack spacing={2} align="stretch">
            <Flex justify="space-between">
              <Text color="var(--text-light)">Subtotal</Text>
              <Text fontWeight="medium">${cartTotal.toFixed(2)}</Text>
            </Flex>
            <Flex justify="space-between">
              <Text color="var(--text-light)">Shipping</Text>
              <Text fontWeight="medium">FREE</Text>
            </Flex>
            <Divider my={2} borderColor="gray.300" />
            <Flex justify="space-between" fontWeight="bold" fontSize="lg">
              <Text>Total</Text>
              <Text color="var(--primary-color)">${cartTotal.toFixed(2)}</Text>
            </Flex>
          </VStack>
          <Text fontSize="xs" color="var(--text-light)" mt={4} textAlign="center">
            By placing this order, you agree to our Terms of Service and Privacy Policy.
          </Text>
        </Box>
      </Flex>
    </Container>
  );
};

export default CheckoutPage;
