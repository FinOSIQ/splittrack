// OwedCard.jsx
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
  
  // Health/Medical
  if (titleLower.includes('hospital') || titleLower.includes('doctor') || 
      titleLower.includes('medical') || titleLower.includes('pharmacy')) {
    return '🏥';
  }
  
  // Bills/Utilities
  if (titleLower.includes('electric') || titleLower.includes('water') || 
      titleLower.includes('internet') || titleLower.includes('phone')) {
    return '📄';
  }
  
  // Default expense icon
  return '💰';
};

const OwedCard = ({ 
  dateMonth = 'Dec', 
  dateDay = '18', 
  title = 'Dinner', 
  description = 'You Paid LKR 5,000.00', 
  amount = '5,000.00 LKR',
  totalAmount = '100000',
  isOwed = true,
  friendName = 'Friend',
  currentUserRole = 'creator',
  friendRole = 'member',
  currentUserAmount = '0',
  friendAmount = '0',
  creatorName = 'Creator'
}) => {
  
  // Simply show creator's name and amount paid
  const getPaymentDescription = () => {
    return `${creatorName} paid LKR ${totalAmount}`;
  };
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl border border-gray-200 shadow-sm mb-4 w-full sm:w-[60%] md:w-[80%] lg:w-[70%] xl:w-[94%] mx-auto transition-all duration-300 ">

      {/* Date and image section */}
      <div className="flex items-center mb-4 sm:mb-0">
        <div className="mr-4 text-center">
          <div className="text-[#040b2b] text-base font-normal font-['Poppins'] leading-[24.94px]">{dateMonth}</div>
          <div className="text-center text-[#040b2b] text-base font-normal font-['Poppins'] leading-[24.94px]">{dateDay}</div>
        </div>
        <div className="w-[74px] h-[67px] flex items-center justify-center bg-gray-100 rounded-lg">
          <span className="text-3xl">{generateExpenseEmoji(title)}</span>
        </div>
        <div className="ml-4">
          <div className="text-[#040b2b] text-sm font-normal font-['Poppins'] leading-[24.94px]">{title}</div>
          
          <div className="text-[#61677d] text-xs font-light font-['Poppins'] leading-[24.94px]">
            {getPaymentDescription()}
          </div>
        </div>
      </div>

      {/* Amount section */}
      <div className="text-right">
        <div className={`text-base font-semibold font-['Poppins'] ${
          isOwed ? 'text-[#040b2b]' : 'text-[#040b2b]'
        }`}>
          {totalAmount} LKR
        </div>
      </div>
    </div>
  );
};

export default OwedCard;
