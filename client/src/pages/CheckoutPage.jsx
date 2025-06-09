import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Container, Heading, Text, Button, VStack, HStack, 
  FormControl, FormLabel, FormErrorMessage, Input, SimpleGrid, Divider, 
  Alert, AlertIcon, Icon, Select, useToast, Image
} from '@chakra-ui/react';
import { FaShoppingCart, FaCreditCard, FaLock } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext'; // Assuming user details might be pre-filled

const CheckoutPage = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth(); // Get authenticated user
  const navigate = useNavigate();
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'IN', // Default to India
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submissionError, setSubmissionError] = useState('');
  const [loading, setLoading] = useState(false);

  const cartTotal = getCartTotal();

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (cartItems.length === 0 && !loading) {
      toast({
        title: "Your cart is empty!",
        description: "Redirecting to homepage to add items.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top"
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
    } else if (formData.country === 'IN' && !/^\d{6}$/.test(formData.postalCode)) {
      errors.postalCode = 'Invalid Indian postal code (e.g., 110001).';
    } else if (formData.country === 'US' && !/^\d{5}(-\d{4})?$/.test(formData.postalCode)) {
      errors.postalCode = 'Invalid US postal code (e.g., 12345 or 12345-6789).';
    }
    if (!formData.country.trim()) errors.country = 'Country is required.';
    
    if (!formData.cardNumber.trim()) {
      errors.cardNumber = 'Card number is required.';
    } else if (!/^\d{13,19}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
      errors.cardNumber = 'Card number should be 13-19 digits.';
    }
    
    if (!formData.expiryDate.trim()) {
      errors.expiryDate = 'Expiry date is required.';
    } else if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(formData.expiryDate)) {
      errors.expiryDate = 'Invalid expiry date format (MM/YY or MMYY).';
    } else {
      let monthStr, yearStr;
      if (formData.expiryDate.includes('/')) {
        [monthStr, yearStr] = formData.expiryDate.split('/');
      } else {
        monthStr = formData.expiryDate.substring(0, 2);
        yearStr = formData.expiryDate.substring(2, 4);
      }
      const month = parseInt(monthStr, 10);
      const year = parseInt(yearStr, 10);
      const expiryDateObj = new Date(Number(`20${year}`), month, 1); // First day of the month *after* expiry month
      const currentDate = new Date();
      currentDate.setHours(0,0,0,0);

      if (expiryDateObj <= currentDate) {
          errors.expiryDate = 'Card has expired.';
      }
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
      toast({ title: 'Validation Error', description: 'Please correct the highlighted errors.', status: 'error', duration: 3000, isClosable: true, position: "top" });
      return;
    }
    
    setLoading(true);
    try {
      // Simulate API call to backend's createOrder endpoint
      // In a real app: await createOrderApi({ cartItems, formData, total: cartTotal });
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      
      const orderDetails = {
        orderId: `RM${Date.now().toString().slice(-6)}`,
        items: cartItems.map(item => ({ ...item, image_url: item.image_url || item.imageUrl })), // Ensure image_url is passed
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
      console.error('Order placement error:', apiError);
      const message = apiError.response?.data?.message || 'There was an issue placing your order. Please try again or contact support.';
      setSubmissionError(message);
      toast({ title: 'Order Failed', description: message, status: 'error', duration: 5000, isClosable: true, position: "top" });
      setLoading(false);
    }
  };
  
  if (cartItems.length === 0 && !loading) return null;

  return (
    <Container maxW="container.lg" py={8}>
      <Heading as="h1" size="xl" fontFamily="heading" mb={8} textAlign="center" color="brand.textDark">
        Secure Checkout
      </Heading>

      <Flex direction={{ base: 'column-reverse', md: 'row' }} gap={10}>
        <Box flex={{base: 1, md: 2}} bg="white" p={{base: 4, md: 8}} borderRadius="lg" shadow="sm" borderWidth="1px" borderColor="brand.borderColor">
          <form onSubmit={handleSubmit} noValidate>
            <VStack spacing={6} align="stretch">
              <Heading as="h2" size="lg" fontFamily="heading" mb={2} color="brand.textDark">Shipping Information</Heading>
              {submissionError && !loading && <Alert status="error" borderRadius="md"><AlertIcon />{submissionError}</Alert>}
              
              <FormControl isRequired isInvalid={!!formErrors.fullName}>
                <FormLabel htmlFor="fullName">Full Name</FormLabel>
                <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Doe" borderColor="brand.borderColor" autoComplete="name"/>
                <FormErrorMessage>{formErrors.fullName}</FormErrorMessage>
              </FormControl>
              <FormControl isRequired isInvalid={!!formErrors.email}>
                <FormLabel htmlFor="email">Email Address</FormLabel>
                <Input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" borderColor="brand.borderColor" autoComplete="email"/>
                <FormErrorMessage>{formErrors.email}</FormErrorMessage>
              </FormControl>
              <FormControl isRequired isInvalid={!!formErrors.address}>
                <FormLabel htmlFor="address">Street Address</FormLabel>
                <Input id="address" name="address" value={formData.address} onChange={handleChange} placeholder="123 Main St, Apt 4B" borderColor="brand.borderColor" autoComplete="street-address"/>
                <FormErrorMessage>{formErrors.address}</FormErrorMessage>
              </FormControl>
              <SimpleGrid columns={{base: 1, sm: 2}} spacing={4}>
                <FormControl isRequired isInvalid={!!formErrors.city}>
                  <FormLabel htmlFor="city">City</FormLabel>
                  <Input id="city" name="city" value={formData.city} onChange={handleChange} placeholder="Mumbai" borderColor="brand.borderColor" autoComplete="address-level2"/>
                  <FormErrorMessage>{formErrors.city}</FormErrorMessage>
                </FormControl>
                <FormControl isRequired isInvalid={!!formErrors.postalCode}>
                  <FormLabel htmlFor="postalCode">Postal Code</FormLabel>
                  <Input id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="400001" borderColor="brand.borderColor" autoComplete="postal-code"/>
                  <FormErrorMessage>{formErrors.postalCode}</FormErrorMessage>
                </FormControl>
              </SimpleGrid>
              <FormControl isRequired isInvalid={!!formErrors.country}>
                <FormLabel htmlFor="country">Country</FormLabel>
                <Select id="country" name="country" value={formData.country} onChange={handleChange} borderColor="brand.borderColor" autoComplete="country-name">
                    <option value="IN">India</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                </Select>
                <FormErrorMessage>{formErrors.country}</FormErrorMessage>
              </FormControl>

              <Divider my={4} borderColor="brand.borderColor"/>

              <Heading as="h2" size="lg" fontFamily="heading" mb={2} display="flex" alignItems="center" color="brand.textDark">
                <Icon as={FaLock} mr={2} color="green.500"/> Payment Details
              </Heading>
              <Text fontSize="sm" color="brand.textLight" mb={4}>Payment processing is mocked. No real card details are stored or processed.</Text>
              <FormControl isRequired isInvalid={!!formErrors.cardNumber}>
                <FormLabel htmlFor="cardNumber">Card Number</FormLabel>
                <Input id="cardNumber" name="cardNumber" value={formData.cardNumber} onChange={handleChange} placeholder="	u2022	u2022	u2022	u2022 	u2022	u2022	u2022	u2022 	u2022	u2022	u2022	u2022 	u2022	u2022	u2022	u2022" borderColor="brand.borderColor" inputMode="numeric" autoComplete="cc-number"/>
                <FormErrorMessage>{formErrors.cardNumber}</FormErrorMessage>
              </FormControl>
              <SimpleGrid columns={2} spacing={4}>
                <FormControl isRequired isInvalid={!!formErrors.expiryDate}>
                  <FormLabel htmlFor="expiryDate">Expiry Date (MM/YY)</FormLabel>
                  <Input id="expiryDate" name="expiryDate" value={formData.expiryDate} onChange={handleChange} placeholder="MM/YY" borderColor="brand.borderColor" inputMode="numeric" autoComplete="cc-exp"/>
                  <FormErrorMessage>{formErrors.expiryDate}</FormErrorMessage>
                </FormControl>
                <FormControl isRequired isInvalid={!!formErrors.cvv}>
                  <FormLabel htmlFor="cvv">CVV</FormLabel>
                  <Input id="cvv" name="cvv" value={formData.cvv} onChange={handleChange} placeholder="123" borderColor="brand.borderColor" inputMode="numeric" autoComplete="cc-csc"/>
                  <FormErrorMessage>{formErrors.cvv}</FormErrorMessage>
                </FormControl>
              </SimpleGrid>

              <Button 
                type="submit" 
                colorScheme="green" 
                size="lg" 
                w="full" 
                isLoading={loading}
                loadingText="Processing Order..."
                leftIcon={<FaCreditCard />}
                mt={4} py={7}
                 _hover={{ bg: 'green.600'}}
              >
                Place Order & Pay 	u20b9{cartTotal.toLocaleString('en-IN')}
              </Button>
            </VStack>
          </form>
        </Box>

        <Box flex={1} bg="gray.50" p={{base:4, md:6}} borderRadius="lg" h="fit-content" shadow="sm" borderWidth="1px" borderColor="brand.borderColor" position={{ md: 'sticky' }} top={{ md: '80px' }}>
          <Heading as="h3" size="lg" fontFamily="heading" mb={6} display="flex" alignItems="center" color="brand.textDark">
            <Icon as={FaShoppingCart} mr={2} color="brand.primary" /> Order Summary
          </Heading>
          <VStack spacing={3} align="stretch" divider={<Divider borderColor="gray.300" />}>
            {cartItems.map(item => (
              <HStack key={item.id} justify="space-between" py={2}>
                <HStack spacing={3} alignItems="flex-start" flex={1} minWidth={0}>
                  <Box boxSize="50px" bg="white" borderRadius="md" borderWidth="1px" borderColor="brand.borderColor" p="2px" flexShrink={0}>
                     <Image src={item.image_url || 'https://via.placeholder.com/50x50.png?text=Item'} alt={item.name} w="full" h="full" objectFit="cover" borderRadius="md"/>
                  </Box>
                  <Box flex={1} minWidth={0}>
                    <Text fontWeight="medium" fontSize="sm" noOfLines={2} color="brand.textDark" title={item.name}>{item.name}</Text>
                    <Text fontSize="xs" color="brand.textLight">Qty: {item.quantity}</Text>
                  </Box>
                </HStack>
                <Text fontWeight="medium" fontSize="sm" color="brand.textDark" whiteSpace="nowrap">	u20b9{(item.price * item.quantity).toLocaleString('en-IN')}</Text>
              </HStack>
            ))}
          </VStack>
          <Divider my={4} borderColor="gray.300" />
          <VStack spacing={2} align="stretch">
            <Flex justify="space-between">
              <Text color="brand.textLight">Subtotal</Text>
              <Text fontWeight="medium" color="brand.textDark">	u20b9{cartTotal.toLocaleString('en-IN')}</Text>
            </Flex>
            <Flex justify="space-between">
              <Text color="brand.textLight">Shipping</Text>
              <Text fontWeight="medium" color="green.500">FREE</Text>
            </Flex>
            <Divider my={2} borderColor="gray.300" />
            <Flex justify="space-between" fontWeight="bold" fontSize="lg">
              <Text color="brand.textDark">Total</Text>
              <Text color="brand.primary">	u20b9{cartTotal.toLocaleString('en-IN')}</Text>
            </Flex>
          </VStack>
          <Text fontSize="xs" color="brand.textLight" mt={4} textAlign="center">
            By placing this order, you agree to our Terms of Service and Privacy Policy.
          </Text>
        </Box>
      </Flex>
    </Container>
  );
};

export default CheckoutPage;
