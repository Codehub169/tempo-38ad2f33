import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, Container, Flex, Heading, Text, Image, Button, 
  SimpleGrid, VStack, HStack, Breadcrumb, BreadcrumbItem, 
  BreadcrumbLink, Spinner, Alert, AlertIcon, Tag, TagLabel, 
  TagLeftIcon, NumberInput, NumberInputField, NumberInputStepper, 
  NumberIncrementStepper, NumberDecrementStepper, Icon, useToast
} from '@chakra-ui/react';
import { FaShieldAlt, FaUndo, FaShippingFast, FaCheckCircle, FaCartPlus } from 'react-icons/fa';
import { getProductById as fetchProductByIdApi, getProducts as fetchRelatedProductsApi } from '../services/api'; 
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import ProductCard from '../components/ProductCard';

const ProductDetailPage = () => {
  const { productId } = useParams(); // Changed from id to productId to match App.jsx route
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const { addToCart, getItemQuantity } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProductData = async () => {
      try {
        setLoading(true);
        setQuantity(1);
        const fetchedProduct = await fetchProductByIdApi(productId);
        setProduct(fetchedProduct);
        setSelectedImage(fetchedProduct.images && fetchedProduct.images.length > 0 ? fetchedProduct.images[0] : fetchedProduct.image_url);
        
        if (fetchedProduct && fetchedProduct.category_name) {
          const relatedResponse = await fetchRelatedProductsApi({ category: fetchedProduct.category_name, limit: 5 });
          setRelatedProducts((relatedResponse.data || []).filter(p => p.id !== fetchedProduct.id).slice(0, 4));
        }
        setError(null);
      } catch (err) {
        setError('Failed to fetch product details. Product may not exist or an error occurred.');
        console.error('Error fetching product:', err);
        setProduct(null);
      }
      setLoading(false);
    };
    if (productId) {
        fetchProductData();
    }
  }, [productId]);

  const handleAddToCart = () => {
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
    if (product) {
      // Ensure the product object passed to addToCart has necessary fields like image_url, stock_quantity
      addToCart(product, quantity);
    }
  };

  const currentCartQuantity = product ? getItemQuantity(product.id) : 0;
  const availableStock = product ? Math.max(0, (product.stock_quantity || 0) - currentCartQuantity) : 0;
  const numberInputMax = product?.stock_quantity === 0 ? 1 : Math.min(product?.stock_quantity || 0, 10);

  if (loading) return <Flex justify="center" align="center" h="calc(100vh - 200px)"><Spinner size="xl" color="brand.primary" thickness="4px" label="Loading product details..." /></Flex>;
  if (error) return <Container py={10} centerContent><Alert status="error" borderRadius="md"><AlertIcon />{error}</Alert><Button as={RouterLink} to="/" mt={4} colorScheme="blue">Go to Homepage</Button></Container>;
  if (!product) return <Container py={10} centerContent><Text>Product not found.</Text><Button as={RouterLink} to="/" mt={4} colorScheme="blue">Go to Homepage</Button></Container>;

  return (
    <Container maxW="container.lg" py={8}>
      <Breadcrumb fontWeight="medium" fontSize="sm" mb={6} color="brand.textLight">
        <BreadcrumbItem>
          <BreadcrumbLink as={RouterLink} to="/" _hover={{ color: 'brand.primary' }}>Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink as={RouterLink} to={`/category/${product.category_name}`} _hover={{ color: 'brand.primary' }}>{product.category_name}</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage color="brand.textDark">
          <BreadcrumbLink href="#" isTruncated maxW="300px" _hover={{ textDecoration: 'none', cursor: 'default' }}>{product.name}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <Flex direction={{ base: 'column', md: 'row' }} gap={{ base: 6, md: 10 }}>
        <VStack w={{ base: 'full', md: '55%' }} align="stretch" spacing={4}>
          <Box borderWidth="1px" borderColor="brand.borderColor" borderRadius="lg" overflow="hidden" p={2} bg="white" shadow="sm" h={{ base: '320px', md: '450px' }} display="flex" alignItems="center" justifyContent="center">
            <Image src={selectedImage || 'https://via.placeholder.com/600x400.png?text=No+Image+Available'} alt={product.name} objectFit="contain" w="full" h="full" />
          </Box>
          {product.images && product.images.length > 1 && (
            <HStack spacing={3} overflowX="auto" py={2}>
              {product.images.map((img, index) => (
                <Box 
                  key={index} 
                  boxSize={{ base: '70px', md: '90px' }} 
                  borderWidth="2px" 
                  borderColor={selectedImage === img ? 'brand.primary' : 'brand.borderColor'} 
                  borderRadius="md" 
                  overflow="hidden" 
                  cursor="pointer" 
                  onClick={() => setSelectedImage(img)}
                  flexShrink={0}
                  _hover={{ borderColor: 'brand.primary'}}
                  aria-label={`View image ${index + 1}`}
                >
                  <Image src={img} alt={`Thumbnail ${product.name} ${index + 1}`} objectFit="cover" w="full" h="full" />
                </Box>
              ))}
            </HStack>
          )}
        </VStack>

        <VStack w={{ base: 'full', md: '45%' }} align="stretch" spacing={5}>
          <Heading as="h1" size="xl" fontFamily="heading" color="brand.textDark">{product.name}</Heading>
          <Text fontSize="3xl" fontWeight="bold" color="brand.primary">₹{product.price.toLocaleString('en-IN')}</Text>
          
          <Box bg="gray.50" p={4} borderRadius="md" borderWidth="1px" borderColor="brand.borderColor">
            <Tag size="lg" variant="subtle" colorScheme={product.condition?.toLowerCase().includes('excellent') ? 'green' : product.condition?.toLowerCase().includes('good') ? 'orange' : 'red'} mb={2}>
              <TagLeftIcon as={FaCheckCircle} />
              <TagLabel fontWeight="semibold">{product.condition}</TagLabel>
            </Tag>
            <Text fontSize="sm" color="brand.textLight" mb={2}>{product.description || 'No detailed condition description available.'}</Text>
            {/* Imperfections might not be directly available, this part can be adapted if backend provides it */}
          </Box>

          {product.warranty_info && (
            <HStack bg="blue.50" p={3} borderRadius="md" borderWidth="1px" borderColor="blue.200" color="blue.700">
              <Icon as={FaShieldAlt} w={5} h={5} />
              <Text fontSize="sm" fontWeight="medium">{product.warranty_info}</Text>
            </HStack>
          )}
           {product.stock_quantity === 0 && <Text color="red.500" fontWeight="bold">Out of Stock</Text>}
           {product.stock_quantity > 0 && product.stock_quantity <= 5 && <Text color="orange.500" fontWeight="medium">Only {product.stock_quantity} left in stock!</Text>}

          <HStack>
            <Text fontWeight="medium">Quantity:</Text>
            <NumberInput 
              size="md" maxW="100px" 
              defaultValue={1} min={1} 
              max={numberInputMax} // Max based on available stock or a reasonable limit like 10
              value={quantity} 
              onChange={(_, valueAsNumber) => setQuantity(isNaN(valueAsNumber) || valueAsNumber < 1 ? 1 : valueAsNumber)}
              isDisabled={product.stock_quantity === 0}
              borderColor="brand.borderColor"
            >
              <NumberInputField aria-label="Quantity" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </HStack>

          <Button 
            colorScheme="green" 
            size="lg" 
            onClick={handleAddToCart} 
            py={7}
            leftIcon={<Icon as={FaCartPlus} />}
            _hover={{ bg: 'green.600'}}
            isDisabled={product.stock_quantity === 0 || quantity <= 0 || quantity > availableStock}
          >
            {product.stock_quantity === 0 ? 'Out of Stock' : (quantity > availableStock ? 'Not enough stock' : 'Add to Cart')}
          </Button>

          <HStack spacing={4} justifyContent="center" wrap="wrap" mt={4}>
            <HStack as={Tag} size="sm" variant="outline" colorScheme="gray"><Icon as={FaCheckCircle} color="green.500" mr={1}/> <Text>Verified Refurbished</Text></HStack>
            <HStack as={Tag} size="sm" variant="outline" colorScheme="gray"><Icon as={FaUndo} color="blue.500" mr={1}/> <Text>Easy Returns</Text></HStack>
            <HStack as={Tag} size="sm" variant="outline" colorScheme="gray"><Icon as={FaShippingFast} color="orange.500" mr={1}/> <Text>Fast Shipping</Text></HStack>
          </HStack>

          {product.description && (
            <Box pt={6}>
              <Heading as="h3" size="md" fontFamily="heading" mb={3}>Product Details</Heading>
              <Text fontSize="sm" color="brand.textLight" lineHeight="tall" whiteSpace="pre-wrap">{product.description}</Text>
              {product.key_features && product.key_features.length > 0 && (
                <Box mt={4}>
                  <Heading as="h4" size="sm" fontFamily="heading" mb={2}>Key Features:</Heading>
                  <VStack as="ul" align="stretch" spacing={1} pl={5} listStyleType="disc" fontSize="sm" color="brand.textLight">
                    {product.key_features.map((feature, i) => <Text as="li" key={i}>{feature}</Text>)}
                  </VStack>
                </Box>
              )}
            </Box>
          )}
        </VStack>
      </Flex>

      {relatedProducts.length > 0 && (
        <Box mt={16} pt={8} borderTopWidth="1px" borderColor="brand.borderColor">
          <Heading as="h2" size="lg" fontFamily="heading" mb={6}>You Might Also Like</Heading>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
            {relatedProducts.map(relatedProd => (
              <ProductCard key={relatedProd.id} product={relatedProd} />
            ))}
          </SimpleGrid>
        </Box>
      )}
    </Container>
  );
};

export default ProductDetailPage;
