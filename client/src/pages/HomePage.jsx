import React, { useEffect, useState, useContext } from 'react';
import { Box, Container, Flex, Heading, Text, SimpleGrid, VStack, Select, RangeSlider, RangeSliderTrack, RangeSliderFilledTrack, RangeSliderThumb, Button, Spinner, Alert, AlertIcon, Image, Link as ChakraLink } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
// import { getProducts } from '../services/api'; // Assuming api.js will be created
import { CartContext } from '../contexts/CartContext'; // To update cart count in header if needed

// Mock API call for now
const getProducts = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: '1', name: 'Refurbished iPhone 12', price: 499.00, condition: 'Grade A: Excellent', imageUrl: 'https://via.placeholder.com/300x200.png?text=Refurbished+iPhone+12', category: 'Mobiles' },
        { id: '2', name: 'Refurbished Samsung 55" QLED TV', price: 650.00, condition: 'Grade B: Good', imageUrl: 'https://via.placeholder.com/300x200.png?text=Refurbished+Samsung+TV', category: 'TVs' },
        { id: '3', name: 'Refurbished MacBook Pro 13"', price: 899.00, condition: 'Grade A: Excellent', imageUrl: 'https://via.placeholder.com/300x200.png?text=Refurbished+MacBook+Pro', category: 'Laptops' },
        { id: '4', name: 'Refurbished LG Double Door Fridge', price: 550.00, condition: 'Grade B: Good', imageUrl: 'https://via.placeholder.com/300x200.png?text=Refurbished+Fridge', category: 'Fridges' },
        { id: '5', name: 'Refurbished Split AC Unit 1.5 Ton', price: 320.00, condition: 'Grade A: Excellent', imageUrl: 'https://via.placeholder.com/300x200.png?text=Refurbished+AC+Unit', category: 'ACs' },
        { id: '6', name: 'Refurbished Gaming Laptop XYZ', price: 750.00, condition: 'Grade A: Excellent', imageUrl: 'https://via.placeholder.com/300x200.png?text=Refurbished+Gaming+Laptop', category: 'Laptops' },
      ]);
    }, 1000);
  });
};


const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [conditionFilter, setConditionFilter] = useState('All');
  const [priceRange, setPriceRange] = useState([50, 2000]);
  const { cart } = useContext(CartContext); // Access cart to potentially display count or for other logic

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        setProducts(data);
        setFilteredProducts(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch products. Please try again later.');
        console.error(err);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let tempProducts = [...products];

    if (categoryFilter !== 'All') {
      tempProducts = tempProducts.filter(p => p.category === categoryFilter);
    }

    if (conditionFilter !== 'All') {
      // This is a simplified filter. In a real app, condition might be more structured.
      tempProducts = tempProducts.filter(p => p.condition.includes(conditionFilter.split(' ')[1])); 
    }

    tempProducts = tempProducts.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    setFilteredProducts(tempProducts);
  }, [products, categoryFilter, conditionFilter, priceRange]);

  const categories = ['All', 'Mobiles', 'TVs', 'Laptops', 'Fridges', 'ACs', 'Appliances'];
  const conditions = ['All', 'Grade A (Excellent)', 'Grade B (Good)', 'Grade C (Fair)'];

  return (
    <Box>
      {/* Hero Section */}
      <Box 
        bgImage="linear-gradient(to right, rgba(0, 123, 255, 0.8), rgba(0, 80, 180, 0.8)), url('https://via.placeholder.com/1200x400.png?text=Refurbished+Electronics+Banner')"
        bgSize="cover"
        bgPosition="center"
        color="white"
        py={{ base: '12', md: '20' }}
        textAlign="center"
        borderRadius={{ base: 'none', md: 'lg' }}
        mx={{ base: '-15px', md: '0'}}
        mb={{ base: 8, md: 10 }}
      >
        <Container maxW="container.md">
          <Heading as="h1" size={{ base: 'xl', md: '2xl' }} fontFamily="var(--font-secondary)" mb={4}>
            Find Your Next Tech Treasure
          </Heading>
          <Text fontSize={{ base: 'lg', md: 'xl' }} mb={6} maxW="600px" mx="auto">
            Shop certified refurbished electronics and appliances with confidence. Quality guaranteed, prices you'll love.
          </Text>
          <Button as={RouterLink} to="#products-section" colorScheme="green" size="lg" className="btn btn-primary" _hover={{ bg: 'green.600' }} px={8} py={6} borderRadius="full">
            Shop All Products
          </Button>
        </Container>
      </Box>

      <Container maxW="container.xl" py={5} id="products-section">
        <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
          {/* Filters Sidebar */}
          <Box w={{ base: 'full', md: '280px' }} p={5} bg="gray.50" borderRadius="lg" h="fit-content" shadow="sm">
            <VStack spacing={6} align="stretch">
              <Box>
                <Heading as="h4" size="md" fontFamily="var(--font-secondary)" mb={3}>Categories</Heading>
                <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} borderColor="var(--border-color)">
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </Select>
              </Box>
              <Box>
                <Heading as="h4" size="md" fontFamily="var(--font-secondary)" mb={3}>Condition</Heading>
                <Select value={conditionFilter} onChange={(e) => setConditionFilter(e.target.value)} borderColor="var(--border-color)">
                  {conditions.map(cond => <option key={cond} value={cond}>{cond}</option>)}
                </Select>
              </Box>
              <Box>
                <Heading as="h4" size="md" fontFamily="var(--font-secondary)" mb={3}>Price Range</Heading>
                <RangeSlider 
                  aria-label={['min', 'max']}
                  defaultValue={[50, 2000]}
                  min={0}
                  max={3000} 
                  step={50}
                  onChangeEnd={(val) => setPriceRange(val)}
                >
                  <RangeSliderTrack bg="blue.100">
                    <RangeSliderFilledTrack bg="var(--primary-color)" />
                  </RangeSliderTrack>
                  <RangeSliderThumb boxSize={6} index={0} bg="var(--primary-color)" />
                  <RangeSliderThumb boxSize={6} index={1} bg="var(--primary-color)" />
                </RangeSlider>
                <Flex justifyContent="space-between" mt={2} fontSize="sm" color="var(--text-light)">
                  <Text>${priceRange[0]}</Text>
                  <Text>${priceRange[1]}</Text>
                </Flex>
              </Box>
              {/* <Button colorScheme="blue" className="btn btn-primary" w="full">Apply Filters</Button> */} 
              {/* Filtering is live, so apply button might not be needed, or can trigger a specific re-fetch */}
            </VStack>
          </Box>

          {/* Product Grid */}
          <Box flex={1}>
            <Heading as="h2" size="lg" fontFamily="var(--font-secondary)" mb={6}>Featured Products</Heading>
            {loading && <Flex justify="center" align="center" h="300px"><Spinner size="xl" color="var(--primary-color)" /></Flex>}
            {error && <Alert status="error" borderRadius="md"><AlertIcon />{error}</Alert>}
            {!loading && !error && (
              <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={6}>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))
                ) : (
                  <Text>No products match your current filters.</Text>
                )}
              </SimpleGrid>
            )}
             {!loading && !error && products.length === 0 && (
                <Text textAlign="center" py={10}>No products available at the moment. Please check back later.</Text>
            )}
          </Box>
        </Flex>

         <Box textAlign="center" py={16} bg="gray.50" mt={10} borderRadius="lg">
            <Heading as="h2" size="xl" fontFamily="var(--font-secondary)" mb={4}>More Products Coming Soon!</Heading>
            <Text fontSize="lg" color="var(--text-light)">We are constantly updating our inventory with high-quality refurbished items.</Text>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;
