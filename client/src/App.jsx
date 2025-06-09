import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, Flex, Spinner } from '@chakra-ui/react';
import Navbar from './components/Navbar'; 
import Footer from './components/Footer'; 

// Dynamically import page components
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage'));

// Fallback component for Suspense
const SuspenseFallback = () => (
  <Flex justify="center" align="center" flexGrow={1} width="100%" minHeight="calc(100vh - 140px)"> {/* Adjusted minHeight for better centering considering Navbar/Footer approx height */}
    <Spinner 
      size="xl" 
      color="brand.primary" // Updated to use theme token
      thickness="4px" 
      label="Loading page..." 
      aria-label="Loading page content"
      speed="0.65s" // Default speed, can be adjusted
      emptyColor='gray.200' // Adds a subtle background to the spinner track
    />
  </Flex>
);

function App() {
  return (
    <Box display="flex" flexDirection="column" minH="100vh" bg="gray.50"> {/* Added a subtle background to the app body for consistency */}
      <Navbar />
      <Box as="main" flexGrow={1} width="100%">
        <Suspense fallback={<SuspenseFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:productId" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
            {/* Add other routes as needed, e.g., a 404 Not Found page */}
            {/* <Route path="*" element={<NotFoundPage />} /> */}
          </Routes>
        </Suspense>
      </Box>
      <Footer />
    </Box>
  );
}

export default App;
