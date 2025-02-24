import React from 'react';

const YourBalanceCard = () => {
  return (
    <div className="px-8 py-4"> 
      <div
        className="
          w-full h-[135px]
          rounded-xl
          p-4
          flex items-center relative
          bg-[radial-gradient(at_top_left,_#dddbff,_#040B2B)]
        "
      >
        {/* Right-aligned content container */}
        <div className="ml-auto flex flex-col items-end space-y-2">
          {/* Small label */}
          <div className="text-white text-sm font-normal font-['Poppins']">
            Your Balance
          </div>
          
          {/* Big green amount */}
          <div className="text-[#83fb62] text-2xl font-bold font-['Poppins']">
            21,468.00 LKR
          </div>
          
          {/* 'View More' button */}
          <div
            className="
              px-[7px] 
              bg-[#f1f2f9]/0 
              rounded-[15px] 
              shadow-[0px_2px_0px_0px_rgba(0,0,0,0.02)] 
              border border-[#d9d9d9] 
              flex justify-center items-center gap-2.5 
              overflow-hidden
            "
          >
            <div className="text-center text-white text-sm font-normal font-['Roboto'] leading-snug">
              View More
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YourBalanceCard;
