import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Box, Container, Flex, Heading, Text, SimpleGrid, Spinner, Alert, AlertIcon, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Button } from '@chakra-ui/react';
import ProductCard from '../components/ProductCard';
import { getProducts as fetchProductsApi } from '../services/api'; // Using the actual API

const CategoryPage = () => {
  const { categoryName } = useParams(); // e.g., 'Mobiles', 'TVs'
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageTitle, setPageTitle] = useState('');

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Capitalize categoryName for display if needed, or use as is if backend is case-sensitive
        const title = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
        setPageTitle(title);
        
        // Fetch products for this category
        // The getProducts API handles filtering by category name if provided in query
        const response = await fetchProductsApi({ category: categoryName, limit: 20 }); // Fetch up to 20 products for the category
        setProducts(response.data || []); 
      } catch (err) {
        console.error(`Error fetching products for category ${categoryName}:`, err);
        setError('Failed to fetch products for this category. Please try again later.');
        setProducts([]);
      }
      setLoading(false);
    };

    if (categoryName) {
      fetchCategoryProducts();
    }

    window.scrollTo(0, 0);
  }, [categoryName]);

  return (
    <Container maxW="container.xl" py={8}>
      <Breadcrumb fontWeight="medium" fontSize="sm" mb={6} color="brand.textLight">
        <BreadcrumbItem>
          <BreadcrumbLink as={RouterLink} to="/" _hover={{ color: 'brand.primary' }}>Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage color="brand.textDark">
          {/* The href for category breadcrumb should ideally point to the same page, or be non-interactive if it's the current page */}
          <BreadcrumbLink href={`/category/${categoryName}`} _hover={{ textDecoration: 'none', cursor: 'default' }}>{pageTitle || categoryName}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <Heading as="h1" size="xl" fontFamily="heading" mb={8} color="brand.textDark">
        {pageTitle ? `${pageTitle} Products` : 'Products'}
      </Heading>

      {loading && (
        <Flex justify="center" align="center" h="300px">
          <Spinner size="xl" color="brand.primary" thickness="4px" label={`Loading ${pageTitle || categoryName} products...`} />
        </Flex>
      )}
      {error && (
        <Alert status="error" borderRadius="md" mb={6}>
          <AlertIcon />
          {error}
          <Button as={RouterLink} to="/" ml="auto" colorScheme="blue" size="sm">
            Go Home
          </Button>
        </Alert>
      )}
      {!loading && !error && products.length > 0 && (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </SimpleGrid>
      )}
      {!loading && !error && products.length === 0 && (
        <Box textAlign="center" py={10}>
          <Text fontSize="lg" color="brand.textLight">
            No products found in the "{pageTitle || categoryName}" category at the moment.
          </Text>
          <Button as={RouterLink} to="/" mt={4} colorScheme="blue">
            Browse Other Categories
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default CategoryPage;
