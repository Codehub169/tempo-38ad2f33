import React, { createContext, useState, useEffect, useContext } from 'react';
import { useToast } from '@chakra-ui/react';
import apiClient, { registerUser as registerUserApi, loginUser as loginUserApi } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [user, setUser] = useState(null); // User object will now include role
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const loadUserFromToken = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        setToken(storedToken);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        try {
          // Fetch user profile; backend's /auth/me now includes 'role'
          const { data: userData } = await apiClient.get('/auth/me'); 
          setUser(userData); // userData now contains { id, name, email, role, created_at, ... }
          setIsAuthenticated(true);
          // Persist full user data including role from /auth/me
          localStorage.setItem('authUser', JSON.stringify(userData)); 
        } catch (error) {
          console.error('Failed to load user from token or token invalid:', error.response?.data?.message || error.message);
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
          delete apiClient.defaults.headers.common['Authorization'];
          if (error.response?.status === 401) {
            // toast({ title: 'Session expired', description: 'Please log in again.', status: 'info', duration: 3000, isClosable: true, position: 'top' });
          }
        }
      } else {
        delete apiClient.defaults.headers.common['Authorization'];
      }
      setIsLoading(false);
    };
    loadUserFromToken();
  }, []); // Runs once on component mount

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const userData = await loginUserApi({ email, password }); // API response includes role
      localStorage.setItem('authToken', userData.token);
      // User object now includes role from userData
      const userToStore = { id: userData.id, name: userData.name, email: userData.email, role: userData.role };
      localStorage.setItem('authUser', JSON.stringify(userToStore)); 
      setToken(userData.token);
      setUser(userToStore);
      setIsAuthenticated(true);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      toast({ title: 'Login Successful', status: 'success', duration: 3000, isClosable: true, position: 'top' });
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Login failed:', error.response?.data?.message || error.message);
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast({ title: 'Login Failed', description: message, status: 'error', duration: 5000, isClosable: true, position: 'top' });
      setIsLoading(false);
      return false;
    }
  };

  // Updated register function to include role
  const register = async (name, email, password, role) => {
    setIsLoading(true);
    try {
      // Pass role to the API
      const userData = await registerUserApi({ name, email, password, role }); // API response includes role
      localStorage.setItem('authToken', userData.token);
      // User object now includes role from userData
      const userToStore = { id: userData.id, name: userData.name, email: userData.email, role: userData.role };
      localStorage.setItem('authUser', JSON.stringify(userToStore));
      setToken(userData.token);
      setUser(userToStore);
      setIsAuthenticated(true);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      toast({ title: 'Registration Successful', description: 'You are now logged in.', status: 'success', duration: 3000, isClosable: true, position: 'top' });
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Registration failed:', error.response?.data?.message || error.message);
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast({ title: 'Registration Failed', description: message, status: 'error', duration: 5000, isClosable: true, position: 'top' });
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
    toast({ title: 'Logged Out', status: 'info', duration: 3000, isClosable: true, position: 'top' });
  };

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, isLoading, login, register, logout, setIsLoading }}>
      {children}
    </AuthContext.Provider>
  );
};