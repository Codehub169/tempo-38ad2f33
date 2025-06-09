import React, { useState } from 'react';
import { Box, Image, Text, Badge, Button, VStack, HStack, Icon, useToast, Tooltip, Heading } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaShoppingCart, FaCheck } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';

const ProductCard = ({ product }) => {
  const { id, name, image, price, conditionGrade, stock } = product;
  const { addItem } = useCart();
  const toast = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault(); // Prevent link navigation when clicking button
    setIsAdding(true);
    // Simulate API call or async action
    setTimeout(() => {
      addItem(product, 1);
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

  const conditionColors = {
    'Grade A': 'green',
    'Grade B': 'orange',
    'Grade C': 'red',
    'Excellent': 'green',
    'Good': 'orange',
    'Fair': 'red',
  };

  return (
    <Box
      as={RouterLink}
      to={`/product/${id}`}
      borderWidth="1px"
      borderColor="brand.border"
      borderRadius="lg"
      overflow="hidden"
      bg="white"
      transition="all 0.3s ease-in-out"
      _hover={{
        boxShadow: 'lg',
        transform: 'translateY(-5px)',
      }}
      display="flex"
      flexDirection="column"
      height="100%" // Ensures cards in a grid have same height
    >
      <Box height="200px" overflow="hidden" display="flex" alignItems="center" justifyContent="center" p={2} bg="gray.50">
        <Image src={image || 'https://via.placeholder.com/300x200.png?text=No+Image'} alt={name} objectFit="contain" maxH="100%" maxW="100%" />
      </Box>

      <VStack p={4} spacing={3} align="stretch" flexGrow={1}> {/* flexGrow pushes button to bottom */}
        <Heading as="h3" size="md" noOfLines={2} fontFamily="brand.secondary" color="brand.textDark" minHeight="3em">
          {name}
        </Heading>
        
        <HStack justifyContent="space-between" alignItems="center">
            {conditionGrade && (
                 <Tooltip label={`Condition: ${conditionGrade}`} placement="top" hasArrow>
                    <Badge 
                        colorScheme={conditionColors[conditionGrade] || 'gray'} 
                        variant="subtle"
                        px={2}
                        py={0.5}
                        borderRadius="md"
                        textTransform="capitalize"
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

        <Text fontSize="xl" fontWeight="bold" color="brand.primary" mt="auto"> {/* mt="auto" pushes price up if content above is short */}
          ${price.toFixed(2)}
        </Text>

        <Button
          mt={2} // Ensure some space above button
          colorScheme={added ? 'green' : 'blue'}
          bg={added ? 'brand.accent' : 'brand.primary'}
          color="white"
          _hover={{ bg: added ? 'green.600' : 'blue.600' }}
          leftIcon={added ? <Icon as={FaCheck} /> : <Icon as={FaShoppingCart} />}
          onClick={handleAddToCart}
          isLoading={isAdding}
          loadingText="Adding..."
          isDisabled={isAdding || added || stock === 0}
          w="full"
          fontFamily="brand.secondary"
        >
          {added ? 'Added!' : (stock === 0 ? 'Out of Stock' : 'Add to Cart')}
        </Button>
      </VStack>
    </Box>
  );
};

export default ProductCard;
