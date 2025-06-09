import { extendTheme } from '@chakra-ui/react';

const customTheme = extendTheme({
  colors: {
    brand: {
      primary: '#007BFF',       // Bright Blue from tailwind
      secondary: '#F8F9FA',     // Light Gray from tailwind
      accent: '#28A745',        // Success Green from tailwind
      textDark: '#212529',      // from tailwind
      textLight: '#6C757D',     // from tailwind
      borderColor: '#DEE2E6',   // from tailwind 'border-color'
      danger: '#DC3545',         // from tailwind
      warning: '#FFC107',        // from tailwind
      success: '#28A745',        // from tailwind (same as accent)
    },
  },
  fonts: {
    heading: 'Poppins, sans-serif', // from tailwind fontFamily.secondary
    body: 'Inter, sans-serif',      // from tailwind fontFamily.primary
  },
});

export default customTheme;
