import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Container, Heading, Text, Button, VStack, FormControl, 
  FormLabel, FormErrorMessage, Input, Textarea, Select, 
  NumberInput, NumberInputField, NumberInputStepper, 
  NumberIncrementStepper, NumberDecrementStepper, useToast, Spinner, Alert, AlertIcon 
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { createProduct as createProductApi, getCategories as fetchCategoriesApi } from '../services/api';

const AddProductPage = () => {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    condition: 'Good', // Default condition
    stock_quantity: 1,
    category_id: '',
    image_url: '',
    images: ['', '', ''], // For 3 additional image URLs
    warranty_info: '',
    key_features: '', // Comma-separated
    brand: '',
    model: '',
    specifications: '' // JSON string or simple text for now
  });
  const [categories, setCategories] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || user?.role !== 'seller') {
        toast({
          title: 'Access Denied',
          description: 'You must be logged in as a seller to add products.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top'
        });
        navigate('/login');
      } else {
        fetchCategoriesApi()
          .then(data => {
            setCategories(data || []);
            if (data && data.length > 0) {
              setFormData(prev => ({ ...prev, category_id: String(data[0].id) })); // Ensure category_id is string for Select
            }
          })
          .catch(err => {
            console.error('Failed to fetch categories', err);
            toast({ title: 'Error', description: 'Could not load categories.', status: 'error', duration: 3000, isClosable: true, position: 'top' });
          })
          .finally(() => setPageLoading(false));
      }
    }
  }, [isAuthenticated, user, authLoading, navigate, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageArrayChange = (index, value) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      newImages[index] = value;
      return { ...prev, images: newImages };
    });
  };

  const handleNumberChange = (name, valueAsString, valueAsNumber) => {
    setFormData(prev => ({ ...prev, [name]: isNaN(valueAsNumber) ? valueAsString : valueAsNumber }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Product name is required.';
    
    const priceValue = parseFloat(formData.price);
    if (isNaN(priceValue) || priceValue <= 0) {
      errors.price = 'Price must be a positive number.';
    }

    const stockValue = parseInt(formData.stock_quantity, 10);
    if (isNaN(stockValue) || stockValue < 0) {
      errors.stock_quantity = 'Stock quantity must be a non-negative integer.';
    }
    
    if (!formData.category_id) errors.category_id = 'Category is required.';
    if (!formData.condition) errors.condition = 'Condition is required.';
    
    if (!formData.image_url.trim()) {
      errors.image_url = 'Main image URL is required.';
    } else {
      try { 
        new URL(formData.image_url);
      } catch (_) { 
        errors.image_url = 'Invalid main image URL. Please include http:// or https://'; 
      }
    }

    formData.images.forEach((imgUrl, index) => {
        if (imgUrl.trim() !== '') {
            try { 
              new URL(imgUrl); 
            } catch (_) { 
              errors[`image_${index}`] = `Invalid URL for Additional Image ${index + 1}. Please include http:// or https://`; 
            }
        }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({ title: 'Validation Error', description: 'Please correct the form errors.', status: 'error', duration: 3000, isClosable: true, position: 'top' });
      return;
    }
    setIsSubmitting(true);

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      stock_quantity: parseInt(formData.stock_quantity, 10),
      category_id: parseInt(formData.category_id, 10),
      images: formData.images.map(url => url.trim()).filter(url => url !== ''), // Trim and filter non-empty URLs
      key_features: formData.key_features.split(',').map(k => k.trim()).filter(k => k !== ''), // Array of strings
      // specifications is sent as a string (from Textarea)
    };

    try {
      const newProduct = await createProductApi(productData);
      toast({ title: 'Product Created!', description: `${newProduct.name} has been listed.`, status: 'success', duration: 5000, isClosable: true, position: 'top' });
      navigate(`/product/${newProduct.id}`);
    } catch (apiError) {
      console.error('Product creation error:', apiError);
      const message = apiError.response?.data?.message || 'There was an issue listing your product. Please try again.';
      toast({ title: 'Listing Failed', description: message, status: 'error', duration: 5000, isClosable: true, position: 'top' });
      setIsSubmitting(false);
    }
  };

  if (authLoading || pageLoading) {
    return <Container centerContent py={10}><Spinner size="xl" /></Container>;
  }
  if (!isAuthenticated || user?.role !== 'seller') {
    // This case should be handled by useEffect redirect, but as a fallback:
    return <Container centerContent py={10}><Alert status="error"><AlertIcon/>Access Denied. You must be a seller.</Alert></Container>;
  }

  return (
    <Container maxW="container.md" py={8}>
      <Heading as="h1" size="xl" fontFamily="heading" mb={8} textAlign="center" color="brand.textDark">
        List New Product
      </Heading>
      <Box bg="white" p={{base: 4, md: 8}} borderRadius="lg" shadow="md" borderWidth="1px" borderColor="brand.borderColor">
        <form onSubmit={handleSubmit} noValidate>
          <VStack spacing={6} align="stretch">
            <FormControl isRequired isInvalid={!!formErrors.name}>
              <FormLabel htmlFor="name">Product Name</FormLabel>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Refurbished iPhone 12" />
              <FormErrorMessage>{formErrors.name}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!formErrors.category_id}>
              <FormLabel htmlFor="category_id">Category</FormLabel>
              <Select id="category_id" name="category_id" value={formData.category_id} onChange={handleChange} placeholder="Select category">
                {categories.map(cat => <option key={cat.id} value={String(cat.id)}>{cat.name}</option>)}
              </Select>
              <FormErrorMessage>{formErrors.category_id}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!formErrors.price}>
              <FormLabel htmlFor="price">Price (₹)</FormLabel>
              <NumberInput 
                precision={2} 
                step={0.01} // More granular step for currency
                min={0.01} // Price must be positive
                name="price" 
                value={formData.price} 
                onChange={(valueAsString, valueAsNumber) => handleNumberChange('price', valueAsString, valueAsNumber)}
              >
                <NumberInputField id="price" placeholder="e.g., 25000.00" />
                <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
              </NumberInput>
              <FormErrorMessage>{formErrors.price}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!formErrors.condition}>
              <FormLabel htmlFor="condition">Condition</FormLabel>
              <Select id="condition" name="condition" value={formData.condition} onChange={handleChange}>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </Select>
              <FormErrorMessage>{formErrors.condition}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!formErrors.stock_quantity}>
              <FormLabel htmlFor="stock_quantity">Stock Quantity</FormLabel>
              <NumberInput 
                min={0} 
                name="stock_quantity" 
                value={formData.stock_quantity} 
                onChange={(valueAsString, valueAsNumber) => handleNumberChange('stock_quantity', valueAsString, valueAsNumber)}
                allowMouseWheel
              >
                <NumberInputField id="stock_quantity" placeholder="e.g., 10" />
                <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
              </NumberInput>
              <FormErrorMessage>{formErrors.stock_quantity}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!formErrors.description}>
              <FormLabel htmlFor="description">Description (Optional)</FormLabel>
              <Textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Detailed description of the product..." />
              <FormErrorMessage>{formErrors.description}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!formErrors.image_url}>
              <FormLabel htmlFor="image_url">Main Image URL</FormLabel>
              <Input id="image_url" name="image_url" type="url" value={formData.image_url} onChange={handleChange} placeholder="https://example.com/main_image.jpg" />
              <FormErrorMessage>{formErrors.image_url}</FormErrorMessage>
            </FormControl>

            <FormLabel>Additional Image URLs (Optional)</FormLabel>
            {formData.images.map((imgUrl, index) => (
              <FormControl key={index} isInvalid={!!formErrors[`image_${index}`]}>
                <Input 
                  name={`image_${index}`}
                  type="url"
                  value={imgUrl} 
                  onChange={(e) => handleImageArrayChange(index, e.target.value)} 
                  placeholder={`Additional Image URL ${index + 1} (e.g., https://example.com/image.jpg)`}
                  mb={2}
                />
                <FormErrorMessage>{formErrors[`image_${index}`]}</FormErrorMessage>
              </FormControl>
            ))}

            <FormControl isInvalid={!!formErrors.brand}>
              <FormLabel htmlFor="brand">Brand (Optional)</FormLabel>
              <Input id="brand" name="brand" value={formData.brand} onChange={handleChange} placeholder="e.g., Apple, Samsung" />
              <FormErrorMessage>{formErrors.brand}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!formErrors.model}>
              <FormLabel htmlFor="model">Model (Optional)</FormLabel>
              <Input id="model" name="model" value={formData.model} onChange={handleChange} placeholder="e.g., iPhone 12, Galaxy S21" />
              <FormErrorMessage>{formErrors.model}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!formErrors.warranty_info}>
              <FormLabel htmlFor="warranty_info">Warranty Information (Optional)</FormLabel>
              <Input id="warranty_info" name="warranty_info" value={formData.warranty_info} onChange={handleChange} placeholder="e.g., 6 Months Seller Warranty" />
              <FormErrorMessage>{formErrors.warranty_info}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!formErrors.key_features}>
              <FormLabel htmlFor="key_features">Key Features (Comma-separated, Optional)</FormLabel>
              <Textarea id="key_features" name="key_features" value={formData.key_features} onChange={handleChange} placeholder="e.g., Feature 1, Feature 2, Long battery life" />
              <FormErrorMessage>{formErrors.key_features}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!formErrors.specifications}>
              <FormLabel htmlFor="specifications">Specifications (JSON or Text, Optional)</FormLabel>
              <Textarea id="specifications" name="specifications" value={formData.specifications} onChange={handleChange} placeholder='e.g., { "RAM": "8GB", "Storage": "128GB" } or simple text like "RAM: 8GB, Storage: 128GB"' />
              <FormErrorMessage>{formErrors.specifications}</FormErrorMessage>
            </FormControl>

            <Button 
              type="submit" 
              colorScheme="green" 
              size="lg" 
              w="full" 
              isLoading={isSubmitting}
              loadingText="Listing Product..."
              mt={4} py={7}
            >
              List Product
            </Button>
          </VStack>
        </form>
      </Box>
    </Container>
  );
};

export default AddProductPage;
