import React, { useState } from 'react';
import { Box, Image, Text, Badge, Button, VStack, HStack, Icon, Heading, useToast } from '@chakra-ui/react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { FaShoppingCart, FaCheck } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const ProductCard = ({ product }) => {
  // Ensure product and its properties are defined, providing defaults
  const { id, name = 'Unnamed Product', image_url, price = 0, condition, stock_quantity } = product || {};
  const { addToCart, cartItems } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault(); 
    e.stopPropagation();

    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please login to add items to your cart.',
        status: 'info',
        duration: 3000,
        isClosable: true,
        position: 'top'
      });
      navigate('/login', { state: { from: location } });
      return;
    }

    setIsAdding(true);
    setTimeout(() => {
      addToCart(product, 1); // Pass the full product object as expected by CartContext
      setIsAdding(false);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }, 500);
  };

  const getConditionColorScheme = (cond) => {
    if (!cond) return 'gray';
    const lowerCond = cond.toLowerCase();
    if (lowerCond.includes('excellent') || lowerCond.includes('grade a')) return 'green';
    if (lowerCond.includes('good') || lowerCond.includes('grade b')) return 'orange';
    if (lowerCond.includes('fair') || lowerCond.includes('grade c')) return 'red';
    return 'gray'; 
  };

  const itemInCart = cartItems.find(item => item.id === id);
  const currentQuantityInCart = itemInCart ? itemInCart.quantity : 0;
  const isOutOfStock = stock_quantity === 0;
  // Handle cases where stock_quantity might be undefined (treat as infinite or sufficiently large)
  const effectiveStock = typeof stock_quantity === 'number' ? stock_quantity : Infinity;
  const canAddToCart = !isOutOfStock && (currentQuantityInCart < effectiveStock);

  let displayCondition = condition;
  if (condition) {
    const parts = condition.split(':');
    if (parts.length > 1 && parts[1]?.trim()) {
        displayCondition = parts[1].trim();
    } else {
        const gradeParts = condition.split(' ');
        if (gradeParts.length > 1 && gradeParts[1]?.trim()) {
            displayCondition = gradeParts[1].trim();
        }
    }
  }

  return (
    <Box
      as={RouterLink}
      to={`/product/${id}`}
      borderWidth="1px"
      borderColor="brand.borderColor"
      borderRadius="lg"
      overflow="hidden"
      bg="white"
      transition="all 0.2s ease-in-out"
      _hover={{
        boxShadow: 'lg',
        transform: 'translateY(-4px)',
      }}
      display="flex"
      flexDirection="column"
      height="100%" 
      role="group"
      textDecoration="none"
    >
      <Box height="200px" overflow="hidden" display="flex" alignItems="center" justifyContent="center" p={2} bg="gray.50" borderBottomWidth="1px" borderColor="brand.borderColor">
        <Image src={image_url || 'https://via.placeholder.com/300x200.png?text=No+Image'} alt={name} maxH="100%" maxW="100%" objectFit="contain" transition="transform 0.2s ease-in-out" _groupHover={{ transform: 'scale(1.05)' }}/>
      </Box>

      <VStack p={4} spacing={3} align="stretch" flexGrow={1}>
        <Heading as="h3" size="sm" fontWeight="medium" noOfLines={2} color="brand.textDark" title={name} minHeight="40px">
          {name}
        </Heading>

        <HStack justifyContent="space-between" alignItems="center">
          <Text fontSize="xl" fontWeight="bold" color="brand.primary">
            ₹{typeof price === 'number' ? price.toLocaleString('en-IN') : 'N/A'}
          </Text>
          {condition && (
            <Badge 
              colorScheme={getConditionColorScheme(condition)}
              variant="subtle"
              px={2}
              py={0.5}
              borderRadius="md"
              fontSize="xs"
              textTransform="capitalize"
            >
              {displayCondition}
            </Badge>
          )}
        </HStack>

        {typeof stock_quantity === 'number' && stock_quantity > 0 && stock_quantity <= 5 && (
          <Text fontSize="xs" color="orange.500" fontWeight="medium">
            Only {stock_quantity} left in stock!
          </Text>
        )}
        {isOutOfStock && (
            <Text fontSize="xs" color="red.500" fontWeight="bold">
                Out of Stock
            </Text>
        )}
      </VStack>

      <HStack 
        p={4} 
        borderTopWidth="1px" 
        borderColor="brand.borderColor" 
        mt="auto"
      >
        <Button 
          variant={added ? "solid" : "outline"}
          colorScheme={added ? "green" : "blue"}
          size="sm" 
          flexGrow={1}
          onClick={handleAddToCart}
          isLoading={isAdding}
          loadingText="Adding..."
          isDisabled={isOutOfStock || !canAddToCart || added || currentQuantityInCart >= effectiveStock}
          leftIcon={added ? <Icon as={FaCheck}/> : <Icon as={FaShoppingCart} />}
          _hover={{ 
            ...( (isOutOfStock || !canAddToCart || added || currentQuantityInCart >= effectiveStock) ? {} : { 
                bg: added ? 'green.600' : 'blue.500', 
                color: 'white', 
                borderColor: added ? 'green.600' : 'blue.500' 
            })
          }}
          w="full"
        >
          {added ? 'Added!' : isOutOfStock ? 'Out of Stock' : (!canAddToCart || currentQuantityInCart >= effectiveStock) ? 'Max in Cart' : 'Add to Cart'}
        </Button>
      </HStack>
    </Box>
  );
};

export default ProductCard;
