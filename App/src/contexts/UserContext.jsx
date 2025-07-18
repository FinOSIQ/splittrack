import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchUserByCookie } from '../utils/requests/User';

// Create the UserContext
const UserContext = createContext();

// Custom hook to use the UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// UserProvider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch user data from the API
  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await fetchUserByCookie();
      
      if (result.success) {
        setUser(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch user data');
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(err.message || 'Failed to fetch user data');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Function to update user data
  const updateUser = (userData) => {
    setUser(userData);
  };

  // Function to clear user data (for logout)
  const clearUser = () => {
    setUser(null);
    setError(null);
  };

  // Function to refresh user data
  const refreshUser = () => {
    fetchUserData();
  };

  // Fetch user data on mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const value = {
    user,
    loading,
    error,
    updateUser,
    clearUser,
    refreshUser,
    fetchUserData,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
