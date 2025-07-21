import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import HeaderProfile from "../Components/HeaderProfile";
import CommentSection from "../Components/CommentSection";
import photo from "../images/Untitled design (10) 1.png";
import { getExpenseById } from '../utils/requests/expense.js';
import { formatDate, formatCurrency } from '../utils/dateUtils.js';


export default function ExpenseView() {
  const { expenseId } = useParams();
  const [expenseData, setExpenseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExpenseData = async () => {
      if (!expenseId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getExpenseById(expenseId);
        console.log('API Response:', response); // Debug log
        setExpenseData(response.data || response);
        setError(null);
      } catch (err) {
        console.error('Error fetching expense:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenseData();
  }, [expenseId]);

  return (
    <div>
      {/* Header Profile - Should not be inside the flex container */}
      <HeaderProfile />

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="text-[#040b2b] text-lg font-normal font-['Inter']">
            Loading expense details...
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex justify-center items-center py-8">
          <div className="text-red-500 text-lg font-normal font-['Inter']">
            Error: {error}
          </div>
        </div>
      )}

      {/* Expense Data */}
      {!loading && !error && expenseData && (
        <div className="bg-gray-50 min-h-screen">
          <div className="max-w-3xl mx-auto px-4 py-6">
            {/* Main Expense Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
              <div className="flex items-center justify-between">
                {/* Left Section - Image & Details */}
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <img className="w-12 h-12 object-cover" src={photo} alt="Expense" />
                  </div>
                  
                  <div>
                    <h1 className="text-gray-900 text-xl font-semibold font-['Poppins'] mb-1">
                      {expenseData.name || 'Expense'}
                    </h1>
                    <div className="text-gray-900 text-2xl font-bold font-['Poppins']">
                      {formatCurrency(expenseData.expense_total_amount || 0)} LKR
                    </div>
                  </div>
                </div>

                {/* Right Section - Date */}
                <div className="text-right">
                  <div className="text-gray-500 text-sm font-['Poppins']">
                    {formatDate(expenseData.created_at)}
                  </div>
                </div>
              </div>
            </div>

            {/* Participant Details Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
              <h2 className="text-gray-900 text-lg font-semibold font-['Poppins'] mb-4">
                Who's involved
              </h2>
              
              <div className="space-y-3">
                {expenseData.expenseParticipants && expenseData.expenseParticipants.length > 0 ? (
                  expenseData.expenseParticipants.map((participant, index) => {
                    const isCreator = participant.participant_role === 'Creator' || participant.participant_role === 'creator';
                    const participantName = participant.user 
                      ? `${participant.user.first_name || ''} ${participant.user.last_name || ''}`.trim()
                      : 'Unknown Participant';
                    
                    return (
                      <div key={participant.expense_participant_Id || index} 
                           className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 text-sm font-semibold">
                              {(isCreator ? 'You' : participantName).charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-900 font-medium font-['Poppins']">
                              {isCreator ? 'You' : participantName}
                            </span>
                            <div className="text-gray-500 text-xs font-['Poppins']">
                              {isCreator ? 'Paid for everyone' : 'Participant'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-semibold font-['Poppins'] ${
                            isCreator ? 'text-green-600' : 'text-red-500'
                          }`}>
                            {isCreator 
                              ? `+${formatCurrency(expenseData.expense_total_amount)}`
                              : `-${formatCurrency(participant.owning_amount || 0)}`
                            } LKR
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-500 font-['Poppins']">
                      No participant information available
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Comments Section */}
            
          </div>
        </div>
      )}

      {/* Default view when no expenseId is provided */}
      {!expenseId && !loading && (
        <div className="bg-gray-50 min-h-screen">
          <div className="max-w-3xl mx-auto px-4 py-6">
            {/* Default Expense Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <img className="w-12 h-12 object-cover" src={photo} alt="Expense" />
                  </div>
                  
                  <div>
                    <h1 className="text-gray-900 text-xl font-semibold font-['Poppins'] mb-1">
                      Dinner
                    </h1>
                    <div className="text-gray-900 text-2xl font-bold font-['Poppins']">
                      5,000.00 LKR
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-gray-500 text-sm font-['Poppins']">
                    18 December 2024
                  </div>
                </div>
              </div>
            </div>

            {/* Default Participant Details Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
              <h2 className="text-gray-900 text-lg font-semibold font-['Poppins'] mb-4">
                Who's involved
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 text-sm font-semibold">S</span>
                    </div>
                    <div>
                      <span className="text-gray-900 font-medium font-['Poppins']">Shehan Rajapaksha</span>
                      <div className="text-gray-500 text-xs font-['Poppins']">Participant</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold font-['Poppins'] text-red-500">
                      -2,000.00 LKR
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 text-sm font-semibold">S</span>
                    </div>
                    <div>
                      <span className="text-gray-900 font-medium font-['Poppins']">Sonal Attanayake</span>
                      <div className="text-gray-500 text-xs font-['Poppins']">Participant</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold font-['Poppins'] text-red-500">
                      -2,000.00 LKR
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 text-sm font-semibold">S</span>
                    </div>
                    <div>
                      <span className="text-gray-900 font-medium font-['Poppins']">Saradi Dassanayake</span>
                      <div className="text-gray-500 text-xs font-['Poppins']">Participant</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold font-['Poppins'] text-red-500">
                      -1,000.00 LKR
                    </div>
                  </div>
                </div>
              </div>
            </div>

            
          </div>
        </div>
      )}
    </div>
  );
}
