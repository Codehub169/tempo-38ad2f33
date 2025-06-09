import React, { createContext, useState, useEffect, useContext } from 'react';
import { useToast } from '@chakra-ui/react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const toast = useToast();

  // Load cart from local storage on initial render
  useEffect(() => {
    const storedCart = localStorage.getItem('refurbishMarketCart');
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
        setCartItems([]);
        localStorage.removeItem('refurbishMarketCart');
      }
    }
  }, []);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('refurbishMarketCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        // If item exists, update quantity, ensuring it doesn't exceed stock
        const newQuantity = Math.min(existingItem.quantity + quantity, product.stock || Infinity);
        if (newQuantity === existingItem.quantity && quantity > 0) {
             toast({
                title: 'Maximum stock reached!',
                description: `You already have the maximum available stock for ${product.name} in your cart.`,
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
        } else if (quantity > 0) {
             toast({
                title: 'Item updated in cart',
                description: `${product.name} quantity updated.`,
                status: 'info',
                duration: 2000,
                isClosable: true,
            });
        }
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: newQuantity } : item
        );
      } else {
        // If item doesn't exist, add it
        if (quantity > 0) {
            toast({
                title: 'Item added to cart',
                description: `${product.name} has been added to your cart.`,
                status: 'success',
                duration: 2000,
                isClosable: true,
            });
        }
        return [...prevItems, { ...product, quantity: Math.min(quantity, product.stock || Infinity) }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    toast({
        title: 'Item removed',
        description: 'The item has been removed from your cart.',
        status: 'info',
        duration: 2000,
        isClosable: true,
    });
  };

  const updateQuantity = (productId, quantity) => {
    const newQuantity = Math.max(1, quantity); // Ensure quantity is at least 1
    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item.id === productId) {
            const updatedQuantity = Math.min(newQuantity, item.stock || Infinity);
            if (updatedQuantity < newQuantity) {
                toast({
                    title: 'Maximum stock reached!',
                    description: `Cannot add more than ${item.stock} units of ${item.name}.`,
                    status: 'warning',
                    duration: 3000,
                    isClosable: true,
                });
            }
            return { ...item, quantity: updatedQuantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
    // toast is usually called from the component that triggers clearCart (e.g., OrderConfirmationPage)
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const getItemQuantity = (productId) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemCount,
        getItemQuantity
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
