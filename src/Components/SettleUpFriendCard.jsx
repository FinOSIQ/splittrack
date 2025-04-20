import React from 'react';

export default function SettleUpFriendCard({
  img,
  name,
  email,
  amount,
  type,       // 'toPay' or 'toBePaid'
  onClick,
}) {
  // red badge if I owe them, green if they owe me
  const badgeClass =
    type === 'toPay'
      ? 'bg-red-100 text-red-700'
      : 'bg-green-100 text-green-700';

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
    >
      <div className="flex items-center space-x-4">
        <img src={img} alt={name} className="w-10 h-10 rounded-full" />
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
