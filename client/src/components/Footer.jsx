import React from 'react';
import { Box, Container, Stack, Text, Link as ChakraLink, SimpleGrid, Icon, VisuallyHidden } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const ListHeader = ({ children }) => {
  return (
    <Text fontWeight={'600'} fontSize={'lg'} mb={2} fontFamily="brand.secondary" color="white">
      {children}
    </Text>
  );
};

const SocialButton = ({ children, label, href }) => {
  return (
    <ChakraLink
      bg={'whiteAlpha.200'}
      rounded={'full'}
      w={10}
      h={10}
      display={'inline-flex'}
      alignItems={'center'}
      justifyContent={'center'}
      transition={'background 0.3s ease'}
      _hover={{
        bg: 'whiteAlpha.400',
      }}
      href={href}
      isExternal
    >
      <VisuallyHidden>{label}</VisuallyHidden>
      {children}
    </ChakraLink>
  );
};

const Footer = () => {
  return (
    <Box bg="brand.textDark" color="brand.textLight" mt="auto">
      <Container as={Stack} maxW={'container.xl'} py={10}>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={8}>
          <Stack align={'flex-start'}>
            <ListHeader>RefurbishMarket</ListHeader>
            <Text fontSize={'sm'}>
              Your trusted source for quality refurbished electronics and appliances at unbeatable prices.
            </Text>
          </Stack>

          <Stack align={'flex-start'}>
            <ListHeader>Quick Links</ListHeader>
            <ChakraLink as={RouterLink} to="/about" _hover={{ color: 'brand.primary' }}>About Us</ChakraLink>
            <ChakraLink as={RouterLink} to="/contact" _hover={{ color: 'brand.primary' }}>Contact Us</ChakraLink>
            <ChakraLink as={RouterLink} to="/faq" _hover={{ color: 'brand.primary' }}>FAQ</ChakraLink>
            <ChakraLink as={RouterLink} to="/returns" _hover={{ color: 'brand.primary' }}>Return Policy</ChakraLink>
            <ChakraLink as={RouterLink} to="/terms" _hover={{ color: 'brand.primary' }}>Terms of Service</ChakraLink>
          </Stack>

          <Stack align={'flex-start'}>
            <ListHeader>Categories</ListHeader>
            <ChakraLink as={RouterLink} to="/category/mobiles" _hover={{ color: 'brand.primary' }}>Mobiles</ChakraLink>
            <ChakraLink as={RouterLink} to="/category/tvs" _hover={{ color: 'brand.primary' }}>TVs</ChakraLink>
            <ChakraLink as={RouterLink} to="/category/laptops" _hover={{ color: 'brand.primary' }}>Laptops</ChakraLink>
            <ChakraLink as={RouterLink} to="/category/fridges" _hover={{ color: 'brand.primary' }}>Fridges & ACs</ChakraLink>
            <ChakraLink as={RouterLink} to="/category/appliances" _hover={{ color: 'brand.primary' }}>Appliances</ChakraLink>
          </Stack>

          <Stack align={'flex-start'}>
            <ListHeader>Connect With Us</ListHeader>
            <Stack direction={'row'} spacing={4}>
              <SocialButton label={'Facebook'} href={'#'}>
                <Icon as={FaFacebook} w={5} h={5} />
              </SocialButton>
              <SocialButton label={'Twitter'} href={'#'}>
                <Icon as={FaTwitter} w={5} h={5} />
              </SocialButton>
              <SocialButton label={'Instagram'} href={'#'}>
                <Icon as={FaInstagram} w={5} h={5} />
              </SocialButton>
              <SocialButton label={'LinkedIn'} href={'#'}>
                 <Icon as={FaLinkedin} w={5} h={5} />
              </SocialButton>
            </Stack>
          </Stack>
        </SimpleGrid>
      </Container>

      <Box py={6} borderTopWidth={1} borderTopColor="gray.700">
        <Text pt={1} fontSize={'sm'} textAlign={'center'}>
          &copy; {new Date().getFullYear()} RefurbishMarket. All Rights Reserved.
        </Text>
      </Box>
    </Box>
  );
};

export default Footer;
