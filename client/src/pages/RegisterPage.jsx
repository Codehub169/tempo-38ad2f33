import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  Box, Button, Container, FormControl, FormErrorMessage, 
  FormLabel, Heading, Input, VStack, Text, 
  Link as ChakraLink, Select 
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('buyer'); // Added role state, default to 'buyer'
  const [errors, setErrors] = useState({});
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!role) { // Should not happen with a default value and select
        newErrors.role = 'Role is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const success = await register(name.trim(), email.trim(), password, role);

    if (success) {
      navigate('/'); // Redirect to homepage or dashboard after registration
    }
  };

  return (
    <Container maxW="container.sm" py={{base: 6, md: 10}} centerContent>
      <VStack spacing={8} w="full" bg="white" p={{base: 6, md: 8}} borderRadius="lg" shadow="lg">
        <Heading as="h1" size="xl" color="brand.primary" fontFamily="heading">Create Account</Heading>
        <form onSubmit={handleSubmit} style={{ width: '100%' }} noValidate>
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

            <FormControl isInvalid={!!errors.role} isRequired>
              <FormLabel htmlFor="role">I am a</FormLabel>
              <Select
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                borderColor="brand.borderColor"
                autoComplete="off"
              >
                <option value="buyer">Buyer (Looking to purchase items)</option>
                <option value="seller">Seller (Looking to list items for sale)</option>
              </Select>
              <FormErrorMessage>{errors.role}</FormErrorMessage>
            </FormControl>

            <Button 
              type="submit" 
              colorScheme="green" 
              w="full" 
              isLoading={isLoading}
              loadingText="Creating Account..."
              size="lg"
              py={6} // Increased padding for better touch target
              bg="brand.accent"
              _hover={{ bg: 'green.600' }}
            >
              Register
            </Button>
          </VStack>
        </form>
        <Text>
          Already have an account?{' '}
          <ChakraLink as={RouterLink} to="/login" color="brand.primary" fontWeight="medium" _hover={{textDecoration: 'underline'}}>
            Login here
          </ChakraLink>
        </Text>
      </VStack>
    </Container>
  );
};

export default RegisterPage;
