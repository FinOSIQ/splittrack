

// In your Home.jsx file, replace the Friend Requests section with Recent Activity
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import axios from 'axios';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';
import GroupCard from '../Components/GroupCard';
import HeaderProfile from '../Components/HeaderProfile';
import YourBalanceCard from '../Components/YourBalanceCard';
import RecentActivityComponent from '../Components/RecentActivityComponent'; // Import the new component
import NavBar from '../Components/NavBar';
import MobileOverlay from "../Components/MobileOverlay";
import SearchResults from '../Components/SearchResults';
import { fetchSearchData } from '../utils/requests/expense';
import { useUserData } from '../hooks/useUserData';
import useIsMobile from '../utils/useIsMobile';
import { fetchGroupExpenses, fetchNonGroupExpenses } from '../utils/requests/expense';

// Constants for search functionality
const SEARCH_DEBOUNCE_MS = 300;
const MIN_SEARCH_LENGTH = 2;
const INITIAL_SEARCH_STATE = { users: [], friends: [], groups: [] };

export default function Home() {

  
   const navigate = useNavigate();
  const { user } = useUserData();
  
  // State for user data, group data, loading, and error
  const [userData, setUserData] = useState({ userName: 'Guest', balance: null });
  const [groups, setGroups] = useState([]);
  const [groupLoading, setGroupLoading] = useState(true);
  const [groupError, setGroupError] = useState(null);
  const [nonGroupExpenses, setNonGroupExpenses] = useState([]);
  const [nonGroupLoading, setNonGroupLoading] = useState(true);
  const [nonGroupError, setNonGroupError] = useState(null);
  const [showRecentActivity, setShowRecentActivity] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(INITIAL_SEARCH_STATE);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const groupsListRef = useRef(null);
  const searchContainerRef = useRef(null);
  const cancelTokenRef = useRef(null);
  const isMobile = useIsMobile();

  // Handle clicking outside search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    if (showSearchResults) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSearchResults]);

  // Memoized values
  const trimmedQuery = useMemo(() => searchQuery.trim(), [searchQuery]);
  const hasResults = useMemo(() => 
    searchResults.users.length > 0 || 
    searchResults.friends.length > 0 || 
    searchResults.groups.length > 0
  , [searchResults]);



  // Utility functions
  const resetSearchState = useCallback(() => {
    setSearchResults(INITIAL_SEARCH_STATE);
    setSearchError(null);
    setHasSearched(false);
    setShowSearchResults(false);
  }, []);

  const transformSearchResults = useCallback((results) => ({
    users: (results.users || []).map(user => ({
      name: user.first_name || 'Unknown User',
      email: user.email || '',
      user_id: user.user_id
    })),
    friends: (results.friends || []).map(friend => ({
      name: friend.first_name || 'Unknown Friend',
      email: friend.email || '',
      user_id: friend.user_id
    })),
    groups: (results.groups || []).map(group => ({
      name: group.name || 'Unknown Group',
      email: `Group ID: ${group.group_Id}`,
      group_id: group.group_Id
    }))
  }), []);

  // Handle search result item click
  const handleSearchItemClick = useCallback((item, type) => {
    console.log(`Clicked ${type}:`, item);

    // Reset search state
    setSearchQuery('');
    resetSearchState();

    // Navigation logic
    switch (type) {
      case 'user':
        console.log('Navigate to user:', item.user_id);
        break;
      case 'friend':
        navigate(`/friend/${item.user_id}`);
        break;
      case 'group':
        navigate(`/group/${item.group_id}`);
        break;
      default:
        console.log('Unknown type:', type);
    }
  }, [navigate, resetSearchState]);

  // Advanced search functionality with debouncing
  useEffect(() => {
    const performSearch = async () => {
      if (trimmedQuery.length === 0) {
        resetSearchState();
        return;
      }

      if (trimmedQuery.length < MIN_SEARCH_LENGTH) {
        setHasSearched(false);
        setShowSearchResults(false);
        return;
      }

      try {
        setIsSearching(true);
        setSearchError(null);
        setHasSearched(false);
        setShowSearchResults(true);

        // Cancel previous request if it exists
        if (cancelTokenRef.current) {
          cancelTokenRef.current.cancel("Operation canceled due to new request.");
        }

        // Create new cancel token
        cancelTokenRef.current = axios.CancelToken.source();

        // Get current user ID
        const userId = user?.user_Id || "";

        // Fetch search results
        const results = await fetchSearchData(
          trimmedQuery,
          'users,friends,groups',
          userId,
          cancelTokenRef.current.token
        );

        if (results && !axios.isCancel(results)) {
          const transformedResults = transformSearchResults(results);
          setSearchResults(transformedResults);
          setHasSearched(true);
        }
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error("Search error:", error);
          setSearchError("Failed to search. Please try again.");
          setSearchResults(INITIAL_SEARCH_STATE);
          setHasSearched(true);
        }
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce search
    const debounceTimer = setTimeout(performSearch, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [trimmedQuery, user?.user_Id, transformSearchResults, resetSearchState]);

  // Cleanup function to cancel ongoing requests
  useEffect(() => {
    return () => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel("Component unmounting");
      }
    };
  }, []);

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

  // Fetch non-group expenses
  useEffect(() => {
    const loadNonGroupData = async () => {
      try {
        setNonGroupLoading(true);
        setNonGroupError(null);
        
        const response = await fetchNonGroupExpenses();
        
        if (response && response.expenses) {
          setNonGroupExpenses(response.expenses);
        } else {
          setNonGroupExpenses([]);
        }
        console.log('Non-group expenses data:', response.expenses); 
      } catch (err) {
        console.error('Error loading non-group expenses:', err);
        setNonGroupError(err.message || 'Failed to load non-group expenses');
        setNonGroupExpenses([]);
      } finally {
        setNonGroupLoading(false);
      }
    };

    loadNonGroupData();
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
          

          {/* Left */}
          <div className={`xl:w-[70%] lg:w-[60%] w-full p-2 lg:p-4 flex flex-col ${isMobile ? '' : 'min-h-0'} lg:min-h-0 md:min-h-0`}>
            {/* Search Bar with Results */}
            <div className="mb-4" ref={searchContainerRef}>
              <div className="bg-[#f1f2f9] rounded-lg flex items-center px-4 border border-gray-300 focus-within:border-blue-500 h-12">
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
                  placeholder="Search Friends, Users ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent outline-none text-gray-900 placeholder-gray-500 text-sm pl-2"
                />
                {/* Loading indicator */}
                {isSearching && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 ml-2"></div>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div 
                  className="fixed mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto z-10"
                  style={{
                    top: searchContainerRef.current ? searchContainerRef.current.getBoundingClientRect().bottom + 8 : 'auto',
                    left: searchContainerRef.current ? searchContainerRef.current.getBoundingClientRect().left : 'auto',
                    width: searchContainerRef.current ? searchContainerRef.current.getBoundingClientRect().width : 'auto'
                  }}
                >
                  {searchError ? (
                    <div className="p-4 text-center text-red-600">
                      {searchError}
                    </div>
                  ) : trimmedQuery.length < MIN_SEARCH_LENGTH ? (
                    <div className="p-4 text-center text-gray-500">
                      Type at least {MIN_SEARCH_LENGTH} characters to search...
                    </div>
                  ) : isSearching ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                      Searching...
                    </div>
                  ) : hasSearched && !hasResults ? (
                    <div className="p-4 text-center text-gray-500">
                      No results found for "{trimmedQuery}"
                    </div>
                  ) : hasSearched && hasResults ? (
                    <SearchResults
                      searchData={searchResults}
                      onItemClick={handleSearchItemClick}
                    />
                  ) : null}
                </div>
              )}

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
                  ) : groups.length === 0 ? (
                  <div className="col-span-1 lg:col-span-2 text-center text-[#040b2b] text-lg">
                    No groups found

                  </div>
                ) : (
                  groups.map((group, index) => (
                    <GroupCard key={index} group={group} />
                  ))
                )}
              </div>

              {/* Non Group Expenses Section */}
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Non Group Expenses</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {nonGroupLoading ? (
                    <div className="col-span-1 lg:col-span-2 text-center text-[#040b2b] text-lg py-8">
                      Loading non-group expenses...
                    </div>
                  ) : nonGroupError ? (
                    <div className="col-span-1 lg:col-span-2 text-center text-red-500 text-lg py-8">
                      Error: {nonGroupError}
                    </div>
                  ) : nonGroupExpenses.length === 0 ? (
                    <div className="col-span-1 lg:col-span-2 text-center text-[#040b2b] text-lg">
                      No non-group expenses found
                    </div>
                  ) : (
                    nonGroupExpenses.map((expense, index) => (
                      <GroupCard 
                        key={`non-group-${index}`} 
                        group={{
                          groupId: expense.expenseId,
                          groupName: expense.expenseName || 'Unnamed Expense',
                          netAmount: expense.netAmount || 0,
                          participantNames: expense.participantNames || [],
                          isNonGroupExpense: true
                        }} 
                      />
                    ))
                  )}
                </div>
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