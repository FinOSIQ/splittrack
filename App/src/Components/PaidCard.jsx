import React from 'react';

const PaidCard = ({ 
  dateMonth = 'Dec', 
  dateDay = '18', 
  image = "src/images/Frame.png", 
  title = 'Dinner', 
  description = 'You Paid LKR 5,000.00', 
  amount = '5,000.00 LKR' 
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl border border-gray-200 shadow-sm mb-4 w-full sm:w-[60%] md:w-[80%] lg:w-[70%] xl:w-[94%] mx-auto transition-all duration-300">

      {/* Date and image section */}
      <div className="flex items-center mb-4 sm:mb-0">
        <div className="mr-4 text-center">
          <div className="text-[#040b2b] text-base font-normal font-['Poppins'] leading-[24.94px]">{dateMonth}</div>
          <div className="text-center text-[#040b2b] text-base font-normal font-['Poppins'] leading-[24.94px]">{dateDay}</div>
        </div>
        <div className="w-[74px] h-[67px] flex items-center justify-center bg-green-100 rounded-lg">
          <span className="text-xl font-semibold text-green-700">paid</span>
        </div>
        <div className="ml-4">
          <div className="text-[#040b2b] text-sm font-normal font-['Poppins'] leading-[24.94px]">{title}</div>
          <div className="text-[#61677d] text-xs font-light font-['Poppins'] leading-[24.94px]">{description}</div>
        </div>
      </div>

      {/* Amount section */}
      <div className="text-right">
        <div className="text-[#22C55E] text-base font-semibold font-['Poppins']">
          {amount}
        </div>
      </div>
    </div>
  );
};

export default PaidCard;
