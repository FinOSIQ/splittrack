import React from 'react';
import GroupCardImage from '../assets/GroupCardImage.png';

export default function GroupCard({ group }) {
  // Format netAmount for display
  const formatAmount = (amount) => {
    return amount !== null
      ? `${Math.abs(parseFloat(amount)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LKR`
      : '0.00 LKR';
  };

  // Determine amount color and label
  const amountColor = group.netAmount < 0 ? '#008000' : '#a00c0c';
  const amountLabel = group.netAmount < 0 ? 'You Are Owed' : 'You Owe';

  // Get first two participants and count of additional ones
  const displayedParticipants = group.participantNames.slice(0, 2);
  const extraParticipants = group.participantNames.length - 2;

  return (
    <div className="flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-md p-4 w-full max-w-md">
        <div className="flex items-center mb-2">
          <img className="w-12 h-12 rounded-full mr-4" src={GroupCardImage} alt="Group Avatar" />
          <div>
            <h2 className="text-lg text-[#040b2b] font-medium">{group.groupName}</h2>
            <p className="text-xs text-[#5c5470]">10 Dec, 2023</p> {/* TODO: Replace with dynamic date if available */}
          </div>
        </div>
        <hr className="border-t border-[#f1f2f9] my-2" />
        <div className="text-xs text-[#5c5470] mb-0">
          {displayedParticipants.map((name, index) => (
            <p key={index}>{name.trim()}</p>
          ))}
          {extraParticipants > 0 && (
            <p className="font-light">+{extraParticipants} more</p>
          )}
        </div>
        <p className="text-sm text-right text-[#040b2b] font-medium">{amountLabel}</p>

        <div className="flex justify-between items-center">
          <button className="px-3 py-1 bg-white border rounded-xl italic text-xs font-medium text-[#5c5470]">
            View Details
          </button>
          <div className="text-right">
            <div className="bg-[#f49d9d] bg-opacity-75 rounded px-3 py-1">
              <p className={`text-xs font-bold`} style={{ color: amountColor }}>
                {formatAmount(group.netAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}