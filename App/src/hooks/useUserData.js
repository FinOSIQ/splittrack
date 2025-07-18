import { useUser } from '../contexts/UserContext';

// Custom hook with additional utility functions
export const useUserData = () => {
  const { user, loading, error, updateUser, clearUser, refreshUser, fetchUserData } = useUser();

  // Helper function to get user's full name
  const getFullName = () => {
    if (!user) return '';
    return `${user.first_name} ${user.last_name}`.trim();
  };

  // Helper function to get user's initials
  const getInitials = () => {
    if (!user) return '';
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Helper function to check if user is logged in
  const isLoggedIn = () => {
    return user !== null && user.user_Id;
  };

  // Helper function to get currency preference
  const getCurrency = () => {
    return user?.currency_pref || 'USD';
  };

  return {
    user,
    loading,
    error,
    updateUser,
    clearUser,
    refreshUser,
    fetchUserData,
    getFullName,
    getInitials,
    isLoggedIn,
    getCurrency,
  };
};

export default useUserData;
