import React, { useState, useEffect } from 'react';
import { fetchUserExpenseSummary } from '../utils/requests/expense';

const YourBalanceCard = ({ refreshTrigger }) => { // Add refreshTrigger prop
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user balance data
  const loadUserBalance = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchUserExpenseSummary();
      
      if (response && response.summary) {
        setBalance(response.summary.netAmount);
      } else {
        setBalance(0);
      }
    } catch (err) {
      console.error('Error loading user balance:', err);
      setError(err.message || 'Failed to load balance');
      setBalance(0);
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadUserBalance();
  }, []);

  // Refresh data when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0) { // Only refresh if refreshTrigger is a positive number
      loadUserBalance();
    }
  }, [refreshTrigger]);

  // Format balance for display
  const formatBalance = (amount) => {
    const absAmount = Math.abs(parseFloat(amount || 0));
    return `${absAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LKR`;
  };

  // Determine text color based on balance (red for negative/debt, green for positive/owed)
  const getBalanceColor = (amount) => {
    const numAmount = parseFloat(amount || 0);
    return numAmount < 0 ? '#ff4444' : '#83fb62'; // Red for debt, green for owed
  };

  return (
    <div className="px-0 py-4">
      <div
        className="
          w-full h-[135px]
          rounded-xl
          p-4
          flex items-center
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
            <div 
              className="text-2xl font-bold font-['Poppins']"
              style={{ color: getBalanceColor(balance) }}
            >
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