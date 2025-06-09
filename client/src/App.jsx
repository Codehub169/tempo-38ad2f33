import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import Navbar from './components/Navbar'; // Placeholder
import Footer from './components/Footer'; // Placeholder
import HomePage from './pages/HomePage'; // Placeholder
import ProductDetailPage from './pages/ProductDetailPage'; // Placeholder
import CartPage from './pages/CartPage'; // Placeholder
import CheckoutPage from './pages/CheckoutPage'; // Placeholder
import OrderConfirmationPage from './pages/OrderConfirmationPage'; // Placeholder

function App() {
  return (
    <Box display="flex" flexDirection="column" minH="100vh">
      <Navbar />
      <Box as="main" flexGrow={1} width="100%">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:productId" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
          {/* Add other routes as needed */}
        </Routes>
      </Box>
      <Footer />
    </Box>
  );
}

export default App;
