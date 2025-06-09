import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { 
  Box, Container, Flex, Heading, Text, Image, Button, 
  SimpleGrid, VStack, HStack, Breadcrumb, BreadcrumbItem, 
  BreadcrumbLink, Spinner, Alert, AlertIcon, Tag, TagLabel, 
  TagLeftIcon, NumberInput, NumberInputField, NumberInputStepper, 
  NumberIncrementStepper, NumberDecrementStepper, Icon /* useToast removed as it's not used */
} from '@chakra-ui/react';
import { FaShieldAlt, FaUndo, FaShippingFast, FaCheckCircle, FaCartPlus } from 'react-icons/fa';
// import { getProductById as fetchProductByIdApi } from '../services/api'; // Renamed to avoid conflict
import { useCart } from '../contexts/CartContext';
import ProductCard from '../components/ProductCard';

// Mock API data for now
const mockProductsData = [
  { id: '1', name: 'Refurbished iPhone 12 - 128GB, Black', price: 499.00, condition: 'Grade A: Excellent', conditionDesc: 'This device is in excellent cosmetic condition, showing minimal to no signs of use. Fully tested and 100% functional.', imperfections: ['Barely visible micro-scratch on the back panel (less than 2mm).', 'Original box not included. Comes with a new compatible charger.'], warranty: '6-Month Seller Warranty', category: 'Mobiles', imageUrl: 'https://via.placeholder.com/600x600.png?text=iPhone+12+Main', images: ['https://via.placeholder.com/600x600.png?text=iPhone+12+Main', 'https://via.placeholder.com/600x600.png?text=iPhone+12+Front', 'https://via.placeholder.com/600x600.png?text=iPhone+12+Back', 'https://via.placeholder.com/600x600.png?text=iPhone+12+Side'], description: 'Experience the power and elegance of the iPhone 12, meticulously refurbished to meet high quality standards. Features the A14 Bionic chip, an advanced dual-camera system, and a stunning Super Retina XDR display.', features: ['Super Retina XDR display', 'A14 Bionic chip', 'Advanced dual-camera system'], stock_quantity: 10 },
  { id: '2', name: 'Refurbished Samsung 55" QLED TV', price: 650.00, condition: 'Grade B: Good', conditionDesc: 'Minor cosmetic blemishes, fully functional.', imperfections: ['Small scuff on stand.', 'Remote has slight wear.'], warranty: '1-Year Seller Warranty', category: 'TVs', imageUrl: 'https://via.placeholder.com/600x600.png?text=Samsung+TV+Main', images: ['https://via.placeholder.com/600x600.png?text=Samsung+TV+Main', 'https://via.placeholder.com/600x600.png?text=Samsung+TV+Angle'], description: 'A great QLED TV with vibrant colors.', features: ['55-inch QLED Panel', '4K Resolution', 'Smart TV Features'], stock_quantity: 5 },
  { id: '7', name: 'Refurbished iPhone 11', price: 399.00, condition: 'Grade A: Excellent', imageUrl: 'https://via.placeholder.com/300x200.png?text=iPhone+11', category: 'Mobiles', stock_quantity: 15, images: ['https://via.placeholder.com/300x200.png?text=iPhone+11'] },
  { id: '8', name: 'Refurbished AirPods Pro', price: 159.00, condition: 'Grade A: Excellent', imageUrl: 'https://via.placeholder.com/300x200.png?text=AirPods+Pro', category: 'Accessories', stock_quantity: 20, images: ['https://via.placeholder.com/300x200.png?text=AirPods+Pro'] },
  { id: '9', name: 'Refurbished Samsung Galaxy S21', price: 450.00, condition: 'Grade B: Good', imageUrl: 'https://via.placeholder.com/300x200.png?text=Samsung+S21', category: 'Mobiles', stock_quantity: 0, images: ['https://via.placeholder.com/300x200.png?text=Samsung+S21'] }, // Out of stock example
];

