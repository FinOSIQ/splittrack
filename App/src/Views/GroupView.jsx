import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchGroupDetails } from '../utils/requests/Group';
import NavBar from '../Components/NavBar';
import HeaderProfile from '../Components/HeaderProfile';
import GroupCardImage from '../assets/GroupCardImage.png';

const GroupView = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [groupData, setGroupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const getGroupDetails = async () => {
      if (!groupId) {
        console.log('No group ID provided');
        setError('No group ID provided');
        setLoading(false);
        return;
      }
      
      try {
        console.log(`Fetching details for group ID: ${groupId}`);
        setLoading(true);
        const data = await fetchGroupDetails(groupId);
        console.log('Group data fetched:', data);
        setGroupData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching group details:', err);
        setError(err.message || 'Failed to fetch group details');
        setLoading(false);
      }
    };

    getGroupDetails();
  }, [groupId]);

  const goBack = () => {
    navigate('/home');
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '0.00 LKR';
    return `${parseFloat(amount).toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })} LKR`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f1f2f9]">
        <NavBar />
        <div className="p-4">
          <div className="flex items-center mb-4">
            <button 
              onClick={goBack}
              className="mr-2 text-[#040b2b] p-2 rounded-full hover:bg-gray-200"
            >
              &#8592;
            </button>
            <h1 className="text-xl font-bold text-[#040b2b]">Group Details</h1>
          </div>
          <div className="flex justify-center items-center h-64">
            <p className="text-lg text-[#040b2b]">Loading group details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f1f2f9]">
        <NavBar />
        <div className="p-4">
          <div className="flex items-center mb-4">
            <button 
              onClick={goBack}
              className="mr-2 text-[#040b2b] p-2 rounded-full hover:bg-gray-200"
            >
              &#8592;
            </button>
            <h1 className="text-xl font-bold text-[#040b2b]">Group Details</h1>
          </div>
          <div className="flex justify-center items-center h-64">
            <p className="text-lg text-red-500">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f2f9]">
      <NavBar />
      
      <div className="p-4">
        <div className="flex items-center mb-4">
          <button 
            onClick={goBack}
            className="mr-2 text-[#040b2b] p-2 rounded-full hover:bg-gray-200"
          >
            &#8592;
          </button>
          <h1 className="text-xl font-bold text-[#040b2b]">Group Details</h1>
        </div>
        
        {groupData && (
          <div className="bg-white rounded-xl shadow-md p-4 mb-4">
            <div className="flex items-center mb-4">
              <img className="w-16 h-16 rounded-full mr-4" src={GroupCardImage} alt="Group Avatar" />
              <div>
                <h2 className="text-2xl text-[#040b2b] font-bold">{groupData.name}</h2>
                <p className="text-sm text-[#5c5470]">{groupData.groupMembers?.length || 0} members</p>
              </div>
            </div>
            
            {/* Group Members Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[#040b2b] mb-2">Members</h3>
              <div className="bg-[#f8f9fa] rounded-lg p-3">
                {groupData.groupMembers && groupData.groupMembers.map((member, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-300 rounded-full mr-3 flex items-center justify-center">
                        {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                      </div>
                      <span className="text-[#040b2b]">
                        {member.first_name} {member.last_name}
                      </span>
                    </div>
                    <span className="text-xs text-[#5c5470] italic capitalize">
                      {member.member_role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Expenses Section */}
            <div>
              <h3 className="text-lg font-semibold text-[#040b2b] mb-2">Expenses</h3>
              {groupData.expenses && groupData.expenses.length > 0 ? (
                <div className="space-y-4">
                  {groupData.expenses.map((expense, index) => (
                    <div key={index} className="bg-[#f8f9fa] rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-[#040b2b]">{expense.name}</h4>
                        <span className="font-bold text-[#040b2b]">
                          {formatCurrency(expense.expense_total_amount)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-[#5c5470] mb-3">
                        You owe: {formatCurrency(expense.expense_owe_amount)}
                      </p>
                      
                      <div className="mt-2">
                        <h5 className="text-xs font-medium text-[#040b2b] mb-1">Participants</h5>
                        <div className="space-y-1">
                          {expense.participant && expense.participant.map((part, idx) => (
                            <div key={idx} className="flex justify-between text-xs text-[#5c5470]">
                              <span className="capitalize">{part.participant_role}:</span>
                              <span>{formatCurrency(part.owning_amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#f8f9fa] rounded-lg p-4 text-center text-[#5c5470]">
                  No expenses found for this group
                </div>
              )}
            </div>
            
            {/* Add buttons for actions */}
            <div className="mt-6 flex justify-center space-x-4">
              <button className="bg-[#e94560] text-white px-4 py-2 rounded-lg">
                Add Expense
              </button>
              <button className="bg-[#0f3460] text-white px-4 py-2 rounded-lg">
                Settle Up
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupView;