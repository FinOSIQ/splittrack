import React from 'react';

// Function to generate avatar based on first letter of name
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

export default function SettleUpFriendCard({
  img,
  name,
  email,
  amount,
  type, // 'toPay' or 'toBePaid'
  onClick,
}) {
  // red badge if I owe them, green if they owe me
  const badgeClass =
    type === 'toPay'
      ? 'bg-red-100 text-red-700'
      : 'bg-green-100 text-green-700';

  // Generate avatar if img is not provided or if we want to use first letter
  const avatar = generateAvatar(name);
  const shouldUseLetterAvatar = !img || img.includes('placehold.co');

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
    >
      <div className="flex items-center space-x-4">
        {shouldUseLetterAvatar ? (
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
            style={{ backgroundColor: avatar.backgroundColor }}
          >
            {avatar.letter}
          </div>
        ) : (
          <img src={img} alt={name} className="w-10 h-10 rounded-full" />
        )}
        <div>
          <p className="text-sm font-medium text-gray-900">{name}</p>
          <p className="text-xs text-gray-500">{email}</p>
        </div>
      </div>
      <div className={`px-3 py-1 rounded-lg font-semibold ${badgeClass}`}>
        {amount} LKR
      </div>
    </div>
  );
}