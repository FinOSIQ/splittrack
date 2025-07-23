import React, { useState } from 'react';
import { sendFriendRequest } from '../utils/requests/Friend';
import { useUser } from '../contexts/UserContext';
import { toast } from 'sonner';


const AddFriendButton = ({ targetUserId, targetUserName, size = 'small', className = '' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { user } = useUser();


  const handleAddFriend = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading || isSent) return;
    
    if (!user?.user_Id) {
      toast.error('Please log in to send friend requests');
      return;
    }

    if (user.user_Id === targetUserId) {
      toast.warning('You cannot send a friend request to yourself');
      return;
    }

    setIsLoading(true);

    try {
      await sendFriendRequest(user.user_Id, targetUserId);
      setIsSent(true);
      toast.success(`Friend request sent to ${targetUserName || 'user'}!`);
    } catch (error) {
      console.error('Error sending friend request:', error);
      
      // Handle specific error cases
      if (error.response?.status === 409) {
        toast.warning('Friend request already sent or you are already friends');
        setIsSent(true);
      } else if (error.response?.status === 404) {
        toast.error('User not found');
      } else {
        toast.error('Failed to send friend request. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonClasses = () => {
    const baseClasses = "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-full font-medium flex items-center gap-1.5 transition-all duration-200 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group border-0 outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1";
    
    switch (size) {
      case 'small':
        return `${baseClasses} h-7 px-3 text-xs`;
      case 'medium':
        return `${baseClasses} h-8 px-4 text-sm`;
      case 'large':
        return `${baseClasses} h-10 px-6 text-base`;
      default:
        return `${baseClasses} h-7 px-3 text-xs`;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 'w-3 h-3';
      case 'medium':
        return 'w-4 h-4';
      case 'large':
        return 'w-5 h-5';
      default:
        return 'w-3 h-3';
    }
  };

  if (isSent) {
    return (
      <button
        disabled
        className={`${getButtonClasses().replace('bg-blue-600 hover:bg-blue-700 active:bg-blue-800', 'bg-green-100 text-green-700 border border-green-200')} cursor-default ${className}`}
      >
        <svg className={getIconSize()} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <span className="hidden sm:inline">Sent</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleAddFriend}
      disabled={isLoading}
      className={`${getButtonClasses()} ${className}`}
      title={`Add ${targetUserName || 'user'} as friend`}
    >
      {isLoading ? (
        <>
          <div className={`${getIconSize()} animate-spin rounded-full border-2 border-white border-t-transparent`}></div>
          <span className="hidden sm:inline">Adding...</span>
        </>
      ) : (
        <>
          <svg 
            className={`${getIconSize()} group-hover:scale-110 transition-transform duration-200`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span className="hidden sm:inline">Add</span>
        </>
      )}
    </button>
  );
};

export default AddFriendButton;
