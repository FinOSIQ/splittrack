import React, { useEffect, useState } from "react";
import FriendReqCard from "../Components/FriendReqCard";
import useUserData from '../hooks/useUserData';

export default function FriendReqComponent({ onFriendsUpdate }) {
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingRequests, setProcessingRequests] = useState(new Set());
  const { user, loading: userLoading } = useUserData();

  // Fetch friend requests
  const fetchFriendRequests = async () => {
    if (userLoading || !user?.user_Id) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:9090/api_friend/v1/friendrequests/${user.user_Id}`, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error("Network error");
      
      const data = await response.json();
      console.log("📦 FriendRequests fetched from backend:", data);
      setFriendRequests(data.friendRequests || []);
    } catch (error) {
      console.error("Failed to fetch friend requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriendRequests();
  }, [user, userLoading]);

  const handleAction = async (requestId, action) => {
    // Add to processing set to show loading state
    setProcessingRequests(prev => new Set([...prev, requestId]));

    try {
      const response = await fetch(`http://localhost:9090/api_friend/v1/friendRequests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ status: action }),
      });

      if (response.ok) {
        // Remove the processed request from UI immediately
        setFriendRequests(prev => prev.filter(req => req.friendReq_ID !== requestId));
        console.log(`✅ Friend request ${action} successfully`);
        
        // 🔥 KEY ADDITION: Refresh friends list in parent component
        if (action === "accepted" && onFriendsUpdate) {
          console.log("🔄 Calling parent to refresh friends list");
          // Add a small delay to ensure backend processing is complete
          setTimeout(() => {
            onFriendsUpdate();
          }, 500);
        }
        
      } else {
        let errorMessage = "Unknown error";
        try {
          const errData = await response.json();
          errorMessage = errData.error || errorMessage;
        } catch (e) {}
        console.error(`Failed to ${action} friend request: ${errorMessage}`);
        
        // Refresh data on error to maintain consistency
        fetchFriendRequests();
      }
    } catch (error) {
      console.error(`Error during ${action}:`, error);
      // Refresh data on error
      fetchFriendRequests();
    } finally {
      // Remove from processing set
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  if (userLoading) {
    return (
      <div className="mx-1 my-4 py-3 bg-white rounded-[32px] pr-3">
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#040b2b] mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-1 my-4 py-3 bg-white rounded-[32px] pr-3">
      <div className="p-4 space-y-4 xl:h-[calc(64vh)] lg:h-[61vh] max-h-[530px] overflow-y-auto scrollable-div">
        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#040b2b] mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Loading friend requests...</p>
          </div>
        ) : friendRequests.length === 0 ? (
          <p className="text-gray-500 text-center">No pending friend requests.</p>
        ) : (
          friendRequests.map((req) => (
            <FriendReqCard
              key={req.friendReq_ID}
              img="https://placehold.co/60x61"
              name={req.senderName}
              email={req.senderEmail}
              isProcessing={processingRequests.has(req.friendReq_ID)}
              onAccept={() => handleAction(req.friendReq_ID, "accepted")}
              onDecline={() => handleAction(req.friendReq_ID, "declined")}
            />
          ))
        )}
      </div>
    </div>
  );
}