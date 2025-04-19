// src/components/TransactionHistoryComponent.jsx
import React from 'react';
import OwedCardSettleup from './OwedCardSettleup';

export default function TransactionHistoryComponent({
  transactions = [],
}) {
  return (
    <div className="relative bg-white rounded-2xl p-4 flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollable-div">
        {transactions.length > 0 ? (
          transactions.map(tx => <OwedCardSettleup key={tx.id} {...tx} />)
        ) : (
          <p className="text-center text-gray-500 mt-6">No transactions yet</p>
        )}
      </div>
      <button className="mt-4 self-end px-4 py-0.5 font-inter text-sm bg-[#040B2B] text-white rounded-lg">
        Pay Now
      </button>
    </div>
  );
}
