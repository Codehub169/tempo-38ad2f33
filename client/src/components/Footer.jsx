import React from 'react';
import { Box, Container, Stack, Text, Link as ChakraLink, SimpleGrid, Icon, VisuallyHidden } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const ListHeader = ({ children }) => {
  return (
    <Text fontWeight={'600'} fontSize={'lg'} mb={2} fontFamily="heading" color="white">
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
      aria-label={label}
    >
      <VisuallyHidden>{label}</VisuallyHidden>
      {children}
    </ChakraLink>
  );
};

const FooterLink = ({ to, children }) => (
  <ChakraLink as={RouterLink} to={to} _hover={{ color: 'brand.primary', textDecoration: 'underline' }} fontSize="sm">
    {children}
  </ChakraLink>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Placeholder links - in a real app, these would lead to actual pages or be dynamic
  const quickLinks = [
    { label: 'About Us', to: '/about' },
    { label: 'Contact Us', to: '/contact' },
    { label: 'FAQ', to: '/faq' },
    { label: 'Return Policy', to: '/returns' },
    { label: 'Terms of Service', to: '/terms' },
  ];

  const categoryLinks = [
    { label: 'Mobiles', to: '/category/mobiles' },
    { label: 'TVs', to: '/category/tvs' },
    { label: 'Laptops', to: '/category/laptops' },
    { label: 'Fridges & ACs', to: '/category/fridges-acs' }, // Combined for example
    { label: 'Appliances', to: '/category/appliances' },
  ];

  const socialLinks = [
    { label: 'Facebook', href: '#', icon: FaFacebook },
    { label: 'Twitter', href: '#', icon: FaTwitter },
    { label: 'Instagram', href: '#', icon: FaInstagram },
    { label: 'LinkedIn', href: '#', icon: FaLinkedin },
  ];

  return (
    <Box as="footer" bg="brand.textDark" color="brand.textLight" mt="auto">
      <Container as={Stack} maxW={'container.xl'} py={10}>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={8}>
          <Stack align={'flex-start'} spacing={3}>
            <ListHeader>RefurbishMarket</ListHeader>
            <Text fontSize={'sm'}>
              Your trusted source for quality refurbished electronics and appliances at unbeatable prices.
            </Text>
          </Stack>

          <Stack align={'flex-start'} spacing={2}>
            <ListHeader>Quick Links</ListHeader>
            {quickLinks.map(link => <FooterLink key={link.label} to={link.to}>{link.label}</FooterLink>)}
          </Stack>

          <Stack align={'flex-start'} spacing={2}>
            <ListHeader>Categories</ListHeader>
            {categoryLinks.map(link => <FooterLink key={link.label} to={link.to}>{link.label}</FooterLink>)}
          </Stack>

          <Stack align={'flex-start'} spacing={3}>
            <ListHeader>Connect With Us</ListHeader>
            <Stack direction={'row'} spacing={4}>
              {socialLinks.map(social => (
                <SocialButton key={social.label} label={social.label} href={social.href}>
                  <Icon as={social.icon} w={5} h={5} />
                </SocialButton>
              ))}
            </Stack>
          </Stack>
        </SimpleGrid>
      </Container>

      <Box py={6} borderTopWidth={1} borderTopColor="gray.700">
        <Text pt={1} fontSize={'sm'} textAlign={'center'}>
          &copy; {currentYear} RefurbishMarket. All Rights Reserved.
        </Text>
      </Box>
    </Box>
  );
};

export default Footer;
