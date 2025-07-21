// src/components/OwedCardSettleup.jsx
import React from 'react';

// Function to generate emoji-based icon for expenses
const generateExpenseEmoji = (title) => {
  const titleLower = title.toLowerCase();
  
  // Food/Restaurant
  if (titleLower.includes('restaurant') || titleLower.includes('dinner') || 
      titleLower.includes('lunch') || titleLower.includes('food')) {
    return '🍽️';
  }
  if (titleLower.includes('coffee') || titleLower.includes('cafe')) {
    return '☕';
  }
  if (titleLower.includes('pizza')) return '🍕';
  if (titleLower.includes('burger')) return '🍔';
  
  // Travel/Hotel
  if (titleLower.includes('hotel') || titleLower.includes('resort')) {
    return '🏨';
  }
  if (titleLower.includes('flight') || titleLower.includes('airplane')) {
    return '✈️';
  }
  if (titleLower.includes('trip') || titleLower.includes('travel')) {
    return '🧳';
  }
  
  // Transport
  if (titleLower.includes('gas') || titleLower.includes('fuel')) {
    return '⛽';
  }
  if (titleLower.includes('taxi') || titleLower.includes('uber') || titleLower.includes('car')) {
    return '🚗';
  }
  
  // Shopping/Groceries
  if (titleLower.includes('groceries') || titleLower.includes('grocery')) {
    return '🛒';
  }
  if (titleLower.includes('shopping') || titleLower.includes('store')) {
    return '🛍️';
  }
  
  // Entertainment
  if (titleLower.includes('movie') || titleLower.includes('cinema')) {
    return '🎬';
  }
  if (titleLower.includes('concert') || titleLower.includes('music')) {
    return '🎵';
  }
  
  // Default
  return '💰';
};

// Function to get background color for emoji
const getEmojiBackgroundColor = (emoji) => {
  const colorMap = {
    '🍽️': '#FEF3C7', '☕': '#D1FAE5', '🍕': '#FEE2E2', '🍔': '#FEF3C7',
    '🏨': '#DBEAFE', '✈️': '#E0F2FE', '🧳': '#F3E8FF',
    '⛽': '#FED7AA', '🚗': '#FEF3C7',
    '🛒': '#E0F2FE', '🛍️': '#F3E8FF',
    '🎬': '#FECACA', '🎵': '#DDD6FE',
    '💰': '#F3F4F6'
  };
  return colorMap[emoji] || '#F3F4F6';
};

// Alternative fallback - simple letter-based icon
const generateFallbackIcon = (title) => {
  const firstLetter = title.charAt(0).toUpperCase();
  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
  const colorIndex = firstLetter.charCodeAt(0) % colors.length;
  
  return {
    letter: firstLetter,
    backgroundColor: colors[colorIndex]
  };
};

// Function to determine which icon to use with multiple fallbacks
const getExpenseIcon = (title, originalImage) => {
  // If original image is provided and not a placeholder, use it
  if (originalImage && !originalImage.includes('placehold.co')) {
    return { type: 'image', src: originalImage };
  }
  
  try {
    const emoji = generateExpenseEmoji(title);
    const backgroundColor = getEmojiBackgroundColor(emoji);
    
    return { 
      type: 'emoji', 
      emoji, 
      backgroundColor,
      fallback: generateFallbackIcon(title)
    };
  } catch (error) {
    // If anything goes wrong with emoji generation, use letter fallback
    return { 
      type: 'letter', 
      ...generateFallbackIcon(title)
    };
  }
};

export default function OwedCardSettleup({
  dateMonth,
  dateDay,
  image,
  title,
  description,
  amount,
  style = '',
  showCheckbox = false,
  isChecked = false,
  onCheckboxChange,
  expenseId,
}) {
  const [iconError, setIconError] = React.useState(false);
  const expenseIcon = getExpenseIcon(title, image);
  
  const renderIcon = () => {
    // If there was an error or we're using letter type, show letter fallback
    if (iconError || expenseIcon.type === 'letter') {
      const fallback = expenseIcon.type === 'letter' ? expenseIcon : expenseIcon.fallback;
      return (
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
          style={{ backgroundColor: fallback.backgroundColor }}
        >
          {fallback.letter}
        </div>
      );
    }
    
    // Try to render image
    if (expenseIcon.type === 'image') {
      return (
        <img 
          src={expenseIcon.src} 
          alt={title} 
          className="w-10 h-10 rounded-lg object-cover"
          onError={() => setIconError(true)}
        />
      );
    }
    
    // Try to render emoji
    if (expenseIcon.type === 'emoji') {
      return (
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
          style={{ backgroundColor: expenseIcon.backgroundColor }}
          onError={() => setIconError(true)}
        >
          {expenseIcon.emoji}
        </div>
      );
    }
    
    // Ultimate fallback - just a colored circle with first letter
    const ultimate = generateFallbackIcon(title);
    return (
      <div 
        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
        style={{ backgroundColor: ultimate.backgroundColor }}
      >
        {ultimate.letter}
      </div>
    );
  };

  const handleCheckboxChange = (e) => {
    if (onCheckboxChange) {
      onCheckboxChange(expenseId, e.target.checked);
    }
  };
  
  return (
    <div
      className={`
        flex items-center justify-between
        p-2 mx-2 pb-3
        border-b border-gray-200
        ${style}
      `}
    >
      {/* Left Section: Date, Thumbnail & Info */}
      <div className="flex items-center space-x-4">
        {/* Date */}
        <div className="text-center">
          <div className="text-xs font-thin text-gray-900">{dateMonth}</div>
          <div className="text-xs font-thin text-gray-900">{dateDay}</div>
        </div>
        {/* Thumbnail */}
        {renderIcon()}
        {/* Title & Description */}
        <div>
          <p className="text-xs font-normal text-gray-900">{title}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      
      {/* Right Section: Amount and optional Checkbox */}
      <div className="flex items-center space-x-3">
        {/* Amount */}
        <div className="text-xs font-semibold text-gray-900">
          {amount}
        </div>
        
        {/* Checkbox - only show if showCheckbox is true */}
        {showCheckbox && (
          <input
            type="checkbox"
            checked={isChecked}
            onChange={handleCheckboxChange}
            className="w-3 h-3 text-[#040b2b] bg-gray-100 border-gray-300 rounded focus:ring-[#040b2b] focus:ring-1 flex-shrink-0"
          />
        )}
      </div>
    </div>
  );
}