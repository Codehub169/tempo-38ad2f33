import React, { useEffect, useState } from 'react';
import { Box, Container, Flex, Heading, Text, SimpleGrid, VStack, Select, RangeSlider, RangeSliderTrack, RangeSliderFilledTrack, RangeSliderThumb, Button, Spinner, Alert, AlertIcon } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { getProducts as fetchProductsApi, getCategories as fetchCategoriesApi } from '../services/api';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [conditionFilter, setConditionFilter] = useState('All');
  // Adjusted for INR, max price can be dynamic based on products, using 150000 as a general max for slider
  const [priceRange, setPriceRange] = useState([0, 150000]); 
  const [sliderMax, setSliderMax] = useState(150000);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [productsResponse, categoriesResponse] = await Promise.all([
          fetchProductsApi({ limit: 50 }), // Fetch a larger initial set for client-side filtering or rely on backend for all filters
          fetchCategoriesApi()
        ]);
        
        setProducts(productsResponse.data || []);
        setFilteredProducts(productsResponse.data || []);
        setCategories([{ id: 'all', name: 'All' }, ...(categoriesResponse || [])]);
        
        // Dynamically set slider max based on fetched products
        if (productsResponse.data && productsResponse.data.length > 0) {
          const maxPrice = productsResponse.data.reduce((max, p) => (p.price > max ? p.price : max), 0);
          const newSliderMax = Math.ceil(maxPrice / 10000) * 10000 + 10000; // Round up to next 10k and add buffer
          setSliderMax(newSliderMax > 0 ? newSliderMax : 150000);
          setPriceRange([0, newSliderMax > 0 ? newSliderMax : 150000]);
        }
        setError(null);
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
        console.error('Error fetching data:', err);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    let tempProducts = [...products];

    if (categoryFilter !== 'All') {
      tempProducts = tempProducts.filter(p => p.category_name === categoryFilter);
    }

    if (conditionFilter !== 'All') {
      // Assuming conditionFilter is like "Excellent", "Good", "Fair"
      tempProducts = tempProducts.filter(p => p.condition === conditionFilter);
    }

    tempProducts = tempProducts.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    setFilteredProducts(tempProducts);
  }, [products, categoryFilter, conditionFilter, priceRange]);

  const conditionOptions = ['All', 'Excellent', 'Good', 'Fair'];

  return (
    <Box>
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
          <Heading as="h1" size={{ base: 'xl', md: '2xl' }} fontFamily="heading" mb={4}>
            Find Your Next Tech Treasure
          </Heading>
          <Text fontSize={{ base: 'lg', md: 'xl' }} mb={6} maxW="600px" mx="auto">
            Shop certified refurbished electronics and appliances with confidence. Quality guaranteed, prices you'll love.
          </Text>
          <Button as={RouterLink} to="#products-section" colorScheme="green" size="lg" _hover={{ bg: 'green.600' }} px={8} py={6} borderRadius="full">
            Shop All Products
          </Button>
        </Container>
      </Box>

      <Container maxW="container.xl" py={5} id="products-section">
        <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
          <Box w={{ base: 'full', md: '280px' }} p={5} bg="gray.50" borderRadius="lg" h="fit-content" shadow="sm" position={{ md: 'sticky' }} top={{ md: '80px' }}>
            <VStack spacing={6} align="stretch">
              <Box>
                <Heading as="h4" size="md" fontFamily="heading" mb={3}>Categories</Heading>
                <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} borderColor="brand.borderColor" aria-label="Category Filter">
                  {categories.map(cat => <option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>)}
                </Select>
              </Box>
              <Box>
                <Heading as="h4" size="md" fontFamily="heading" mb={3}>Condition</Heading>
                <Select value={conditionFilter} onChange={(e) => setConditionFilter(e.target.value)} borderColor="brand.borderColor" aria-label="Condition Filter">
                  {conditionOptions.map(cond => <option key={cond} value={cond}>{cond}</option>)}
                </Select>
              </Box>
              <Box>
                <Heading as="h4" size="md" fontFamily="heading" mb={3}>Price Range</Heading>
                <RangeSlider 
                  aria-label={['min price', 'max price']}
                  value={priceRange} // Controlled component
                  min={0}
                  max={sliderMax} 
                  step={1000} // Adjusted step for INR
                  onChange={(val) => setPriceRange(val)} // Use onChange for immediate feedback if needed, or onChangeEnd
                  colorScheme="blue"
                >
                  <RangeSliderTrack bg="blue.100">
                    <RangeSliderFilledTrack />
                  </RangeSliderTrack>
                  <RangeSliderThumb boxSize={6} index={0} />
                  <RangeSliderThumb boxSize={6} index={1} />
                </RangeSlider>
                <Flex justifyContent="space-between" mt={2} fontSize="sm" color="brand.textLight">
                  <Text>₹{priceRange[0].toLocaleString('en-IN')}</Text>
                  <Text>₹{priceRange[1].toLocaleString('en-IN')}</Text>
                </Flex>
              </Box>
            </VStack>
          </Box>

          <Box flex={1}>
            <Heading as="h2" size="lg" fontFamily="heading" mb={6}>Featured Products</Heading>
            {loading && <Flex justify="center" align="center" h="300px"><Spinner size="xl" color="brand.primary" thickness="4px" label="Loading products..." /></Flex>}
            {error && <Alert status="error" borderRadius="md"><AlertIcon />{error}</Alert>}
            {!loading && !error && products.length > 0 && (
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
            <Heading as="h2" size="xl" fontFamily="heading" mb={4}>More Products Coming Soon!</Heading>
            <Text fontSize="lg" color="brand.textLight">We are constantly updating our inventory with high-quality refurbished items.</Text>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;
