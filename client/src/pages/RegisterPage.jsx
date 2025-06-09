import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Button, Container, FormControl, FormErrorMessage, FormLabel, Heading, Input, VStack, Text, Link as ChakraLink } from '@chakra-ui/react'; // useToast removed as it's handled by AuthContext
import { useAuth } from '../contexts/AuthContext';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  // const [loading, setLoading] = useState(false); // Loading state is now managed by AuthContext
  const { register, isLoading } = useAuth(); // isLoading from AuthContext
  const navigate = useNavigate();
  // const toast = useToast(); // Handled by AuthContext

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // setLoading(true); // Managed by AuthContext
    const success = await register(name, email, password);
    // setLoading(false); // Managed by AuthContext

    if (success) {
      navigate('/'); // Redirect to homepage or dashboard after registration
    }
  };

  return (
    <Container maxW="container.sm" py={10} centerContent>
      <VStack spacing={8} w="full" bg="white" p={8} borderRadius="lg" shadow="lg">
        <Heading as="h1" size="xl" color="brand.primary">Create Account</Heading>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.name} isRequired>
              <FormLabel htmlFor="name">Full Name</FormLabel>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                borderColor="brand.borderColor"
                autoComplete="name"
              />
              <FormErrorMessage>{errors.name}</FormErrorMessage>
            </FormControl>

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
                placeholder="Minimum 6 characters"
                borderColor="brand.borderColor"
                autoComplete="new-password"
              />
              <FormErrorMessage>{errors.password}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.confirmPassword} isRequired>
              <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                borderColor="brand.borderColor"
                autoComplete="new-password"
              />
              <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
            </FormControl>

            <Button 
              type="submit" 
              colorScheme="blue" 
              w="full" 
              isLoading={isLoading} // Use isLoading from AuthContext
              loadingText="Creating Account..."
              size="lg"
              bg="brand.primary"
              _hover={{ bg: 'blue.600' }}
            >
              Register
            </Button>
          </VStack>
        </form>
        <Text>
          Already have an account?{' '}
          <ChakraLink as={RouterLink} to="/login" color="brand.primary" fontWeight="medium">
            Login here
          </ChakraLink>
        </Text>
      </VStack>
    </Container>
  );
};

export default RegisterPage;