const getMockProductById = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const product = mockProductsData.find(p => p.id === id);
      if (product) {
        resolve(product);
      } else {
        reject(new Error('Product not found'));
      }
    }, 500);
  });
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const { addToCart, getItemQuantity } = useCart();
  // const toast = useToast(); // Not used directly, CartContext handles toasts

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top on component mount or id change
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setQuantity(1); // Reset quantity on new product load
        // const data = await fetchProductByIdApi(id); // For real API
        const data = await getMockProductById(id);
        setProduct(data);
        setSelectedImage(data.images && data.images.length > 0 ? data.images[0] : data.imageUrl);
        setError(null);
      } catch (err) {
        setError('Failed to fetch product details. Product may not exist or an error occurred.');
        console.error('Error fetching product:', err);
        setProduct(null); // Ensure product is null on error
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart({ ...product, imageUrl: product.imageUrl || product.images?.[0] }, quantity);
      // Toast is handled by CartContext as per its implementation.
    }
  };

  const currentCartQuantity = product ? getItemQuantity(product.id) : 0;
  const availableStock = product ? Math.max(0, (product.stock_quantity || 0) - currentCartQuantity) : 0;
  // max for NumberInput: if stock is 0, input is disabled, so max 1 is okay. Otherwise, min of 10 or actual stock.
  const numberInputMax = product?.stock_quantity === 0 ? 1 : Math.min(product?.stock_quantity || 0, 10);

  if (loading) return <Flex justify="center" align="center" h="calc(100vh - 200px)"><Spinner size="xl" color="brand.primary" thickness="4px" label="Loading product details..." /></Flex>;
  if (error) return <Container py={10} centerContent><Alert status="error" borderRadius="md"><AlertIcon />{error}</Alert><Button as={RouterLink} to="/" mt={4} colorScheme="blue">Go to Homepage</Button></Container>;
  if (!product) return <Container py={10} centerContent><Text>Product not found.</Text><Button as={RouterLink} to="/" mt={4} colorScheme="blue">Go to Homepage</Button></Container>;

  const relatedProducts = mockProductsData.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <Container maxW="container.lg" py={8}>
      <Breadcrumb fontWeight="medium" fontSize="sm" mb={6} color="brand.textLight">
        <BreadcrumbItem>
          <BreadcrumbLink as={RouterLink} to="/" _hover={{ color: 'brand.primary' }}>Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink as={RouterLink} to={`/?category=${product.category}`} _hover={{ color: 'brand.primary' }}>{product.category}</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage color="brand.textDark">
          <BreadcrumbLink href="#" isTruncated maxW="300px" _hover={{ textDecoration: 'none', cursor: 'default' }}>{product.name}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <Flex direction={{ base: 'column', md: 'row' }} gap={{ base: 6, md: 10 }}>
        {/* Product Gallery */}
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

        {/* Product Info */}
        <VStack w={{ base: 'full', md: '45%' }} align="stretch" spacing={5}>
          <Heading as="h1" size="xl" fontFamily="heading" color="brand.textDark">{product.name}</Heading>
          <Text fontSize="3xl" fontWeight="bold" color="brand.primary">${product.price.toFixed(2)}</Text>
          
          <Box bg="gray.50" p={4} borderRadius="md" borderWidth="1px" borderColor="brand.borderColor">
            <Tag size="lg" variant="subtle" colorScheme={product.condition.toLowerCase().includes('excellent') ? 'green' : product.condition.toLowerCase().includes('good') ? 'yellow' : 'orange'} mb={2}>
              <TagLeftIcon as={FaCheckCircle} />
              <TagLabel fontWeight="semibold">{product.condition}</TagLabel>
            </Tag>
            <Text fontSize="sm" color="brand.textLight" mb={2}>{product.conditionDesc || 'No condition description available.'}</Text>
            {product.imperfections && product.imperfections.length > 0 && (
              <Box>
                <Text fontWeight="semibold" fontSize="sm" mb={1}>Specific Notes:</Text>
                <VStack as="ul" align="stretch" spacing={1} pl={4} fontSize="sm" listStyleType="disc">
                  {product.imperfections.map((note, i) => <Text as="li" key={i}>{note}</Text>)}
                </VStack>
              </Box>
            )}
          </Box>

          {product.warranty && (
            <HStack bg="blue.50" p={3} borderRadius="md" borderWidth="1px" borderColor="blue.200" color="blue.700">
              <Icon as={FaShieldAlt} w={5} h={5} />
              <Text fontSize="sm" fontWeight="medium">{product.warranty}</Text>
            </HStack>
          )}
           {product.stock_quantity === 0 && <Text color="red.500" fontWeight="bold">Out of Stock</Text>}
           {product.stock_quantity > 0 && product.stock_quantity <= 5 && <Text color="orange.500" fontWeight="medium">Only {product.stock_quantity} left in stock!</Text>}

          <HStack>
            <Text fontWeight="medium">Quantity:</Text>
            <NumberInput 
              size="md" maxW="100px" 
              defaultValue={1} min={1} 
              max={numberInputMax}
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
              {product.features && product.features.length > 0 && (
                <Box mt={4}>
                  <Heading as="h4" size="sm" fontFamily="heading" mb={2}>Key Features:</Heading>
                  <VStack as="ul" align="stretch" spacing={1} pl={5} listStyleType="disc" fontSize="sm" color="brand.textLight">
                    {product.features.map((feature, i) => <Text as="li" key={i}>{feature}</Text>)}
                  </VStack>
                </Box>
              )}
            </Box>
          )}
        </VStack>
      </Flex>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <Box mt={16} pt={8} borderTopWidth="1px" borderColor="brand.borderColor">
          <Heading as="h2" size="lg" fontFamily="heading" mb={6}>You Might Also Like</Heading>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
            {relatedProducts.map(relatedProd => (
              <ProductCard key={relatedProd.id} product={{ ...relatedProd, image: relatedProd.imageUrl, conditionGrade: relatedProd.condition, stock: relatedProd.stock_quantity }} />
            ))}
          </SimpleGrid>
        </Box>
      )}
    </Container>
  );
};

export default ProductDetailPage;
