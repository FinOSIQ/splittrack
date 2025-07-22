// In your Home.jsx file, replace the Friend Requests section with Recent Activity

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import GroupCard from '../Components/GroupCard';
import HeaderProfile from '../Components/HeaderProfile';
import YourBalanceCard from '../Components/YourBalanceCard';
import RecentActivityComponent from '../Components/RecentActivityComponent'; // Import the new component
import NavBar from '../Components/NavBar';
import MobileOverlay from "../Components/MobileOverlay";
import useIsMobile from '../utils/useIsMobile';
import { fetchGroupExpenses } from '../utils/requests/expense';

export default function Home() {
  // State for group data, loading, and error
  const [groups, setGroups] = useState([]);
  const [groupLoading, setGroupLoading] = useState(true);
  const [groupError, setGroupError] = useState(null);
  const [showRecentActivity, setShowRecentActivity] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const groupsListRef = useRef(null);
  const isMobile = useIsMobile();

  // Filter groups based on search query
  const filteredGroups = groups.filter(group =>
    group.groupName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  // Fetch group expenses
  useEffect(() => {
    const loadGroupData = async () => {
      try {
        setGroupLoading(true);
        setGroupError(null);
        
        const response = await fetchGroupExpenses();
        
        if (response && response.groups) {
          setGroups(response.groups);
        } else {
          setGroups([]);
        }
        console.log('Groups data:', response.groups); 
      } catch (err) {
        console.error('Error loading group data:', err);
        setGroupError(err.message || 'Failed to load groups');
        setGroups([]);
      } finally {
        setGroupLoading(false);
      }
    };

    loadGroupData();
  }, []);

  return (
    <>
      {isMobile ? (
        <MobileOverlay />
      ) : (
        <NavBar />
      )}

      <div className="ml-0 lg:ml-14 mt-2 px-2 lg:px-0">
        <HeaderProfile />
        
        {/* Fixed height container to prevent overflow */}
        <div className={`${isMobile ? 'min-h-screen' : 'h-[calc(100vh-140px)]'} flex bg-white rounded-md mx-1 lg:mx-5 -mt-8 md:mt-4 overflow-hidden`}>
          
          {/* Left Section - Groups */}
          <div className={`xl:w-[70%] lg:w-[60%] w-full p-2 lg:p-4 flex flex-col min-h-0`}>
            
            {/* Search Bar - Fixed */}
            <div className="bg-[#f1f2f9] rounded-lg flex items-center px-4 border border-gray-300 focus-within:border-blue-500 mb-4 h-12 flex-shrink-0">
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
                <circle cx="10" cy="10" r="7"></circle>
              </svg>
              <input
                type="text"
                placeholder="Search Groups, Friends, Users ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent outline-none text-gray-900 placeholder-gray-500 text-sm pl-2"
              />
            </div>

            {/* Groups Heading - Fixed */}
            <h2 className="text-2xl font-bold mb-4 hidden lg:block flex-shrink-0">Groups</h2>

            {/* Balance card on mobile above groups list - Fixed */}
            <div className="block lg:hidden mb-4 flex-shrink-0">
              <YourBalanceCard />
              
              {/* Recent Activity Button on mobile */}
              <div className="mt-3 flex justify-end">
                <button 
                  className="py-1.5 px-3 rounded-lg text-sm font-medium text-[#040b2b] hover:bg-gray-100 transition-colors"
                  onClick={() => setShowRecentActivity(true)}
                >
                  Recent Activity
                </button>
              </div>

              {/* Groups heading for mobile/tablet */}
              <h2 className="text-2xl font-bold mb-4 mt-6">Groups</h2>
            </div>

            {/* Groups list - Scrollable */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {groupLoading ? (
                  <div className="col-span-1 lg:col-span-2 text-center text-[#040b2b] text-lg py-8">
                    Loading groups...
                  </div>
                ) : groupError ? (
                  <div className="col-span-1 lg:col-span-2 text-center text-red-500 text-lg py-8">
                    Error: {groupError}
                  </div>
                ) : filteredGroups.length === 0 ? (
                  <div className="col-span-1 lg:col-span-2 text-center text-[#040b2b] text-lg py-8">
                    {searchQuery ? 'No groups match your search' : 'No groups found'}
                  </div>
                ) : (
                  filteredGroups.map((group, index) => (
                    <GroupCard key={index} group={group} />
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Desktop Right - Recent Activity instead of Friend Requests - Fixed */}
          <div className="xl:w-[30%] lg:w-[40%] hidden lg:flex flex-col p-4 bg-[#f1f2f9] rounded-2xl min-h-0">
            
            {/* Balance Section - Fixed */}
            <div className="flex-shrink-0">
              <h2 className="text-2xl font-bold mb-4">Your Balance</h2>
              <YourBalanceCard />
            </div>
            
            {/* Recent Activity Section - Scrollable */}
            <div className="mt-6 flex-1 min-h-0 flex flex-col">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h3 className="text-lg font-medium text-[#040b2b]">Recent Activity</h3>
                <button className="text-xs text-blue-600 hover:text-blue-800">
                  Refresh
                </button>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto">
                <RecentActivityComponent />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Modal for Recent Activity */}
      {showRecentActivity && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 lg:hidden"
          onClick={() => setShowRecentActivity(false)}
        >
          <div
            className="bg-[#f1f2f9] w-11/12 max-w-sm rounded-2xl overflow-hidden flex flex-col max-h-[80vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Scrollable recent activity */}
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Recent Activity</h3>
                <button
                  onClick={() => setShowRecentActivity(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✖
                </button>
              </div>
              <RecentActivityComponent />
            </div>
          </div>
        </div>
      )}
    </>
  );
}