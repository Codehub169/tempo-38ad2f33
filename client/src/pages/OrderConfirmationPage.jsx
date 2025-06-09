import React, { useEffect } from 'react';
import { useLocation, Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Heading, Text, VStack, Button, Divider, SimpleGrid, Image, Icon, useToast, Container } from '@chakra-ui/react';
import { FaCheckCircle, FaShoppingBag } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';

const OrderConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { clearCart } = useCart(); // Intentionally not clearing cart here, moved to CheckoutPage after successful navigation state pass
  const orderDetails = location.state?.orderDetails;

  useEffect(() => {
    if (!orderDetails) {
      toast({
        title: 'No order details found.',
        description: 'Redirecting to homepage.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      navigate('/');
    } else {
      // Cart is cleared in CheckoutPage *before* navigating here with state.
      // If we want to ensure it's cleared even if that failed, we could do it here,
      // but it's generally better to do it once upon successful order submission.
      // For this implementation, we assume CheckoutPage handled it.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderDetails, navigate, toast]); // clearCart removed from deps as it's not called here

  if (!orderDetails) {
    // This will be shown briefly before useEffect navigates away
    return (
      <Container maxW="container.lg" textAlign="center" py={10} px={6}>
        <Icon as={FaCheckCircle} w={16} h={16} color="brand.warning" mb={4} /> {/* Changed to warning for this state */}
        <Heading as="h2" size="xl" mt={6} mb={2} color="brand.textDark">
          Verifying order details...
        </Heading>
        <Text color="brand.textLight">
          If you are not redirected, please check your cart or return to the homepage.
        </Text>
        <Button as={RouterLink} to="/" colorScheme="blue" mt={4} variant="solid">
          Go to Homepage
        </Button>
      </Container>
    );
  }

  const { orderId, items, total, shippingAddress, customerEmail, orderDate } = orderDetails;

  return (
    <Container maxW="container.lg" p={{ base: 4, md: 8 }} bg="white" borderRadius="lg" boxShadow="md" my={8}>
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Icon as={FaCheckCircle} w={16} h={16} color="brand.accent" mb={4} />
          <Heading as="h1" size="2xl" fontFamily="heading" color="brand.primary">
            Thank You For Your Order!
          </Heading>
          <Text fontSize="lg" color="gray.600" mt={2}>
            Your order <Text as="span" fontWeight="bold" color="brand.textDark">#{orderId}</Text> has been placed successfully.
          </Text>
          <Text fontSize="sm" color="brand.textLight" mt={1}>
            A confirmation email has been sent to {customerEmail}.
          </Text>
          <Text fontSize="xs" color="brand.textLight" mt={1}>
            Order placed on: {new Date(orderDate).toLocaleDateString()} at {new Date(orderDate).toLocaleTimeString()}
          </Text>
        </Box>

        <Divider borderColor="brand.borderColor" />

        <Box>
          <Heading as="h3" size="lg" fontFamily="heading" mb={4} color="brand.textDark">
            Order Summary
          </Heading>
          <VStack spacing={4} align="stretch" divider={<Divider borderColor="brand.borderColor" />}>
            {items.map((item) => (
              <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4} key={item.id} alignItems="center" py={2}>
                <Image 
                    src={item.imageUrl || `https://via.placeholder.com/100x100.png?text=${encodeURIComponent(item.name)}`} 
                    alt={item.name} 
                    boxSize="80px" 
                    objectFit="contain" 
                    borderRadius="md" 
                    borderWidth="1px"
                    borderColor="brand.borderColor"
                    p={1}
                />
                <Box>
                  <Text fontWeight="bold" color="brand.textDark" noOfLines={2}>{item.name}</Text>
                  <Text fontSize="sm" color="brand.textLight">Qty: {item.quantity}</Text>
                </Box>
                <Text fontWeight="medium" color="brand.primary" textAlign={{ base: "left", sm: "right" }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </Text>
              </SimpleGrid>
            ))}
          </VStack>
          <Box textAlign="right" mt={4} borderTopWidth="1px" borderColor="brand.borderColor" pt={4}>
            <Text fontSize="xl" fontWeight="bold" color="brand.textDark">Total: ${total.toFixed(2)}</Text>
          </Box>
        </Box>

        <Divider borderColor="brand.borderColor" />

        <Box>
          <Heading as="h3" size="lg" fontFamily="heading" mb={4} color="brand.textDark">
            Shipping Information
          </Heading>
          <Text color="brand.textLight"><Text as="span" fontWeight="medium" color="brand.textDark">Name:</Text> {shippingAddress.fullName}</Text>
          <Text color="brand.textLight"><Text as="span" fontWeight="medium" color="brand.textDark">Address:</Text> {shippingAddress.address}, {shippingAddress.city}, {shippingAddress.postalCode}, {shippingAddress.country}</Text>
        </Box>

        <Divider borderColor="brand.borderColor" />

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
            fontFamily="heading"
          >
            Continue Shopping
          </Button>
        </Box>
      </VStack>
    </Container>
  );
};

export default OrderConfirmationPage;
