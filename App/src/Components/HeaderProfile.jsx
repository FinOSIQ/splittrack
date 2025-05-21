import React from 'react';

export default function HeaderProfile({ userName, loading, error }) {
  // Format userName for display (e.g., capitalize first letter of each word)
  const formatUserName = (name) => {
    if (!name) return 'Guest';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className="w-full h-28 flex justify-between items-center md:bg-[#f7f7f7] md:px-8 px-2">
      <img className="h-16 md:h-16 lg:h-24" src="/SplitTrack Logo.svg" alt="SplitTrack Logo" />

      <div className="md:flex items-center space-x-4 hidden">
        <div className="text-right">
          <div className="text-[#5c5470] text-sm font-normal font-['Inter']">Good Morning,</div>
          {loading ? (
            <div className="text-[#040b2b] text-2xl font-bold font-['Inter']">Loading...</div>
          ) : error ? (
            <div className="text-[#040b2b] text-2xl font-bold font-['Inter']">Guest</div>
          ) : (
            <div className="text-[#040b2b] text-2xl font-bold font-['Inter']">
              {formatUserName(userName)}
            </div>
          )}
        </div>
        <img className="w-[60px] h-[61px]" src="https://placehold.co/60x61" alt="Profile" />
      </div>

      
    </div>
  );
}