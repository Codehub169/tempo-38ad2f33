import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Container, Heading, Text, Button, VStack, HStack, 
  FormControl, FormLabel, FormErrorMessage, Input, SimpleGrid, Divider, 
  Alert, AlertIcon, Icon, Select, useToast
} from '@chakra-ui/react';
import { FaShoppingCart, FaCreditCard, FaLock } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';

const CheckoutPage = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'US', 
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submissionError, setSubmissionError] = useState('');
  const [loading, setLoading] = useState(false);

  const cartTotal = getCartTotal();

  useEffect(() => {
    if (cartItems.length === 0 && !loading) {
      toast({
        title: "Your cart is empty!",
        description: "Redirecting to homepage to add items.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      navigate('/');
    }
  }, [cartItems, loading, navigate, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required.';
    if (!formData.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!formData.address.trim()) errors.address = 'Street address is required.';
    if (!formData.city.trim()) errors.city = 'City is required.';
    if (!formData.postalCode.trim()) {
      errors.postalCode = 'Postal code is required.';
    } else if (formData.country === 'US' && !/^\d{5}(-\d{4})?$/.test(formData.postalCode)) {
      errors.postalCode = 'Invalid US postal code.';
    } // Add more country-specific validations if needed
    if (!formData.country.trim()) errors.country = 'Country is required.';
    
    // Mocked payment fields validation (basic presence check)
    if (!formData.cardNumber.trim()) errors.cardNumber = 'Card number is required.';
    // Basic card number format (e.g. 16 digits) - very simplified for mock
    else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) errors.cardNumber = 'Card number should be 16 digits.';
    
    if (!formData.expiryDate.trim()) {
      errors.expiryDate = 'Expiry date is required.';
    } else if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(formData.expiryDate)) {
      errors.expiryDate = 'Invalid expiry date format (MM/YY).';
    }
    if (!formData.cvv.trim()) {
      errors.cvv = 'CVV is required.';
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      errors.cvv = 'CVV should be 3 or 4 digits.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionError('');
    if (!validateForm()) {
      setSubmissionError('Please correct the errors in the form.');
      return;
    }
    
    setLoading(true);
    try {
      // In a real app: await placeOrderApi({ cartItems, formData, total: cartTotal });
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      
      const orderDetails = {
        orderId: `RM${Date.now().toString().slice(-6)}`,
        items: cartItems,
        total: cartTotal,
        shippingAddress: {
            fullName: formData.fullName,
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
            country: formData.country,
        },
        customerEmail: formData.email,
        orderDate: new Date().toISOString(),
      };

      clearCart(); 
      navigate('/order-confirmation', { state: { orderDetails } });
    } catch (apiError) {
      setSubmissionError('There was an issue placing your order. Please try again.');
      console.error('Order placement error:', apiError);
      setLoading(false);
    }
    // setLoading(false); // setLoading(false) should be in finally if used, or after navigate for success
  };
  
  if (cartItems.length === 0 && !loading) return null; // Already handled by useEffect, but good failsafe

  return (
    <Container maxW="container.lg" py={8}>
      <Heading as="h1" size="xl" fontFamily="var(--font-secondary)" mb={8} textAlign="center" color="var(--text-dark)">
        Secure Checkout
      </Heading>

      <Flex direction={{ base: 'column-reverse', md: 'row' }} gap={10}>
        {/* Shipping & Payment Form */}
        <Box flex={{base: 1, md: 2}} bg="white" p={{base: 4, md: 8}} borderRadius="lg" shadow="sm">
          <form onSubmit={handleSubmit} noValidate>
            <VStack spacing={6} align="stretch">
              <Heading as="h2" size="lg" fontFamily="var(--font-secondary)" mb={2} color="var(--text-dark)">Shipping Information</Heading>
              {submissionError && !loading && <Alert status="error" borderRadius="md"><AlertIcon />{submissionError}</Alert>}
              
              <FormControl isRequired isInvalid={!!formErrors.fullName}>
                <FormLabel htmlFor="fullName">Full Name</FormLabel>
                <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Doe" borderColor="var(--border-color)"/>
                <FormErrorMessage>{formErrors.fullName}</FormErrorMessage>
              </FormControl>
              <FormControl isRequired isInvalid={!!formErrors.email}>
                <FormLabel htmlFor="email">Email Address</FormLabel>
                <Input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" borderColor="var(--border-color)"/>
                <FormErrorMessage>{formErrors.email}</FormErrorMessage>
              </FormControl>
              <FormControl isRequired isInvalid={!!formErrors.address}>
                <FormLabel htmlFor="address">Street Address</FormLabel>
                <Input id="address" name="address" value={formData.address} onChange={handleChange} placeholder="123 Main St" borderColor="var(--border-color)"/>
                <FormErrorMessage>{formErrors.address}</FormErrorMessage>
              </FormControl>
              <SimpleGrid columns={{base: 1, sm: 2}} spacing={4}>
                <FormControl isRequired isInvalid={!!formErrors.city}>
                  <FormLabel htmlFor="city">City</FormLabel>
                  <Input id="city" name="city" value={formData.city} onChange={handleChange} placeholder="New York" borderColor="var(--border-color)"/>
                  <FormErrorMessage>{formErrors.city}</FormErrorMessage>
                </FormControl>
                <FormControl isRequired isInvalid={!!formErrors.postalCode}>
                  <FormLabel htmlFor="postalCode">Postal Code</FormLabel>
                  <Input id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="10001" borderColor="var(--border-color)"/>
                  <FormErrorMessage>{formErrors.postalCode}</FormErrorMessage>
                </FormControl>
              </SimpleGrid>
              <FormControl isRequired isInvalid={!!formErrors.country}>
                <FormLabel htmlFor="country">Country</FormLabel>
                <Select id="country" name="country" value={formData.country} onChange={handleChange} borderColor="var(--border-color)">
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    {/* Add more countries as needed */}
                </Select>
                <FormErrorMessage>{formErrors.country}</FormErrorMessage>
              </FormControl>

              <Divider my={4} borderColor="var(--border-color)"/>

              <Heading as="h2" size="lg" fontFamily="var(--font-secondary)" mb={2} display="flex" alignItems="center" color="var(--text-dark)">
                <Icon as={FaLock} mr={2} color="green.500"/> Payment Details
              </Heading>
              <Text fontSize="sm" color="var(--text-light)" mb={4}>Payment processing is mocked. No real card details are stored or processed.</Text>
              <FormControl isRequired isInvalid={!!formErrors.cardNumber}>
                <FormLabel htmlFor="cardNumber">Card Number</FormLabel>
                <Input id="cardNumber" name="cardNumber" value={formData.cardNumber} onChange={handleChange} placeholder="uuuu uuuu uuuu uuuu" borderColor="var(--border-color)" inputMode="numeric" autoComplete="cc-number"/>
                <FormErrorMessage>{formErrors.cardNumber}</FormErrorMessage>
              </FormControl>
              <SimpleGrid columns={2} spacing={4}>
                <FormControl isRequired isInvalid={!!formErrors.expiryDate}>
                  <FormLabel htmlFor="expiryDate">Expiry Date</FormLabel>
                  <Input id="expiryDate" name="expiryDate" value={formData.expiryDate} onChange={handleChange} placeholder="MM/YY" borderColor="var(--border-color)" inputMode="numeric" autoComplete="cc-exp"/>
                  <FormErrorMessage>{formErrors.expiryDate}</FormErrorMessage>
                </FormControl>
                <FormControl isRequired isInvalid={!!formErrors.cvv}>
                  <FormLabel htmlFor="cvv">CVV</FormLabel>
                  <Input id="cvv" name="cvv" value={formData.cvv} onChange={handleChange} placeholder="123" borderColor="var(--border-color)" inputMode="numeric" autoComplete="cc-csc"/>
                  <FormErrorMessage>{formErrors.cvv}</FormErrorMessage>
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
        <Box flex={1} bg="gray.50" p={{base:4, md:6}} borderRadius="lg" h="fit-content" shadow="sm" borderWidth="1px" borderColor="var(--border-color)" position={{ md: 'sticky' }} top={{ md: '80px' }}>
          <Heading as="h3" size="lg" fontFamily="var(--font-secondary)" mb={6} display="flex" alignItems="center" color="var(--text-dark)">
            <Icon as={FaShoppingCart} mr={2} color="var(--primary-color)" /> Order Summary
          </Heading>
          <VStack spacing={3} align="stretch" divider={<Divider borderColor="gray.300" />}>
            {cartItems.map(item => (
              <HStack key={item.id} justify="space-between" py={2}>
                <HStack spacing={3} alignItems="flex-start">
                  <Box boxSize="50px" bg="white" borderRadius="md" borderWidth="1px" borderColor="var(--border-color)" p="2px" flexShrink={0}>
                     <Image src={item.imageUrl || 'https://via.placeholder.com/50x50.png'} alt={item.name} style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit'}}/>
                  </Box>
                  <Box>
                    <Text fontWeight="medium" fontSize="sm" noOfLines={2} color="var(--text-dark)">{item.name}</Text>
                    <Text fontSize="xs" color="var(--text-light)">Qty: {item.quantity}</Text>
                  </Box>
                </HStack>
                <Text fontWeight="medium" fontSize="sm" color="var(--text-dark)" whiteSpace="nowrap">${(item.price * item.quantity).toFixed(2)}</Text>
              </HStack>
            ))}
          </VStack>
          <Divider my={4} borderColor="gray.300" />
          <VStack spacing={2} align="stretch">
            <Flex justify="space-between">
              <Text color="var(--text-light)">Subtotal</Text>
              <Text fontWeight="medium" color="var(--text-dark)">${cartTotal.toFixed(2)}</Text>
            </Flex>
            <Flex justify="space-between">
              <Text color="var(--text-light)">Shipping</Text>
              <Text fontWeight="medium" color="green.500">FREE</Text>
            </Flex>
            <Divider my={2} borderColor="gray.300" />
            <Flex justify="space-between" fontWeight="bold" fontSize="lg">
              <Text color="var(--text-dark)">Total</Text>
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
