// src/components/OwedCardSettleup.jsx
import React from 'react';

export default function OwedCardSettleup({
  dateMonth,
  dateDay,
  image,
  title,
  description,
  amount,
  style = '',
}) {
  return (
    <div
      className={`
        flex items-center justify-between
        p-2 mx-2 pb-3
        border-b border-gray-200
        ${style}
      `}
    >
      {/* Left Section: Date, Thumbnail & Info */}
      <div className="flex items-center space-x-4">
        {/* Date */}
        <div className="text-center">
          <div className="text-xs font-thin text-gray-900">{dateMonth}</div>
          <div className="text-xs font-thin text-gray-900">{dateDay}</div>
        </div>

        {/* Thumbnail */}
        <img src={image} alt={title} className="w-10 h-10 rounded-lg" />

        {/* Title & Description */}
        <div>
          <p className="text-xs font-normal text-gray-900">{title}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>

      {/* Right Section: Amount */}
      <div className="text-xs font-semibold text-gray-900">
        {amount}
      </div>
    </div>
  );
}
