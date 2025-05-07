import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GroupCard from '../Components/GroupCard';
import HeaderProfile from '../Components/HeaderProfile';
import NavBar from '../Components/NavBar';
import YourBalanceCard from '../Components/YourBalanceCard';
import FriendReqComponent from '../Components/FriendReqComponent';

export default function Home() {
  // State for user data, group data, loading, and error
  const [userData, setUserData] = useState({ userName: 'Guest', balance: null });
  const [groups, setGroups] = useState([]);
  const [userLoading, setUserLoading] = useState(true);
  const [groupLoading, setGroupLoading] = useState(true);
  const [userError, setUserError] = useState(null);
  const [groupError, setGroupError] = useState(null);

  // Fetch user expense summary
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          'http://localhost:9090/api_expense/v1/userExpenseSummary?userId=1acfb191-941c-4ca7-b906-13b04b6079d4'
        );
        setUserData({
          userName: response.data.summary.userName,
          balance: response.data.summary.netAmount,
        });
        setUserLoading(false);
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
          'http://localhost:9090/api_expense/v1/groupExpenses?userId=1acfb191-941c-4ca7-b906-13b04b6079d4'
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
      <NavBar />
      <div className="ml-8 mt-2"> {/* Reduced top margin from -mt-8 to mt-2 */}
        <HeaderProfile
          userName={userData.userName}
          loading={userLoading}
          error={userError}
        />
        <div className="h-[80vh] flex flex-row bg-white rounded-md md:mx-5 mt-0 px-0 md:mt-2 overflow-x-hidden overflow-y-auto">
          {/* LEFT SIDE: Group Cards */}
          <div className="xl:w-[70%] lg:w-[60%] w-full md:px-3 px-1 flex flex-col xl:h-[78vh] lg:h-[76vh] h-[80vh]">
            <div className="flex-grow rounded-2xl p-4 overflow-hidden">
              <div className="text-[#040b2b] text-2xl font-bold font-inter mx-0 mt-1">
                Groups
              </div>
              {/* A responsive grid for group cards */}
              <div className="grid grid-cols-2 gap-4 mt-4 overflow-y-auto h-full">
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
          </div>

          {/* RIGHT SIDE: Empty Column with bg-[#f1f2f9] */}
          <div className="xl:w-[30%] lg:w-[40%] px-3 pb-10 flex flex-col xl:h-[78vh] lg:h-[76vh] h-[80vh]">
            <div className="flex-grow bg-[#f1f2f9] rounded-2xl p-0 overflow-hidden">
              <YourBalanceCard
                balance={userData.balance}
                loading={userLoading}
                error={userError}
              />
              <div className="p-2 -mt-4"> {/* Reduced padding and margin */}
                <FriendReqComponent />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}