import React, { useEffect, useState } from "react";
import FriendReqCard from "../Components/FriendReqCard";

export default function FriendReqComponent() {
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = "711ca4dc"; // replace with actual logged-in user ID

  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        const response = await fetch(`http://localhost:9090/api_friend/v1/friendrequests/${userId}`);
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

    fetchFriendRequests();
  }, []);

  const handleAction = async (requestId, action) => {
    try {
      const response = await fetch(`http://localhost:9090/api_friend/v1/friendRequests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });

      if (response.status === 204) {
        // Success — update UI without alert
        setFriendRequests(prev => prev.filter(req => req.friendReq_ID !== requestId));
      } else {
        let errorMessage = "Unknown error";
        try {
          const errData = await response.json();
          errorMessage = errData.error || errorMessage;
        } catch (e) {
          // Server returned no JSON body
        }
        console.error(`Failed to ${action} friend request: ${errorMessage}`);
      }
    } catch (error) {
      console.error(`Error during ${action}:`, error);
    }
  };

  return (
    <div className="mx-1 my-4 py-3 bg-white rounded-[32px] pr-3">
      <div className="p-4 space-y-4 xl:h-[calc(64vh)] lg:h-[61vh] max-h-[530px] overflow-y-auto scrollable-div">
        {loading ? (
          <p>Loading friend requests...</p>
        ) : friendRequests.length === 0 ? (
          <p className="text-gray-500">No pending friend requests.</p>
        ) : (
          friendRequests.map((req) => (
            <FriendReqCard
              key={req.friendReq_ID}
              img="https://placehold.co/60x61"
              name={req.senderName}
              email={req.senderEmail}
              onAccept={() => handleAction(req.friendReq_ID, "accepted")}
              onDecline={() => handleAction(req.friendReq_ID, "declined")}
            />
          ))
        )}
      </div>
    </div>
  );
}
