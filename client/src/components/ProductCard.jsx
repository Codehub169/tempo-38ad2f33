import React, { useState } from 'react';
import { Box, Image, Text, Badge, Button, VStack, HStack, Icon, useToast, Tooltip, Heading } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaShoppingCart, FaCheck } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';

const ProductCard = ({ product }) => {
  // Destructure all expected props, providing defaults for safety if applicable, though parent should ensure they exist.
  const { id, name, image, price = 0, conditionGrade, stock } = product;
  const { addToCart } = useCart();
  const toast = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault(); // Prevent link navigation when clicking button
    setIsAdding(true);
    // Simulate API call or async action
    setTimeout(() => {
      // Pass the whole product object as it might be needed by the cart context
      // Ensure product object contains all necessary fields for the cart (e.g., id, name, price, image, stock)
      addToCart(product, 1);
      toast({
        title: `${name} added to cart.`,
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top-right',
      });
      setIsAdding(false);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000); // Reset added state after 2s
    }, 500);
  };

  // More robust mapping for condition colors, handles variations in casing for 'Excellent', 'Good', 'Fair'
  const getConditionColorScheme = (grade) => {
    if (!grade) return 'gray';
    const lowerGrade = grade.toLowerCase();
    if (lowerGrade.includes('excellent') || lowerGrade.includes('grade a')) return 'green';
    if (lowerGrade.includes('good') || lowerGrade.includes('grade b')) return 'orange';
    if (lowerGrade.includes('fair') || lowerGrade.includes('grade c')) return 'red';
    return 'gray'; // Default fallback
  };

  return (
    <Box
      as={RouterLink}
      to={`/product/${id}`}
      borderWidth="1px"
      borderColor="var(--border-color)" // Using CSS variable, ensure Chakra theme is configured if this is intended, or use theme token like `brand.border`
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
      height="100%" // Ensures cards in a grid have same height
      role="group" // For potential parent-driven hover states if needed
    >
      <Box height="200px" overflow="hidden" display="flex" alignItems="center" justifyContent="center" p={2} bg="gray.50" borderBottomWidth="1px" borderColor="var(--border-color)">
        <Image src={image || 'https://via.placeholder.com/300x200.png?text=No+Image'} alt={name || 'Product Image'} objectFit="contain" maxH="100%" maxW="100%" transition="transform 0.2s ease-in-out" _groupHover={{ transform: 'scale(1.05)'}} />
      </Box>

      <VStack p={4} spacing={3} align="stretch" flexGrow={1}> {/* flexGrow pushes button to bottom */}
        <Heading as="h3" size="sm" noOfLines={2} fontFamily="var(--font-secondary)" color="var(--text-dark)" minHeight={{ base: "2.8em", md: "3em" }} title={name}>
          {name || 'Unnamed Product'}
        </Heading>
        
        <HStack justifyContent="space-between" alignItems="center">
            {conditionGrade && (
                 <Tooltip label={`Condition: ${conditionGrade}`} placement="top" hasArrow arrowSize={8}>
                    <Badge 
                        colorScheme={getConditionColorScheme(conditionGrade)} 
                        variant="subtle"
                        px={2}
                        py={1} // Slightly increased padding for better readability
                        borderRadius="md"
                        textTransform="capitalize"
                        fontSize="xs"
                    >
                        {conditionGrade}
                    </Badge>
                 </Tooltip>
            )}
            {stock !== undefined && stock <= 5 && stock > 0 && (
                <Text fontSize="xs" color="red.500" fontWeight="medium">Only {stock} left!</Text>
            )}
             {stock === 0 && (
                <Text fontSize="xs" color="red.500" fontWeight="bold">Out of Stock</Text>
            )}
        </HStack>

        <Text fontSize="xl" fontWeight="bold" color="var(--primary-color)" mt="auto"> {/* mt="auto" pushes price up if content above is short */}
          ${price.toFixed(2)}
        </Text>

        <Button
          mt={2} // Ensure some space above button
          colorScheme={added ? 'green' : 'blue'} // Chakra's color schemes
          bg={added ? 'var(--accent-color)' : 'var(--primary-color)'} // Use CSS variables for specific colors if Chakra theme isn't fully customized for these names
          color="white"
          _hover={{ bg: added ? 'green.600' : 'blue.600' }} // Standard Chakra hover for color schemes
          leftIcon={added ? <Icon as={FaCheck} /> : <Icon as={FaShoppingCart} />}
          onClick={handleAddToCart}
          isLoading={isAdding}
          loadingText="Adding..."
          isDisabled={isAdding || added || stock === 0}
          w="full"
          fontFamily="var(--font-secondary)"
          size="md" // Consistent button size
          py={5} // Padding for button height
        >
          {added ? 'Added!' : (stock === 0 ? 'Out of Stock' : 'Add to Cart')}
        </Button>
      </VStack>
    </Box>
  );
};

export default ProductCard;
