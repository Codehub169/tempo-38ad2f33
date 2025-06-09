import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';

const WishlistContext = createContext();
const WISHLIST_LOCAL_STORAGE_KEY = 'refurbishMarketWishlist';

export const useWishlist = () => useContext(WishlistContext);

const WishlistContextProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const toast = useToast();

  // Load wishlist from local storage on initial render
  useEffect(() => {
    try {
      const storedWishlist = localStorage.getItem(WISHLIST_LOCAL_STORAGE_KEY);
      if (storedWishlist) {
        const parsedWishlist = JSON.parse(storedWishlist);
        if (Array.isArray(parsedWishlist)) {
            setWishlistItems(parsedWishlist);
        } else {
            console.error('Stored wishlist is not an array:', parsedWishlist);
            setWishlistItems([]);
            localStorage.removeItem(WISHLIST_LOCAL_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Error parsing wishlist from localStorage:', error);
      setWishlistItems([]); // Default to empty array on error
      try {
        localStorage.removeItem(WISHLIST_LOCAL_STORAGE_KEY); // Attempt to remove corrupted data
      } catch (removeError) {
        console.error('Error removing corrupted wishlist from localStorage:', removeError);
      }
    }
  }, []);

  // Save wishlist to local storage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_LOCAL_STORAGE_KEY, JSON.stringify(wishlistItems));
    } catch (error) {
      console.error('Error saving wishlist to localStorage:', error);
      // Optionally notify user, e.g., using a toast, though this can be intrusive for background saves.
      // toast({
      //   title: 'Save Error',
      //   description: 'Your wishlist changes could not be saved locally.',
      //   status: 'error',
      //   duration: 3000,
      //   isClosable: true,
      //   position: 'top',
      // });
    }
  }, [wishlistItems]);

  const addToWishlist = useCallback((product) => {
    if (!product || typeof product.id === 'undefined') { // Check for product and product.id
      console.error('Attempted to add invalid product to wishlist:', product);
      toast({
        title: 'Error',
        description: 'Could not add item to wishlist. Invalid product data.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    setWishlistItems(prevItems => {
      if (prevItems.some(item => item.id === product.id)) {
        toast({
          title: 'Already in Wishlist',
          description: `${product.name || 'Item'} is already in your wishlist.`,
          status: 'info',
          duration: 2000,
          isClosable: true,
          position: 'top',
        });
        return prevItems;
      }
      toast({
        title: 'Added to Wishlist',
        description: `${product.name || 'Item'} has been added to your wishlist.`,
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top',
      });
      // Consider storing only essential product fields if 'product' objects are large or complex.
      return [...prevItems, product]; 
    });
  }, [toast]);

  const removeFromWishlist = useCallback((productId) => {
    setWishlistItems(prevItems => {
      const itemToRemove = prevItems.find(item => item.id === productId);
      const updatedItems = prevItems.filter(item => item.id !== productId);
      
      if (itemToRemove && updatedItems.length < prevItems.length) { // Ensure item was found and removed
        toast({
          title: 'Removed from Wishlist',
          description: `${itemToRemove.name || 'Item'} has been removed from your wishlist.`,
          status: 'info',
          duration: 2000,
          isClosable: true,
          position: 'top',
        });
      }
      return updatedItems;
    });
  }, [toast]);

  const isInWishlist = useCallback((productId) => {
    return wishlistItems.some(item => item.id === productId);
  }, [wishlistItems]);

  const contextValue = {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist
  };

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistContextProvider;
