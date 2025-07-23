import React, { useState, useEffect } from "react";
import { useParams, useLocation } from 'react-router-dom';
import HeaderProfile from "../Components/HeaderProfile";
import CommentSection from "../Components/CommentSection";
import Navbar from "../Components/NavBar";
import photo from "../images/Untitled design (10) 1.png";
import { getExpenseById, getNonGroupExpenseById } from '../utils/requests/expense.js';
import { formatDate, formatCurrency } from '../utils/dateUtils.js';

// Generate emoji based on expense name/category
const generateExpenseEmoji = (expenseName) => {
  if (!expenseName) return '💰';
  
  const name = expenseName.toLowerCase();
  
  // Food related
  if (name.includes('food') || name.includes('dinner') || name.includes('lunch') || name.includes('breakfast') || name.includes('restaurant') || name.includes('pizza') || name.includes('burger') || name.includes('coffee')) {
    return '🍽️';
  }
  // Travel related
  if (name.includes('travel') || name.includes('trip') || name.includes('vacation') || name.includes('hotel') || name.includes('flight')) {
    return '✈️';
  }
  // Transport related
  if (name.includes('uber') || name.includes('taxi') || name.includes('bus') || name.includes('train') || name.includes('gas') || name.includes('fuel')) {
    return '🚗';
  }
  // Entertainment
  if (name.includes('movie') || name.includes('cinema') || name.includes('game') || name.includes('party') || name.includes('concert')) {
    return '🎬';
  }
  // Shopping
  if (name.includes('shopping') || name.includes('clothes') || name.includes('shop') || name.includes('buy')) {
    return '🛒';
  }
  // Health
  if (name.includes('medical') || name.includes('doctor') || name.includes('hospital') || name.includes('medicine') || name.includes('pharmacy')) {
    return '🏥';
  }
  // Utilities
  if (name.includes('electric') || name.includes('water') || name.includes('internet') || name.includes('phone') || name.includes('utility')) {
    return '🔌';
  }
  // Groceries
  if (name.includes('grocery') || name.includes('market') || name.includes('supermarket')) {
    return '🛍️';
  }
  
  return '💰'; // Default icon
};

// Generate avatar with consistent colors
const generateAvatar = (name) => {
  if (!name) return { letter: 'U', backgroundColor: '#6B7280' };
  
  const colors = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
    '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9'
  ];
  
  const firstLetter = name.charAt(0).toUpperCase();
  const colorIndex = firstLetter.charCodeAt(0) % colors.length;
  
  return {
    letter: firstLetter,
    backgroundColor: colors[colorIndex]
  };
};


export default function ExpenseView() {
  const { expenseId } = useParams();
  const location = useLocation();
  const [expenseData, setExpenseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNonGroupExpense, setIsNonGroupExpense] = useState(false);

  useEffect(() => {
    const fetchExpenseData = async () => {
      if (!expenseId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // First try to fetch as non-group expense
        try {
          console.log('Attempting to fetch as non-group expense:', expenseId);
          const nonGroupResponse = await getNonGroupExpenseById(expenseId);
          console.log('Non-group expense API Response:', nonGroupResponse);
          setExpenseData(nonGroupResponse.data || nonGroupResponse);
          setIsNonGroupExpense(true);
          setError(null);
          return;
        } catch (nonGroupError) {
          console.log('Not a non-group expense, trying regular expense endpoint');
          
          // If non-group expense fails, try regular expense endpoint
          try {
            const regularResponse = await getExpenseById(expenseId);
            console.log('Regular expense API Response:', regularResponse);
            setExpenseData(regularResponse.data || regularResponse);
            setIsNonGroupExpense(false);
            setError(null);
          } catch (regularError) {
            console.error('Both expense endpoints failed:', regularError);
            setError(regularError.message);
          }
        }
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
    <div className="flex min-h-screen bg-white">
      {/* Sidebar Navbar */}
      <Navbar />

      <main className="flex-1 ml-14">
        {/* Header Profile */}
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
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl">
                      {generateExpenseEmoji(expenseData.name || 'Expense')}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-gray-900 text-xl font-semibold font-['Poppins']">
                          {expenseData.name || 'Expense'}
                        </h1>
                        {isNonGroupExpense && (
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            Individual Expense
                          </span>
                        )}
                      </div>
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
                      
                      const displayName = isCreator ? 'You' : participantName;
                      const avatar = generateAvatar(displayName);
                      
                      return (
                        <div key={participant.expense_participant_Id || index} 
                             className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                              style={{ backgroundColor: avatar.backgroundColor }}
                            >
                              {avatar.letter}
                            </div>
                            <div>
                              <span className="text-gray-900 font-medium font-['Poppins']">
                                {displayName}
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
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl">
                      🍽️
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
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                        style={{ backgroundColor: '#EF4444' }}
                      >
                        S
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
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                        style={{ backgroundColor: '#F97316' }}
                      >
                        S
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
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                        style={{ backgroundColor: '#F59E0B' }}
                      >
                        S
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
      </main>
    </div>
  );
}
