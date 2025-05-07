import React from 'react';

const YourBalanceCard = ({ balance, loading, error }) => {
  // Format balance for display
  const formatBalance = (amount) => {
    return amount !== null
      ? `${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LKR`
      : '0.00 LKR';
  };

  return (
    <div className="px-0 py-4">
      <div
        className="
          w-full h-[135px]
          rounded-xl
          p-4
          flex items-center relative
          bg-[radial-gradient(at_top_left,_#dddbff,_#040B2B)]
        "
      >
        <div className="ml-auto flex flex-col items-end space-y-2">
          <div className="text-white text-sm font-normal font-['Poppins']">
            Your Balance
          </div>

          {loading ? (
            <div className="text-[#83fb62] text-2xl font-bold font-['Poppins']">
              Loading...
            </div>
          ) : error ? (
            <div className="text-red-500 text-lg font-bold font-['Poppins']">
              Error: {error}
            </div>
          ) : (
            <div className="text-[#83fb62] text-2xl font-bold font-['Poppins']">
              {formatBalance(balance)}
            </div>
          )}

          <div
            className="
              px-[15px] 
              py-[7px]
              border-dotted
              bg-[#f1f2f9]/0 
              rounded-[12px] 
              shadow-[0px_2px_0px_0px_rgba(0,0,0,0.02)] 
              border border-[#d9d9d9] 
              flex justify-center items-center gap-2.5 
              overflow-hidden
            "
          >
            <div className="text-center text-white text-xs font-normal">
              View More
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YourBalanceCard;