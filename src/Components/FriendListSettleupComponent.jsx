// src/components/FriendListComponent.jsx
import React from 'react';
import SettleUpFriendCard from './SettleUpFriendCard';

export default function FriendListComponent({ friends, type, onFriendClick }) {
  return (
    <>
      {friends.map(friend => (
        <SettleUpFriendCard
          key={friend.id}
          {...friend}
          type={type}
          onClick={() => onFriendClick(friend)}
        />
      ))}
    </>
  );
}
