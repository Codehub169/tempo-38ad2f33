import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, Container, FormControl, FormErrorMessage, FormLabel, Heading, Input, VStack, Text, Link as ChakraLink } from '@chakra-ui/react'; // useToast removed as it's handled by AuthContext
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  // const [loading, setLoading] = useState(false); // Loading state is now managed by AuthContext
  const { login, isLoading } = useAuth(); // isLoading from AuthContext
  const navigate = useNavigate();
  const location = useLocation();
  // const toast = useToast(); // Handled by AuthContext

  const from = location.state?.from?.pathname || '/';

  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // setLoading(true); // Managed by AuthContext
    const success = await login(email, password);
    // setLoading(false); // Managed by AuthContext

    if (success) {
      navigate(from, { replace: true });
    } 
  };

  return (
    <Container maxW="container.sm" py={10} centerContent>
      <VStack spacing={8} w="full" bg="white" p={8} borderRadius="lg" shadow="lg">
        <Heading as="h1" size="xl" color="brand.primary">Login</Heading>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.email} isRequired>
              <FormLabel htmlFor="email">Email Address</FormLabel>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                borderColor="brand.borderColor"
                autoComplete="email"
              />
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.password} isRequired>
              <FormLabel htmlFor="password">Password</FormLabel>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                borderColor="brand.borderColor"
                autoComplete="current-password"
              />
              <FormErrorMessage>{errors.password}</FormErrorMessage>
            </FormControl>

            <Button 
              type="submit" 
              colorScheme="blue" 
              w="full" 
              isLoading={isLoading} // Use isLoading from AuthContext
              loadingText="Logging in..."
              size="lg"
              bg="brand.primary"
              _hover={{ bg: 'blue.600' }}
            >
              Login
            </Button>
          </VStack>
        </form>
        <Text>
          Don't have an account?{' '}
          <ChakraLink as={RouterLink} to="/register" color="brand.primary" fontWeight="medium">
            Sign up here
          </ChakraLink>
        </Text>
      </VStack>
    </Container>
  );
};

export default LoginPage;
