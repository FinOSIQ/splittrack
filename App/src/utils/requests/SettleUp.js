// src/utils/requests/SettleUp.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9090';

/**
 * Get users who owe money to the current user (To Be Paid tab)
 * @returns {Promise<Object>} Response with users who owe money to current user
 */
export const getOwesToMe = async () => {
  try {
    const url = `${API_BASE_URL}/api_settleup/v1/owesToMe`;
    console.log('Fetching owesToMe with URL:', url);
    
    const response = await axios.get(url, {
      withCredentials: true, // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('OwesToMe response:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching owesToMe data:", error);
    console.error("Response data:", error.response?.data);
    console.error("Response status:", error.response?.status);
    handleApiError(error);
  }
};

/**
 * Get users to whom current user owes money (To Pay tab)
 * @returns {Promise<Object>} Response with users current user owes money to
 */
export const getIOwe = async () => {
  try {
    const url = `${API_BASE_URL}/api_settleup/v1/iOwe`;
    console.log('Fetching iOwe with URL:', url);
    
    const response = await axios.get(url, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('IOwe response:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching iOwe data:", error);
    console.error("Response data:", error.response?.data);
    console.error("Response status:", error.response?.status);
    handleApiError(error);
  }
};

/**
 * Get detailed expenses where current user owes money to specific creator
 * @param {string} creatorId - ID of the expense creator
 * @returns {Promise<Object>} Response with detailed expenses for the creator
 */
export const getExpenseDetails = async (creatorId) => {
  try {
    const url = `${API_BASE_URL}/api_settleup/v1/expenseDetails/${creatorId}`;
    console.log('Fetching expense details with:', {
      creatorId,
      url
    });
    
    const response = await axios.get(url, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('ExpenseDetails response:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching expense details:", error);
    console.error("Response data:", error.response?.data);
    console.error("Response status:", error.response?.status);
    handleApiError(error);
  }
};

/**
 * Get detailed expenses where specific member owes money to current user
 * @param {string} memberId - ID of the member who owes money
 * @returns {Promise<Object>} Response with detailed expenses for the member
 */
export const getOwesToMeDetails = async (memberId) => {
  try {
    const url = `${API_BASE_URL}/api_settleup/v1/owesToMeDetails/${memberId}`;
    console.log('Fetching owesToMeDetails with:', {
      memberId,
      url
    });
    
    const response = await axios.get(url, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('OwesToMeDetails response:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching owesToMeDetails:", error);
    console.error("Response data:", error.response?.data);
    console.error("Response status:", error.response?.status);
    handleApiError(error);
  }
};

/**
 * Process settle up payments for multiple expenses
 * @param {Array} payments - Array of payment objects with expenseId and paymentAmount
 * @returns {Promise<Object>} Response with settlement results
 */
export const settleUpPayments = async (payments) => {
  try {
    const url = `${API_BASE_URL}/api_settleup/v1/settleUp`;
    console.log('Processing settle up with:', {
      payments,
      url
    });
    
    const response = await axios.post(url, {
      payments: payments
    }, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('SettleUp response:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error processing settle up:", error);
    console.error("Response data:", error.response?.data);
    console.error("Response status:", error.response?.status);
    handleApiError(error);
  }
};

/**
 * Handle API errors and throw appropriate error messages
 * @param {Error} error - Axios error object
 * @throws {Error} Formatted error message
 */
const handleApiError = (error) => {
  if (error.response?.status === 401) {
    throw new Error('Unauthorized. Please login again.');
  } else if (error.response?.status === 404) {
    const errorCode = error.response?.data?.errorCode;
    if (errorCode === 'CREATOR_NOT_FOUND') {
      throw new Error('Creator not found.');
    } else if (errorCode === 'MEMBER_NOT_FOUND') {
      throw new Error('Member not found.');
    } else {
      throw new Error('Data not found.');
    }
  } else if (error.response?.status === 400) {
    const errorCode = error.response?.data?.errorCode;
    if (errorCode === 'USER_ID_MISSING') {
      throw new Error('User authentication required. Please login again.');
    } else if (errorCode === 'INVALID_AMOUNT') {
      throw new Error('Invalid payment amount provided.');
    } else {
      throw new Error(error.response?.data?.message || 'Bad request.');
    }
  } else if (error.response?.status === 500) {
    const errorCode = error.response?.data?.errorCode;
    if (errorCode === 'DATABASE_ERROR') {
      throw new Error('Database error occurred. Please try again later.');
    } else {
      throw new Error('Server error occurred. Please try again later.');
    }
  } else if (error.response?.data?.message) {
    throw new Error(error.response.data.message);
  } else {
    throw new Error(`API request failed: ${error.message}`);
  }
};

/**
 * Utility function to format currency amounts
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'LKR')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'LKR') => {
  return `${parseFloat(amount).toFixed(2)} ${currency}`;
};

/**
 * Utility function to format dates from API responses
 * @param {string} dateString - ISO date string from API
 * @returns {Object} Object with formatted month and day
 */
export const formatExpenseDate = (dateString) => {
  const date = new Date(dateString);
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate().toString().padStart(2, '0');
  
  return { month, day };
};