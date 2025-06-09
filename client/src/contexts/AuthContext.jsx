import React, { createContext, useState, useEffect, useContext } from 'react';
import { useToast } from '@chakra-ui/react';
import apiClient, { registerUser as registerUserApi, loginUser as loginUserApi } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const loadUserFromToken = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        setToken(storedToken);
        // Set authorization header for apiClient for subsequent requests
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        try {
          // Attempt to fetch user profile to validate token and get fresh user data
          // This is a more robust way to verify authentication than just checking for a token's existence.
          const { data: userData } = await apiClient.get('/auth/me'); 
          setUser(userData); 
          setIsAuthenticated(true);
          // Persist fetched user data to localStorage (optional, but can reduce /me calls on refresh if token is still valid)
          localStorage.setItem('authUser', JSON.stringify(userData));
        } catch (error) {
          console.error('Failed to load user from token or token invalid:', error.response?.data?.message || error.message);
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
          delete apiClient.defaults.headers.common['Authorization'];
          // Optionally show a toast if the token was invalid/expired
          if (error.response?.status === 401) {
            // toast({ title: 'Session expired', description: 'Please log in again.', status: 'info', duration: 3000, isClosable: true });
          }
        }
      } else {
        // No token found, ensure auth header is clear
        delete apiClient.defaults.headers.common['Authorization'];
      }
      setIsLoading(false);
    };
    loadUserFromToken();
  }, []); // Runs once on component mount

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const userData = await loginUserApi({ email, password });
      localStorage.setItem('authToken', userData.token);
      // Store essential user info, not the whole userData which might include the token again
      const userToStore = { id: userData.id, name: userData.name, email: userData.email };
      localStorage.setItem('authUser', JSON.stringify(userToStore)); 
      setToken(userData.token);
      setUser(userToStore);
      setIsAuthenticated(true);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      toast({ title: 'Login Successful', status: 'success', duration: 3000, isClosable: true });
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Login failed:', error.response?.data?.message || error.message);
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast({ title: 'Login Failed', description: message, status: 'error', duration: 5000, isClosable: true });
      setIsLoading(false);
      return false;
    }
  };

  const register = async (name, email, password) => {
    setIsLoading(true);
    try {
      const userData = await registerUserApi({ name, email, password });
      localStorage.setItem('authToken', userData.token);
      const userToStore = { id: userData.id, name: userData.name, email: userData.email };
      localStorage.setItem('authUser', JSON.stringify(userToStore));
      setToken(userData.token);
      setUser(userToStore);
      setIsAuthenticated(true);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      toast({ title: 'Registration Successful', description: 'You are now logged in.', status: 'success', duration: 3000, isClosable: true });
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Registration failed:', error.response?.data?.message || error.message);
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast({ title: 'Registration Failed', description: message, status: 'error', duration: 5000, isClosable: true });
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    delete apiClient.defaults.headers.common['Authorization'];
    toast({ title: 'Logged Out', status: 'info', duration: 3000, isClosable: true });
    // Consider navigating to home or login page using useNavigate() if this context is used within a Router context
    // For example: navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, isLoading, login, register, logout, setIsLoading }}>
      {children}
    </AuthContext.Provider>
  );
};