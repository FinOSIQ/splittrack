// OwedCard.jsx
import React from 'react';
import ExpenseImage from '../images/plate.png'; // Adjust the path as necessary


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
  friendAmount = '0'
}) => {
  
  // Determine who paid based on the role
  const getPaymentDescription = () => {
    if (currentUserRole === 'creator') {
      return `You paid LKR ${totalAmount}`;
    } else if (friendRole === 'creator') {
      return `${friendName} paid LKR ${totalAmount}`;
    } else {
      return `Shared expense - LKR ${totalAmount}`;
    }
  };
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl border border-gray-200 shadow-sm mb-4 w-full sm:w-[60%] md:w-[80%] lg:w-[70%] xl:w-[94%] mx-auto transition-all duration-300 ">

      {/* Date and image section */}
      <div className="flex items-center mb-4 sm:mb-0">
        <div className="mr-4 text-center">
          <div className="text-[#040b2b] text-base font-normal font-['Poppins'] leading-[24.94px]">{dateMonth}</div>
          <div className="text-center text-[#040b2b] text-base font-normal font-['Poppins'] leading-[24.94px]">{dateDay}</div>
        </div>
        <img src={ExpenseImage} alt="Expense" className="w-[74px] h-[67px]" />
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
