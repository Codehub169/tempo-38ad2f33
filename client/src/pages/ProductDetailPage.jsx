import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { 
  Box, Container, Flex, Heading, Text, Image, Button, 
  SimpleGrid, VStack, HStack, Breadcrumb, BreadcrumbItem, 
  BreadcrumbLink, Spinner, Alert, AlertIcon, Tag, TagLabel, 
  TagLeftIcon, NumberInput, NumberInputField, NumberInputStepper, 
  NumberIncrementStepper, NumberDecrementStepper, Icon 
} from '@chakra-ui/react';
import { FaShieldAlt, FaUndo, FaShippingFast, FaCheckCircle } from 'react-icons/fa'; // Example icons
// import { getProductById } from '../services/api'; // Assuming api.js for actual data fetching
import { CartContext } from '../contexts/CartContext';
import ProductCard from '../components/ProductCard'; // For related products

// Mock API call for now
const mockProducts = [
  { id: '1', name: 'Refurbished iPhone 12 - 128GB, Black', price: 499.00, condition: 'Grade A: Excellent', conditionDesc: 'This device is in excellent cosmetic condition, showing minimal to no signs of use. Fully tested and 100% functional.', imperfections: ['Barely visible micro-scratch on the back panel (less than 2mm).', 'Original box not included. Comes with a new compatible charger.'], warranty: '6-Month Seller Warranty', category: 'Mobiles', imageUrl: 'https://via.placeholder.com/600x600.png?text=iPhone+12+Main', images: ['https://via.placeholder.com/600x600.png?text=iPhone+12+Main', 'https://via.placeholder.com/600x600.png?text=iPhone+12+Front', 'https://via.placeholder.com/600x600.png?text=iPhone+12+Back', 'https://via.placeholder.com/600x600.png?text=iPhone+12+Side'], description: 'Experience the power and elegance of the iPhone 12, meticulously refurbished to meet high quality standards. Features the A14 Bionic chip, an advanced dual-camera system, and a stunning Super Retina XDR display.', features: ['Super Retina XDR display', 'A14 Bionic chip', 'Advanced dual-camera system'] },
  { id: '2', name: 'Refurbished Samsung 55" QLED TV', price: 650.00, condition: 'Grade B: Good', conditionDesc: 'Minor cosmetic blemishes, fully functional.', imperfections: ['Small scuff on stand.', 'Remote has slight wear.'], warranty: '1-Year Seller Warranty', category: 'TVs', imageUrl: 'https://via.placeholder.com/600x600.png?text=Samsung+TV+Main', images: ['https://via.placeholder.com/600x600.png?text=Samsung+TV+Main', 'https://via.placeholder.com/600x600.png?text=Samsung+TV+Angle'], description: 'A great QLED TV with vibrant colors.', features: ['55-inch QLED Panel', '4K Resolution', 'Smart TV Features'] },
  // Add more mock products as needed for related items
   { id: '7', name: 'Refurbished iPhone 11', price: 399.00, condition: 'Grade A: Excellent', imageUrl: 'https://via.placeholder.com/300x200.png?text=iPhone+11', category: 'Mobiles' },
   { id: '8', name: 'Refurbished AirPods Pro', price: 159.00, condition: 'Grade A: Excellent', imageUrl: 'https://via.placeholder.com/300x200.png?text=AirPods+Pro', category: 'Accessories' },
   { id: '9', name: 'Refurbished Samsung Galaxy S21', price: 450.00, condition: 'Grade B: Good', imageUrl: 'https://via.placeholder.com/300x200.png?text=Samsung+S21', category: 'Mobiles' },
];

