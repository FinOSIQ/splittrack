// src/components/RecentActivityCard.jsx
import React from 'react';

// Function to generate emoji-based icon for expenses (similar to OwedCard components)
const generateExpenseEmoji = (description) => {
  const descLower = description.toLowerCase();
  
  // Food/Restaurant
  if (descLower.includes('restaurant') || descLower.includes('dinner') || 
      descLower.includes('lunch') || descLower.includes('food')) {
    return '🍽️';
  }
  if (descLower.includes('coffee') || descLower.includes('cafe')) {
    return '☕';
  }
  if (descLower.includes('pizza')) return '🍕';
  if (descLower.includes('burger')) return '🍔';
  
  // Travel/Hotel
  if (descLower.includes('hotel') || descLower.includes('resort')) {
    return '🏨';
  }
  if (descLower.includes('flight') || descLower.includes('airplane')) {
    return '✈️';
  }
  if (descLower.includes('trip') || descLower.includes('travel')) {
    return '🧳';
  }
  
  // Transport
  if (descLower.includes('gas') || descLower.includes('fuel')) {
    return '⛽';
  }
  if (descLower.includes('taxi') || descLower.includes('uber') || descLower.includes('car')) {
    return '🚗';
  }
  
  // Shopping/Groceries
  if (descLower.includes('groceries') || descLower.includes('grocery') || 
      descLower.includes('apartment groceries')) {
    return '🛒';
  }
  if (descLower.includes('shopping') || descLower.includes('store')) {
    return '🛍️';
  }
  
  // Entertainment
  if (descLower.includes('movie') || descLower.includes('cinema')) {
    return '🎬';
  }
  if (descLower.includes('concert') || descLower.includes('music')) {
    return '🎵';
  }
  
  // Health/Medical
  if (descLower.includes('hospital') || descLower.includes('doctor') || 
      descLower.includes('medical') || descLower.includes('pharmacy')) {
    return '🏥';
  }
  
  // Bills/Utilities
  if (descLower.includes('electric') || descLower.includes('water') || 
      descLower.includes('internet') || descLower.includes('phone')) {
    return '📄';
  }
  
  // Default expense icon
  return '💰';
};

// Function to get background color for expense emoji (consistent with other components)
const getExpenseEmojiBackgroundColor = (emoji) => {
  const colorMap = {
    '🍽️': '#FEF3C7', '☕': '#D1FAE5', '🍕': '#FEE2E2', '🍔': '#FEF3C7',
    '🏨': '#DBEAFE', '✈️': '#E0F2FE', '🧳': '#F3E8FF',
    '⛽': '#FED7AA', '🚗': '#FEF3C7',
    '🛒': '#E0F2FE', '🛍️': '#F3E8FF',
    '🎬': '#FECACA', '🎵': '#DDD6FE',
    '🏥': '#FEE2E2', '📄': '#F3F4F6',
    '💰': '#F3F4F6'
  };
  return colorMap[emoji] || '#F3F4F6';
};

// Function to round numbers in description text
const roundNumbersInText = (text) => {
  // Match patterns like $123.456789 or 123.456789 followed by currency
  return text.replace(/\$?(\d+)\.(\d{6,})/g, (match, whole, decimal) => {
    const number = parseFloat(`${whole}.${decimal}`);
    const rounded = Math.round(number * 100) / 100; // Round to 2 decimal places
    return match.startsWith('$') ? `$${rounded.toFixed(2)}` : `${rounded.toFixed(2)}`;
  });
};

// Function to format timestamp to date and time
const formatDateTime = (timestamp) => {
  try {
    const date = new Date(timestamp);
    
    const dateStr = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    
    const time = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });

    return { date: dateStr, time };
  } catch (error) {
    return { date: '', time: '' };
  }
};

export default function RecentActivityCard({ 
  activityType = 'expense',
  id,
  timestamp,
  description = 'Recent activity',
  style = '' 
}) {
  const { date, time } = formatDateTime(timestamp);
  const cleanDescription = roundNumbersInText(description);
  
  // Check if this is a transaction (settlement/payment)
  const isTransaction = activityType === 'transaction' || 
    cleanDescription.toLowerCase().includes('settlement') ||
    cleanDescription.toLowerCase().includes('paid you') ||
    cleanDescription.toLowerCase().includes('received');

  // Render transaction icon (green "paid" badge)
  const renderTransactionIcon = () => (
    <div className="bg-green-100 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
      <span className="text-green-600 text-xs font-medium">paid</span>
    </div>
  );

  // Render expense icon (emoji with background)
  const renderExpenseIcon = () => {
    const emoji = generateExpenseEmoji(cleanDescription);
    const backgroundColor = getExpenseEmojiBackgroundColor(emoji);
    
    return (
      <div 
        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
        style={{ backgroundColor }}
      >
        {emoji}
      </div>
    );
  };

  return (
    <div className={`flex items-center p-3 border-b border-gray-100 last:border-b-0 ${style}`}>
      {/* Left: Icon */}
      <div className="mr-3 flex-shrink-0">
        {isTransaction ? renderTransactionIcon() : renderExpenseIcon()}
      </div>
      
      {/* Right: Content */}
      <div className="flex-1 min-w-0">
        {/* Description */}
        <p className="text-sm font-normal text-gray-900 leading-tight mb-1 break-words">
          {cleanDescription}
        </p>
        
        {/* Date and Time */}
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <span>{date}</span>
          <span>•</span>
          <span>{time}</span>
        </div>
      </div>
    </div>
  );
}