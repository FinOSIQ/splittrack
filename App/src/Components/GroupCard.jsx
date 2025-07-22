import React from 'react';
import { useNavigate } from 'react-router-dom';

// Function to generate avatar for group data
const generateAvatar = (name) => {
  const firstLetter = name.charAt(0).toUpperCase();
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  const colorIndex = firstLetter.charCodeAt(0) % colors.length;
  
  return {
    letter: firstLetter,
    backgroundColor: colors[colorIndex]
  };
};

export default function GroupCard({ group }) {
  const navigate = useNavigate();

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

  // Handle navigation to group view
  const handleViewDetails = () => {
    // Navigate to group view with the group ID as a URL parameter
    navigate(`/group/${group.groupId}`);
  };

  // Handle card click (entire card clickable)
  const handleCardClick = () => {
    navigate(`/group/${group.groupId}`);
  };

  return (
    <div className="flex justify-center items-center p-4">
      <div 
        className="bg-white rounded-xl shadow-md p-4 w-full max-w-md h-[220px] cursor-pointer hover:shadow-lg transition-shadow duration-200 flex flex-col"
        onClick={handleCardClick}
      >
        <div className="flex items-center mb-2">
          {(() => {
            const avatar = generateAvatar(group.groupName || 'Group');
            return (
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold mr-4"
                style={{ backgroundColor: avatar.backgroundColor }}
              >
                {avatar.letter}
              </div>
            );
          })()}
          <div>
            <h2 className="text-lg text-[#040b2b] font-medium">{group.groupName}</h2>
            <p className="text-xs text-[#5c5470]">10 Dec, 2023</p> {/* TODO: Replace with dynamic date if available */}
          </div>
        </div>
        <hr className="border-t border-[#f1f2f9] my-2" />
        <div className="text-xs text-[#5c5470] mb-2 flex-1 overflow-hidden">
          {displayedParticipants.map((name, index) => (
            <p key={index} className="truncate">{name.trim()}</p>
          ))}
          {extraParticipants > 0 && (
            <p className="font-light">+{extraParticipants} more</p>
          )}
        </div>
        <div className="mt-auto">
          <p className="text-sm text-right text-[#040b2b] font-medium mb-2">{amountLabel}</p>

          <div className="flex justify-between items-center">
            <button 
              className="px-3 py-1 bg-white border rounded-xl italic text-xs font-medium text-[#5c5470] hover:bg-gray-50 transition-colors duration-200"
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click when button is clicked
                handleViewDetails();
              }}
            >
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
    </div>
  );
}