const getProductById = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const product = mockProducts.find(p => p.id === id);
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
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProductById(id);
        setProduct(data);
        setSelectedImage(data.images ? data.images[0] : data.imageUrl);
        setError(null);
      } catch (err) {
        setError('Failed to fetch product details. Product may not exist or an error occurred.');
        console.error(err);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart({ ...product, quantity });
      // Optionally: Add toast notification for item added
    }
  };

  if (loading) return <Flex justify="center" align="center" h="calc(100vh - 200px)"><Spinner size="xl" color="var(--primary-color)" /></Flex>;
  if (error) return <Container py={10}><Alert status="error" borderRadius="md"><AlertIcon />{error}</Alert></Container>;
  if (!product) return <Container py={10}><Text>Product not found.</Text></Container>;

  const relatedProducts = mockProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <Container maxW="container.lg" py={8}>
      <Breadcrumb fontWeight="medium" fontSize="sm" mb={6}>
        <BreadcrumbItem>
          <BreadcrumbLink as={RouterLink} to="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink as={RouterLink} to={`/?category=${product.category}`}>{product.category}</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink href="#">{product.name}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <Flex direction={{ base: 'column', md: 'row' }} gap={10}>
        {/* Product Gallery */}
        <VStack w={{ base: 'full', md: '55%' }} align="stretch">
          <Box borderWidth="1px" borderColor="var(--border-color)" borderRadius="lg" overflow="hidden" p={2} bg="white" shadow="sm">
            <Image src={selectedImage} alt={product.name} objectFit="contain" w="full" h={{ base: '300px', md: '450px' }} />
          </Box>
          {product.images && product.images.length > 1 && (
            <HStack spacing={3} overflowX="auto" py={2}>
              {product.images.map((img, index) => (
                <Box 
                  key={index} 
                  boxSize={{ base: '70px', md: '90px' }} 
                  borderWidth="2px" 
                  borderColor={selectedImage === img ? 'var(--primary-color)' : 'var(--border-color)'} 
                  borderRadius="md" 
                  overflow="hidden" 
                  cursor="pointer" 
                  onClick={() => setSelectedImage(img)}
                  flexShrink={0}
                  _hover={{ borderColor: 'var(--primary-color)'}}
                >
                  <Image src={img} alt={`Thumbnail ${index + 1}`} objectFit="cover" w="full" h="full" />
                </Box>
              ))}
            </HStack>
          )}
        </VStack>

        {/* Product Info */}
        <VStack w={{ base: 'full', md: '45%' }} align="stretch" spacing={5}>
          <Heading as="h1" size="xl" fontFamily="var(--font-secondary)" color="var(--text-dark)">{product.name}</Heading>
          <Text fontSize="3xl" fontWeight="bold" color="var(--primary-color)">${product.price.toFixed(2)}</Text>
          
          <Box bg="gray.50" p={4} borderRadius="md" borderWidth="1px" borderColor="var(--border-color)">
            <Tag size="lg" variant="subtle" colorScheme="green" mb={2}>
              <TagLeftIcon as={FaCheckCircle} />
              <TagLabel fontWeight="semibold">{product.condition}</TagLabel>
            </Tag>
            <Text fontSize="sm" color="var(--text-light)" mb={2}>{product.conditionDesc}</Text>
            {product.imperfections && product.imperfections.length > 0 && (
              <Box>
                <Text fontWeight="semibold" fontSize="sm" mb={1}>Specific Notes:</Text>
                <VStack as="ul" align="stretch" spacing={1} pl={4} fontSize="sm">
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

          <HStack>
            <Text fontWeight="medium">Quantity:</Text>
            <NumberInput size="md" maxW="100px" defaultValue={1} min={1} max={10} value={quantity} onChange={(valueString) => setQuantity(parseInt(valueString))}>
              <NumberInputField borderColor="var(--border-color)"/>
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </HStack>

          <Button 
            colorScheme="green" 
            size="lg" 
            className="btn btn-accent" 
            onClick={handleAddToCart} 
            py={7}
            leftIcon={<Icon as={FaShippingFast} />}
            _hover={{ bg: 'green.600'}}
          >
            Add to Cart
          </Button>

          <HStack spacing={4} justifyContent="center" wrap="wrap" mt={4}>
            <HStack as={Tag} size="sm" variant="outline" colorScheme="gray"><Icon as={FaCheckCircle} color="green.500" mr={1}/> <Text>Verified Refurbished</Text></HStack>
            <HStack as={Tag} size="sm" variant="outline" colorScheme="gray"><Icon as={FaUndo} color="blue.500" mr={1}/> <Text>Easy Returns</Text></HStack>
            <HStack as={Tag} size="sm" variant="outline" colorScheme="gray"><Icon as={FaShippingFast} color="orange.500" mr={1}/> <Text>Fast Shipping</Text></HStack>
          </HStack>

          {product.description && (
            <Box pt={6}>
              <Heading as="h3" size="md" fontFamily="var(--font-secondary)" mb={3}>Product Details</Heading>
              <Text fontSize="sm" color="var(--text-light)" lineHeight="tall">{product.description}</Text>
              {product.features && product.features.length > 0 && (
                <Box mt={4}>
                  <Heading as="h4" size="sm" fontFamily="var(--font-secondary)" mb={2}>Key Features:</Heading>
                  <VStack as="ul" align="stretch" spacing={1} pl={5} listStyleType="disc" fontSize="sm" color="var(--text-light)">
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
        <Box mt={16} pt={8} borderTopWidth="1px" borderColor="var(--border-color)">
          <Heading as="h2" size="lg" fontFamily="var(--font-secondary)" mb={6}>You Might Also Like</Heading>
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
