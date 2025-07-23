// src/screens/SettleUp.jsx
import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import HeaderProfile from "../Components/HeaderProfile";
import SettleUpFriendCard from "../Components/SettleUpFriendCard";
import YourBalanceCard from "../Components/YourBalanceCard";
import TransactionHistoryComponent from "../Components/TransactionHistoryComponent";
import { 
  getOwesToMe, 
  getIOwe, 
  getExpenseDetails, 
  getOwesToMeDetails,
  formatExpenseDate 
} from "../utils/requests/SettleUp";

// Function to generate avatar for API data
const generateAvatar = (name) => {
  const firstLetter = name.charAt(0).toUpperCase();
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  const colorIndex = firstLetter.charCodeAt(0) % colors.length;
  
  return {
    letter: firstLetter,
    backgroundColor: colors[colorIndex]
  };
};

export default function SettleUp() {
  const [activeTab, setActiveTab] = useState("toPay");
  const [selectedFriend, setSelected] = useState(null);
  const [friendsData, setFriendsData] = useState([]);
  const [expenseDetails, setExpenseDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [balanceRefreshTrigger, setBalanceRefreshTrigger] = useState(0); // Add balance refresh trigger
  const listRef = useRef(null);

  // Load friends data when tab changes
  useEffect(() => {
    loadFriendsData();
  }, [activeTab]);

  // Load expense details when a friend is selected
  useEffect(() => {
    if (selectedFriend) {
      loadExpenseDetails();
    } else {
      setExpenseDetails([]);
    }
  }, [selectedFriend, activeTab]);

  // slide-in animation
  useEffect(() => {
    if (listRef.current) {
      gsap.fromTo(
        listRef.current,
        { x: -100, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [activeTab, friendsData]);

  const loadFriendsData = async () => {
    setLoading(true);
    setError(null);
    setSelected(null);
    setExpenseDetails([]);
    
    try {
      let response;
      if (activeTab === "toPay") {
        response = await getIOwe();
      } else {
        response = await getOwesToMe();
      }

      if (response.status === "success" && response.data) {
        // Transform API response to include avatars
        const friendsWithAvatars = response.data.map(friend => ({
          ...friend,
          avatar: generateAvatar(friend.userName)
        }));
        setFriendsData(friendsWithAvatars);
      } else {
        setFriendsData([]);
      }
    } catch (err) {
      setError(err.message);
      setFriendsData([]);
      console.error("Error loading friends data:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadExpenseDetails = async () => {
    setDetailsLoading(true);
    
    try {
      let response;
      if (activeTab === "toPay") {
        // Get expenses where current user owes money to selected creator
        response = await getExpenseDetails(selectedFriend.userId);
      } else {
        // Get expenses where selected member owes money to current user
        response = await getOwesToMeDetails(selectedFriend.userId);
      }

      if (response.status === "success" && response.data) {
        setExpenseDetails(response.data);
      } else {
        setExpenseDetails([]);
      }
    } catch (err) {
      console.error("Error loading expense details:", err);
      setExpenseDetails([]);
      setError(`Failed to load expense details: ${err.message}`);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Convert expense details to transaction format for the component
  const formatTransactionsFromExpenses = (expenses) => {
    return expenses.map(expense => {
      const formattedDate = formatExpenseDate(expense.createdAt);
      
      return {
        id: expense.expenseId,
        dateMonth: formattedDate.month,
        dateDay: formattedDate.day,
        image: 'https://placehold.co/74x67',
        title: expense.expenseName,
        description: activeTab === "toPay" 
          ? `You owe ${expense.currency || 'LKR'} ${expense.userOwingAmount?.toFixed(2)}`
          : `${expense.memberName} owes ${expense.currency || 'LKR'} ${expense.memberOwingAmount?.toFixed(2)}`,
        amount: `${(expense.userOwingAmount || expense.memberOwingAmount)?.toFixed(2)} ${expense.currency || 'LKR'}`
      };
    });
  };

  const history = selectedFriend ? formatTransactionsFromExpenses(expenseDetails) : [];

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelected(null);
    setExpenseDetails([]);
    setError(null);
    setSearchTerm("");
  };

  // Filter friends based on search term
  const filteredFriends = friendsData.filter(friend => 
    friend.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRetry = () => {
    if (selectedFriend) {
      loadExpenseDetails();
    } else {
      loadFriendsData();
    }
  };

  // Handle payment success - refresh both friends list, expense details, and balance
  const handlePaymentSuccess = () => {
    console.log('Payment successful, refreshing data...');
    
    // Refresh the friends list (left panel) to show updated amounts
    loadFriendsData();
    
    // Also refresh expense details if a friend is selected
    if (selectedFriend) {
      loadExpenseDetails();
    }

    // Trigger balance card refresh by incrementing the trigger
    setBalanceRefreshTrigger(prev => prev + 1);
  };

  return (
    <>
      <HeaderProfile />

      <div className="h-[80vh] flex bg-white rounded-md md:mx-5 -mt-8 md:mt-4 overflow-hidden">
        {/* Left */}
        <div className="xl:w-[70%] lg:w-[60%] w-full p-4 flex flex-col">
          <h2 className="text-2xl font-bold mb-4">Settle Ups</h2>

          {/* balance on mobile above list */}
          <div className="block lg:hidden mb-4">
            <YourBalanceCard refreshTrigger={balanceRefreshTrigger} />
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-300">
            <button
              className={`flex-1 py-2 text-center ${
                activeTab === "toPay"
                  ? "border-b-2 border-[#040b2b] text-[#040b2b]"
                  : "text-gray-500"
              }`}
              onClick={() => handleTabChange("toPay")}
            >
              To pay
            </button>
            <button
              className={`flex-1 py-2 text-center ${
                activeTab === "toBePaid"
                  ? "border-b-2 border-[#040b2b] text-[#040b2b]"
                  : "text-gray-500"
              }`}
              onClick={() => handleTabChange("toBePaid")}
            >
              To be paid
            </button>
          </div>

          {/* Search */}
          <div className="mt-4">
            <div className="bg-[#f1f2f9] rounded-lg flex items-center px-4 h-10 border border-gray-300">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                className="ml-2 w-full bg-transparent outline-none placeholder-gray-500 text-sm"
                placeholder="Search Friends"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg flex justify-between items-center">
              <span className="text-sm">{error}</span>
              <button 
                onClick={handleRetry}
                className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          )}

          {/* Friend list */}
          <div ref={listRef} className="mt-4 flex-1 overflow-y-auto scrollable-div">
            {loading ? (
              <div className="text-center text-gray-500 mt-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#040b2b] mx-auto mb-2"></div>
                Loading friends...
              </div>
            ) : filteredFriends.length > 0 ? (
              filteredFriends.map(friend => (
                <SettleUpFriendCard
                  key={friend.userId}
                  img={null} // Will use generated avatar
                  name={friend.userName}
                  email={friend.email}
                  amount={friend.totalOwingAmount.toFixed(2)}
                  type={activeTab}
                  onClick={() => setSelected(friend)}
                />
              ))
            ) : !loading && searchTerm ? (
              <div className="text-center text-gray-500 mt-10">
                No friends found matching "{searchTerm}"
              </div>
            ) : !loading ? (
              <div className="text-center text-gray-500 mt-10">
                {activeTab === "toPay" 
                  ? "No outstanding payments" 
                  : "No pending receivables"}
              </div>
            ) : null}
          </div>
        </div>

        {/* Desktop Right */}
        <div className="xl:w-[30%] lg:w-[40%] hidden lg:flex flex-col p-4 bg-[#f1f2f9] rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">Your Balance</h2>
          <YourBalanceCard refreshTrigger={balanceRefreshTrigger} />
          <div className="mt-6 flex-1 overflow-y-auto scrollable-div">
            {selectedFriend ? (
              <div>
                <h3 className="text-lg font-medium mb-4">
                  {selectedFriend.userName}'s Expenses
                </h3>
                {detailsLoading ? (
                  <div className="text-center text-gray-500 mt-10">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#040b2b] mx-auto mb-2"></div>
                    Loading expenses...
                  </div>
                ) : error && expenseDetails.length === 0 ? (
                  <div className="text-center text-gray-500 mt-10">
                    <p className="mb-2">Failed to load expenses</p>
                    <button 
                      onClick={loadExpenseDetails}
                      className="text-sm bg-[#040b2b] text-white px-3 py-1 rounded hover:bg-[#040b2b]/80"
                    >
                      Retry
                    </button>
                  </div>
                ) : history.length > 0 ? (
                  <TransactionHistoryComponent 
                    transactions={history} 
                    activeTab={activeTab}
                    onPaymentSuccess={handlePaymentSuccess}
                  />
                ) : (
                  <div className="text-gray-500 text-center mt-10">
                    No expenses found
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500 text-center mt-10">
                Select a friend to view expenses
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Pop‑Up of right section */}
      {selectedFriend && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-[#f1f2f9] w-11/12 max-w-sm rounded-2xl overflow-hidden flex flex-col max-h-[80vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Scrollable history */}
            <div className="p-4 flex-1 overflow-y-auto">
              <h3 className="text-lg font-medium mb-4">
                {selectedFriend.userName}'s Expenses
              </h3>
              {detailsLoading ? (
                <div className="text-center text-gray-500 mt-10">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#040b2b] mx-auto mb-2"></div>
                  Loading expenses...
                </div>
              ) : history.length > 0 ? (
                <TransactionHistoryComponent 
                  transactions={history} 
                  activeTab={activeTab}
                  onPaymentSuccess={handlePaymentSuccess}
                />
              ) : (
                <div className="text-gray-500 text-center mt-10">
                  No expenses found
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}