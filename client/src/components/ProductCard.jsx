import React, { useState } from 'react';
import { Box, Image, Text, Badge, Button, VStack, HStack, Icon, Heading } from '@chakra-ui/react'; // Removed useToast as it's handled by CartContext
import { Link as RouterLink } from 'react-router-dom';
import { FaShoppingCart, FaCheck } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';

const ProductCard = ({ product }) => {
  const { id, name, image, price = 0, conditionGrade, stock } = product;
  const { addToCart, cartItems } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault(); 
    e.stopPropagation(); // Stop propagation to prevent RouterLink navigation when button is clicked
    setIsAdding(true);
    
    // Simulate API call or async action
    setTimeout(() => {
      addToCart(product, 1); // CartContext will handle the toast notification
      setIsAdding(false);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000); // Reset added state after 2s
    }, 500);
  };

  const getConditionColorScheme = (grade) => {
    if (!grade) return 'gray';
    const lowerGrade = grade.toLowerCase();
    if (lowerGrade.includes('excellent') || lowerGrade.includes('grade a')) return 'green';
    if (lowerGrade.includes('good') || lowerGrade.includes('grade b')) return 'orange'; // Changed from yellow for better contrast/meaning
    if (lowerGrade.includes('fair') || lowerGrade.includes('grade c')) return 'red';
    return 'gray'; 
  };

  const itemInCart = cartItems.find(item => item.id === id);
  const currentQuantityInCart = itemInCart ? itemInCart.quantity : 0;
  const isOutOfStock = stock === 0;
  const canAddToCart = !isOutOfStock && (stock === undefined || currentQuantityInCart < stock); // Handle undefined stock as infinite
  const stockAvailable = stock === undefined ? Infinity : stock;

  // Attempt to shorten condition grade display text
  let displayCondition = conditionGrade;
  if (conditionGrade) {
    const parts = conditionGrade.split(':');
    if (parts.length > 1 && parts[1].trim()) {
        displayCondition = parts[1].trim();
    } else {
        const gradeParts = conditionGrade.split(' ');
        if (gradeParts.length > 1 && gradeParts[1].trim()) {
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
      textDecoration="none" // Remove underline from link
    >
      <Box height="200px" overflow="hidden" display="flex" alignItems="center" justifyContent="center" p={2} bg="gray.50" borderBottomWidth="1px" borderColor="brand.borderColor">
        <Image src={image || 'https://via.placeholder.com/300x200.png?text=No+Image'} alt={name || 'Product Image'} maxH="100%" maxW="100%" objectFit="contain" transition="transform 0.2s ease-in-out" _groupHover={{ transform: 'scale(1.05)' }}/>
      </Box>

      <VStack p={4} spacing={3} align="stretch" flexGrow={1}>
        <Heading as="h3" size="sm" fontWeight="medium" noOfLines={2} color="brand.textDark" title={name} minHeight="40px">
          {name || 'Unnamed Product'}
        </Heading>

        <HStack justifyContent="space-between" alignItems="center">
          <Text fontSize="xl" fontWeight="bold" color="brand.primary">
            ${typeof price === 'number' ? price.toFixed(2) : 'N/A'}
          </Text>
          {conditionGrade && (
            <Badge 
              colorScheme={getConditionColorScheme(conditionGrade)}
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

        {stock !== undefined && stock > 0 && stock <= 5 && (
          <Text fontSize="xs" color="orange.500" fontWeight="medium">
            Only {stock} left in stock!
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
        mt="auto" // Push to bottom
      >
        <Button 
          variant={added ? "solid" : "outline"}
          colorScheme={added ? "green" : "blue"}
          size="sm" 
          flexGrow={1}
          onClick={handleAddToCart}
          isLoading={isAdding}
          loadingText="Adding..."
          isDisabled={isOutOfStock || !canAddToCart || added || currentQuantityInCart >= stockAvailable}
          leftIcon={added ? <Icon as={FaCheck}/> : <Icon as={FaShoppingCart} />}
          _hover={{ 
            ...( (isOutOfStock || !canAddToCart || added || currentQuantityInCart >= stockAvailable) ? {} : { 
                bg: added ? 'green.600' : 'blue.500', 
                color: 'white', 
                borderColor: added ? 'green.600' : 'blue.500' 
            })
          }}
          w="full"
        >
          {added ? 'Added!' : isOutOfStock ? 'Out of Stock' : (!canAddToCart || currentQuantityInCart >= stockAvailable) ? 'Max in Cart' : 'Add to Cart'}
        </Button>
      </HStack>
    </Box>
  );
};

export default ProductCard;
