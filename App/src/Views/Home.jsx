import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import gsap from 'gsap';
import GroupCard from '../Components/GroupCard';
import HeaderProfile from '../Components/HeaderProfile';
import YourBalanceCard from '../Components/YourBalanceCard';
import FriendReqComponent from '../Components/FriendReqComponent';
import NavBar from '../Components/NavBar';
import MobileOverlay from "../Components/MobileOverlay";
import useIsMobile from '../utils/useIsMobile';

export default function Home() {
  // State for user data, group data, loading, and error
  const [userData, setUserData] = useState({ userName: 'Guest', balance: null });
  const [groups, setGroups] = useState([]);
  const [userLoading, setUserLoading] = useState(true);
  const [groupLoading, setGroupLoading] = useState(true);
  const [userError, setUserError] = useState(null);
  const [groupError, setGroupError] = useState(null);
  const [showFriendRequests, setShowFriendRequests] = useState(false);
  
  const groupsListRef = useRef(null);
  const isMobile = useIsMobile();

  // Animation effect for groups list
  useEffect(() => {
    if (groupsListRef.current) {
      gsap.fromTo(
        groupsListRef.current,
        { x: -100, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [groups]);

  // Fetch user expense summary
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          'http://localhost:9090/api_expense/v1/userExpenseSummary',
          { withCredentials: true }
        );
        setUserData({
          userName: response.data.summary.userName,
          balance: response.data.summary.netAmount,
        });
        setUserLoading(false);
        console.log(response);
        
      } catch (err) {
        setUserError(err.message || 'Failed to fetch user data');
        setUserLoading(false);
        console.error('Error fetching user data:', err.response ? err.response.data : err.message);
      }
    };

    fetchUserData();
  }, []); // Empty dependency array to run once on mount

  // Fetch group expenses
  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const response = await axios.get(
          'http://localhost:9090/api_expense/v1/groupExpenses',
          { withCredentials: true }
        );
        setGroups(response.data.groups || []);
        setGroupLoading(false);
      } catch (err) {
        setGroupError(err.message || 'Failed to fetch group data');
        setGroupLoading(false);
        console.error('Error fetching group data:', err.response ? err.response.data : err.message);
      }
    };

    fetchGroupData();
  }, []); // Empty dependency array to run once on mount

  return (
    <>
      {isMobile ? (
        <MobileOverlay />
      ) : (
        <NavBar />
      )}

      <div className="ml-8 mt-2">
        <HeaderProfile
          userName={userData.userName}
          loading={userLoading}
          error={userError}
        />
        
        <div className="h-[80vh] flex bg-white rounded-md md:mx-5 -mt-8 md:mt-4 overflow-hidden">
          {/* Left */}
          <div className="xl:w-[70%] lg:w-[60%] w-full p-4 flex flex-col">
            <h2 className="text-2xl font-bold mb-4">Groups</h2>

            {/* Balance card on mobile above groups list */}
            <div className="block lg:hidden mb-4">
              <YourBalanceCard
                balance={userData.balance}
                loading={userLoading}
                error={userError}
              />
              
              {/* Friend Requests Button on mobile */}
              <div className="mt-3 flex justify-end">
                <button 
                  className=" py-1.5 px-3 rounded-lg text-sm font-medium"
                  onClick={() => setShowFriendRequests(true)}
                >
                  Friend Requests
                </button>
              </div>
            </div>

            {/* Groups list */}
         
              <div className="grid grid-cols-2 gap-4">
                {groupLoading ? (
                  <div className="col-span-2 text-center text-[#040b2b] text-lg">
                    Loading groups...
                  </div>
                ) : groupError ? (
                  <div className="col-span-2 text-center text-red-500 text-lg">
                    Error: {groupError}
                  </div>
                ) : groups.length === 0 ? (
                  <div className="col-span-2 text-center text-[#040b2b] text-lg">
                    No groups found
                  </div>
                ) : (
                  groups.map((group, index) => (
                    <GroupCard key={index} group={group} />
                  ))
                )}
              </div>
          
          </div>

          {/* Desktop Right */}
          <div className="xl:w-[30%] lg:w-[40%] hidden lg:flex flex-col p-4 bg-[#f1f2f9] rounded-2xl">
            <h2 className="text-2xl font-bold mb-4">Your Balance</h2>
            <YourBalanceCard
              balance={userData.balance}
              loading={userLoading}
              error={userError}
            />
            <div className="mt-6 flex-1 overflow-y-auto scrollable-div">
              <FriendReqComponent />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Modal for Friend Requests */}
      {showFriendRequests && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 lg:hidden"
          onClick={() => setShowFriendRequests(false)}
        >
          <div
            className="bg-[#f1f2f9] w-11/12 max-w-sm rounded-2xl overflow-hidden flex flex-col max-h-[80vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Scrollable friend requests */}
            <div className="p-4 flex-1 overflow-y-auto">
              <h3 className="text-lg font-medium mb-4">
                Friend Requests
              </h3>
              <FriendReqComponent />
            </div>
          </div>
        </div>
      )}
    </>
  );
}