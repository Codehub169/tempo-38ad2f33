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
const LoginPage = lazy(() => import('./pages/LoginPage')); // Added
const RegisterPage = lazy(() => import('./pages/RegisterPage')); // Added
const CategoryPage = lazy(() => import('./pages/CategoryPage')); // Added

// Fallback component for Suspense
const SuspenseFallback = () => (
  <Flex justify="center" align="center" flexGrow={1} width="100%" minHeight="calc(100vh - 140px)">
    <Spinner 
      size="xl" 
      color="brand.primary"
      thickness="4px" 
      label="Loading page..." 
      aria-label="Loading page content"
      speed="0.65s"
      emptyColor='gray.200'
    />
  </Flex>
);

function App() {
  return (
    <Box display="flex" flexDirection="column" minH="100vh" bg="gray.50">
      <Navbar />
      <Box as="main" flexGrow={1} width="100%">
        <Suspense fallback={<SuspenseFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} /> {/* Added */}
            <Route path="/register" element={<RegisterPage />} /> {/* Added */}
            <Route path="/category/:categoryName" element={<CategoryPage />} /> {/* Added */}
            <Route path="/product/:productId" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
            {/* <Route path="*" element={<NotFoundPage />} /> */}
          </Routes>
        </Suspense>
      </Box>
      <Footer />
    </Box>
  );
}

export default App;
