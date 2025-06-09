import React, { useEffect } from 'react';
import { useLocation, Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Heading, Text, VStack, Button, Divider, SimpleGrid, Image, Icon, useToast } from '@chakra-ui/react';
import { FaCheckCircle, FaShoppingBag } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';

const OrderConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { clearCart } = useCart();
  const orderDetails = location.state?.orderDetails;

  useEffect(() => {
    if (!orderDetails) {
      toast({
        title: 'No order details found.',
        description: 'Redirecting to homepage.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      navigate('/');
    } else {
      // Clear cart after successful order confirmation page load
      clearCart(); 
    }
  }, [orderDetails, navigate, toast, clearCart]);

  if (!orderDetails) {
    return (
      <Box textAlign="center" py={10} px={6}>
        <Heading as="h2" size="xl" mt={6} mb={2} color="brand.primary">
          Loading order details...
        </Heading>
        <Text color={'gray.500'}>
          If you are not redirected, please click below to go to the homepage.
        </Text>
        <Button as={RouterLink} to="/" colorScheme="blue" mt={4} variant="solid">
          Go to Homepage
        </Button>
      </Box>
    );
  }

  const { orderId, items, total, shippingAddress } = orderDetails;

  return (
    <Box className="container" mx="auto" p={{ base: 4, md: 8 }} maxW="container.lg" bg="white" borderRadius="lg" boxShadow="md" my={8}>
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Icon as={FaCheckCircle} w={16} h={16} color="brand.accent" mb={4} />
          <Heading as="h1" size="2xl" fontFamily="brand.secondary" color="brand.primary">
            Thank You For Your Order!
          </Heading>
          <Text fontSize="lg" color="gray.600" mt={2}>
            Your order <Text as="span" fontWeight="bold" color="brand.textDark">#{orderId}</Text> has been placed successfully.
          </Text>
        </Box>

        <Divider />

        <Box>
          <Heading as="h3" size="lg" fontFamily="brand.secondary" mb={4} color="brand.textDark">
            Order Summary
          </Heading>
          <VStack spacing={4} align="stretch" divider={<Divider />}>
            {items.map((item) => (
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} key={item.id} alignItems="center">
                <Image src={item.image || `https://via.placeholder.com/100x100.png?text=${item.name}`} alt={item.name} boxSize="100px" objectFit="contain" borderRadius="md" />
                <Box>
                  <Text fontWeight="bold" color="brand.textDark">{item.name}</Text>
                  <Text fontSize="sm" color="brand.textLight">Qty: {item.quantity}</Text>
                </Box>
                <Text fontWeight="bold" color="brand.primary" textAlign={{ base: "left", md: "right" }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </Text>
              </SimpleGrid>
            ))}
          </VStack>
          <Box textAlign="right" mt={4} borderTopWidth="1px" borderColor="brand.border" pt={4}>
            <Text fontSize="xl" fontWeight="bold" color="brand.textDark">Total: ${total.toFixed(2)}</Text>
          </Box>
        </Box>

        <Divider />

        <Box>
          <Heading as="h3" size="lg" fontFamily="brand.secondary" mb={4} color="brand.textDark">
            Shipping Information
          </Heading>
          <Text color="brand.textLight"><Text as="span" fontWeight="medium" color="brand.textDark">Name:</Text> {shippingAddress.fullName}</Text>
          <Text color="brand.textLight"><Text as="span" fontWeight="medium" color="brand.textDark">Address:</Text> {shippingAddress.address}, {shippingAddress.city}, {shippingAddress.postalCode}</Text>
          <Text color="brand.textLight"><Text as="span" fontWeight="medium" color="brand.textDark">Country:</Text> {shippingAddress.country}</Text>
        </Box>

        <Divider />

        <Box textAlign="center" mt={6}>
          <Button
            as={RouterLink}
            to="/"
            colorScheme="blue"
            variant="solid"
            size="lg"
            leftIcon={<Icon as={FaShoppingBag} />}
            bg="brand.primary"
            color="white"
            _hover={{ bg: 'blue.600' }}
            fontFamily="brand.secondary"
          >
            Continue Shopping
          </Button>
        </Box>
      </VStack>
    </Box>
  );
};

export default OrderConfirmationPage;
