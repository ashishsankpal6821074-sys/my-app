import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from './apiService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState(null);

  // Check for existing session on app load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const savedUser = localStorage.getItem('currentUser');
        const savedToken = localStorage.getItem('authToken');
        
        if (savedUser && savedToken) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setOrganization(userData.organization);
          
          // Validate token with server (in real implementation)
          // const isValid = await apiService.validateToken(savedToken);
          // if (!isValid) {
          //   logout();
          // }
        }
      } catch (error) {
        console.error('Session check failed:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await apiService.login(email, password);
      
      if (response.success) {
        const userData = response.user;
        setUser(userData);
        setOrganization(userData.organization);
        
        // Store session data
        localStorage.setItem('currentUser', JSON.stringify(userData));
        localStorage.setItem('authToken', response.token);
        
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setLoading(true);
      const response = await apiService.signup(userData);
      
      if (response.success) {
        const newUser = response.user;
        setUser(newUser);
        setOrganization(newUser.organization);
        
        // Store session data
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        localStorage.setItem('authToken', response.token);
        
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Signup failed:', error);
      return { success: false, error: 'Signup failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setOrganization(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('promptHistory'); // Clear old local data
  };

  const updateUser = (updatedData) => {
    const newUserData = { ...user, ...updatedData };
    setUser(newUserData);
    localStorage.setItem('currentUser', JSON.stringify(newUserData));
  };

  const value = {
    user,
    organization,
    loading,
    login,
    signup,
    logout,
    updateUser,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;