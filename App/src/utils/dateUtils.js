// Utility functions for date handling

/**
 * Parse Ballerina timestamp format "[seconds, nanoseconds]" to JavaScript Date
 * @param {string|Array} timestamp - Ballerina timestamp format
 * @returns {Date} - JavaScript Date object
 */
export const parseBalDateTime = (timestamp) => {
  try {
    let seconds, nanoseconds;
    
    if (typeof timestamp === 'string') {
      // Remove brackets and split
      const cleanTimestamp = timestamp.replace(/[\[\]]/g, '');
      const parts = cleanTimestamp.split(',');
      seconds = parseInt(parts[0]);
      nanoseconds = parseInt(parts[1] || 0);
    } else if (Array.isArray(timestamp)) {
      seconds = timestamp[0];
      nanoseconds = timestamp[1] || 0;
    } else if (typeof timestamp === 'number') {
      // If it's already a Unix timestamp
      seconds = timestamp;
      nanoseconds = 0;
    } else {
      // Fallback to current date
      return new Date();
    }
    
    // Convert seconds to milliseconds and add nanoseconds as milliseconds
    const milliseconds = (seconds * 1000) + Math.floor(nanoseconds / 1000000);
    return new Date(milliseconds);
  } catch (error) {
    console.error('Error parsing Ballerina timestamp:', error);
    return new Date(); // Return current date as fallback
  }
};

/**
 * Format date for display
 * @param {string|Array|Date} dateInput - Date input in various formats
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateInput) => {
  try {
    let date;
    
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'string' && dateInput.includes('[')) {
      // Ballerina timestamp format
      date = parseBalDateTime(dateInput);
    } else if (typeof dateInput === 'string') {
      // Regular date string
      date = new Date(dateInput);
    } else if (Array.isArray(dateInput)) {
      // Array format
      date = parseBalDateTime(dateInput);
    } else {
      return 'Date not available';
    }
    
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return date.toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'long', 
      year: 'numeric' 
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date not available';
  }
};

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0.00';
  }
  
  return new Intl.NumberFormat('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Get month and day for OwedCard component
 * @param {string|Array|Date} dateInput - Date input in various formats
 * @returns {Object} - Object with month and day
 */
export const getMonthDay = (dateInput) => {
  try {
    let date;
    
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'string' && dateInput.includes('[')) {
      // Ballerina timestamp format
      date = parseBalDateTime(dateInput);
    } else if (typeof dateInput === 'string') {
      // Regular date string
      date = new Date(dateInput);
    } else if (Array.isArray(dateInput)) {
      // Array format
      date = parseBalDateTime(dateInput);
    } else {
      date = new Date();
    }
    
    if (isNaN(date.getTime())) {
      return { month: 'Dec', day: '1' };
    }
    
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      day: date.getDate().toString()
    };
  } catch (error) {
    console.error('Error getting month/day:', error);
    return { month: 'Dec', day: '1' };
  }
};
