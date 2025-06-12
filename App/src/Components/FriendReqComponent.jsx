import React, { useEffect, useState } from "react";
import FriendReqCard from "../Components/FriendReqCard";

export default function FriendReqComponent() {
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = "711ca4dc"; // Replace with actual logged-in user's ID

  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        const response = await fetch(`http://localhost:9090/api_friend/v1/friendrequests/${userId}`);
        const data = await response.json();
        setFriendRequests(data.friendRequests || []);
      } catch (error) {
        console.error("Failed to fetch friend requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriendRequests();
  }, []);

  return (
    <div className="mx-1 my-4 py-3 bg-white rounded-[32px] pr-3">
      <div className="p-4 space-y-4 xl:h-[calc(64vh)] lg:h-[61vh] max-h-[530px] overflow-y-auto scrollable-div">
        {loading ? (
          <p>Loading friend requests...</p>
        ) : friendRequests.length === 0 ? (
          <p className="text-gray-500">No pending friend requests.</p>
        ) : (
          friendRequests.map((req, index) => (
            <FriendReqCard
              
              img="https://placehold.co/60x61" // Always placeholder for now
              name={req.senderName}
              email={req.senderEmail}
            />
          ))
        )}
      </div>
    </div>
  );
}
