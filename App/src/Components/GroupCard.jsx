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

  // Determine amount color, background color and label based on amount
  const getAmountStyling = (amount) => {
    const numAmount = parseFloat(amount || 0);
    
    if (numAmount < 0) {
      // You are owed money - green background, green text
      return {
        textColor: '#008000',
        backgroundColor: '#d4edda', // Light green background
        label: 'You Are Owed'
      };
    } else {
      // You owe money - red background, red text  
      return {
        textColor: '#dc3545',
        backgroundColor: '#f8d7da', // Light red background
        label: 'You Owe'
      };
    }
  };

  const amountStyling = getAmountStyling(group.netAmount);

  // Get first two participants and count of additional ones
  const displayedParticipants = (group.participantNames || []).slice(0, 2);
  const extraParticipants = Math.max(0, (group.participantNames || []).length - 2);

  // Handle navigation to group view or expense view
  const handleViewDetails = () => {
    if (group.isNonGroupExpense) {
      // Navigate to expense view for non-group expenses
      navigate(`/expense/${group.groupId}`);
    } else {
      // Navigate to group view with the group ID as a URL parameter
      navigate(`/group/${group.groupId}`);
    }
  };

  // Handle card click (entire card clickable)
  const handleCardClick = () => {
    if (group.isNonGroupExpense) {
      // Navigate to expense view for non-group expenses
      navigate(`/expense/${group.groupId}`);
    } else {
      navigate(`/group/${group.groupId}`);
    }
  };

  return (
    <div
      className="bg-white rounded-xl shadow-md p-4 w-full h-[220px] cursor-pointer hover:shadow-lg transition-shadow duration-200 flex flex-col"
      onClick={handleCardClick}
    >
      <div className="flex items-center mb-2">
        {(() => {
          const avatar = generateAvatar(group.groupName || 'Group');
          return (
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold mr-4 flex-shrink-0"
              style={{ backgroundColor: avatar.backgroundColor }}
            >
              {avatar.letter}
            </div>
          );
        })()}
        <div className="min-w-0 flex-1">
          <h2 className="text-lg text-[#040b2b] font-medium truncate">{group.groupName}</h2>
          <p className="text-xs text-[#5c5470]">10 Dec, 2023</p> {/* TODO: Replace with dynamic date if available */}
        </div>
      </div>
      
      <hr className="border-t border-[#f1f2f9] my-2 flex-shrink-0" />
      
      <div className="text-xs text-[#5c5470] mb-2 flex-1 overflow-hidden">
        {displayedParticipants.length > 0 ? (
          <>
            {displayedParticipants.map((name, index) => (
              <p key={index} className="truncate">{name.trim()}</p>
            ))}
            {extraParticipants > 0 && (
              <p className="font-light">+{extraParticipants} more</p>
            )}
          </>
        ) : (
          <p className="text-xs text-[#5c5470]">
            {group.isNonGroupExpense ? 'Individual expense' : 'No participants'}
          </p>
        )}
      </div>
      
      <div className="mt-auto flex-shrink-0">
        <p className="text-sm text-right text-[#040b2b] font-medium mb-2">{amountStyling.label}</p>
        <div className="flex justify-between items-center">
          <button
            className="px-3 py-1 bg-white border rounded-xl italic text-xs font-medium text-[#5c5470] hover:bg-gray-50 transition-colors duration-200 flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click when button is clicked
              handleViewDetails();
            }}
          >
            View Details
          </button>
          <div className="text-right flex-shrink-0">
            <div 
              className="rounded px-3 py-1"
              style={{ backgroundColor: amountStyling.backgroundColor }}
            >
              <p 
                className="text-xs font-bold whitespace-nowrap"
                style={{ color: amountStyling.textColor }}
              >
                {formatAmount(group.netAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}