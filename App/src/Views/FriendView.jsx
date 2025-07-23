import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../Components/NavBar.jsx';
import HeaderProfile from '../Components/HeaderProfile.jsx';
import OwedCard from '../Components/OwedCard.jsx';
import PaidCard from '../Components/PaidCard.jsx';
import { getFriendExpense } from '../utils/requests/Friend.js';
import { generateDetailedReport } from '../utils/pdfGenerator.js';
import { parseBalDateTime, getMonthDay } from '../utils/dateUtils.js';

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

const FriendView = () => {
    const [activeTab, setActiveTab] = useState('expenses'); // Changed default to expenses
    const [friendData, setFriendData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [generatingReport, setGeneratingReport] = useState(false);
    const { friendId } = useParams(); // Get friendId from URL parameters
    const navigate = useNavigate(); // For navigation to ExpenseView

    // Function to group expenses by month and sort by date
    const groupExpensesByMonth = (expenses) => {
        if (!expenses || expenses.length === 0) return {};

        // Sort expenses by date (most recent first)
        const sortedExpenses = expenses.sort((a, b) => {
            const dateA = a.createdAt ? parseBalDateTime(a.createdAt) : new Date();
            const dateB = b.createdAt ? parseBalDateTime(b.createdAt) : new Date();
            return dateB - dateA;
        });

        // Group by month-year
        const groupedExpenses = {};
        sortedExpenses.forEach(expense => {
            const date = expense.createdAt ? parseBalDateTime(expense.createdAt) : new Date();
            const monthYear = date.toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
            });
            
            if (!groupedExpenses[monthYear]) {
                groupedExpenses[monthYear] = [];
            }
            
            const monthDay = getMonthDay(expense.createdAt);
            groupedExpenses[monthYear].push({
                ...expense,
                dateDay: monthDay.day,
                dateMonth: monthDay.month
            });
        });

        return groupedExpenses;
    };

    // Function to combine and group expenses and transactions by month
    const groupExpensesAndTransactionsByMonth = (expenses) => {
        if (!expenses || expenses.length === 0) return {};

        const allItems = [];

        // Process expenses
        expenses.forEach(expense => {
            const monthDay = getMonthDay(expense.createdAt);
            allItems.push({
                type: 'expense',
                id: expense.expenseId,
                date: parseBalDateTime(expense.createdAt),
                dateDay: monthDay.day,
                dateMonth: monthDay.month,
                ...expense
            });

            // Process transactions within this expense
            if (expense.transactions && expense.transactions.length > 0) {
                expense.transactions.forEach(transaction => {
                    const transactionMonthDay = getMonthDay(transaction.created_at);
                    allItems.push({
                        type: 'transaction',
                        id: transaction.transaction_Id,
                        date: parseBalDateTime(transaction.created_at),
                        dateDay: transactionMonthDay.day,
                        dateMonth: transactionMonthDay.month,
                        expenseName: expense.expenseName, // Link to parent expense
                        ...transaction
                    });
                });
            }
        });

        // Sort all items by date (most recent first)
        const sortedItems = allItems.sort((a, b) => b.date - a.date);

        // Group by month-year
        const groupedItems = {};
        sortedItems.forEach(item => {
            const monthYear = item.date.toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
            });
            
            if (!groupedItems[monthYear]) {
                groupedItems[monthYear] = [];
            }
            
            groupedItems[monthYear].push(item);
        });

        return groupedItems;
    };

    // Helper function to generate transaction description
    const getTransactionDescription = (transaction) => {
        const payerName = transaction.payee_name || 'Someone';
        if (transaction.payee_IdUser_Id === friendData?.user_Id) {
            return `You paid LKR ${transaction.payed_amount?.toFixed(2) || '0.00'}`;
        } else {
            return `${payerName} paid LKR ${transaction.payed_amount?.toFixed(2) || '0.00'}`;
        }
    };

    // Function to navigate to settle up view
    const handleSettleUpClick = () => {
        // Get the friend's user_Id (not friend_Id) and console log it
        const friendUserId = friendData?.user_Id;
        console.log('Friend User ID (user_Id):', friendUserId);
        console.log('Friend ID (friend_Id):', friendData?.friend_Id);
        console.log('Full Friend Data:', friendData);
        
        // Navigate to SettleUpView and pass the correct user_Id
        navigate('/settleup', { 
            state: { 
                friendUserId: friendUserId,  // Pass user_Id, not friend_Id
                friendName: friendData?.friend_Name,
                friendData: friendData
            } 
        });
    };

    // Function to navigate to expense details
    const handleExpenseClick = (expenseId) => {
        navigate(`/expense/${expenseId}`);
    };

    const handleGenerateReport = async () => {
        if (!friendData) {
            alert('No friend data available to generate report');
            return;
        }

        try {
            setGeneratingReport(true);
            const result = await generateDetailedReport(friendData);
            
            if (result.success) {
                alert(`Report generated successfully! File saved as: ${result.fileName}`);
            } else {
                alert(`Error generating report: ${result.error}`);
            }
        } catch (error) {
            console.error('Error generating report:', error);
            alert('Failed to generate report. Please try again.');
        } finally {
            setGeneratingReport(false);
        }
    };

    useEffect(() => {
        const fetchFriendExpense = async () => {
            if (!friendId) {
                setError('Friend ID is required');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const data = await getFriendExpense(friendId);
                setFriendData(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching friend expense:', err);
                setError(err.message || 'Failed to fetch friend data');
            } finally {
                setLoading(false);
            }
        };

        fetchFriendExpense();
    }, [friendId]);






    return (
        <div className="flex min-h-screen bg-white">

            <Navbar />


            <main className="flex-1 ml-14">

                <div className="w-full">
                    <HeaderProfile />
                </div>


                <div className="px-8 sm:px-6 md:px-10 py-2 mt-4">
                    <div className="w-full rounded-xl bg-[#f1f2f9] p-4">


                        <div className="bg-[#f1f2f9] p-8 flex flex-col space-y-8">
                            {loading ? (
                                <div className="flex justify-center items-center py-8">
                                    <div className="text-[#040b2b] text-lg font-normal font-['Inter']">
                                        Loading friend data...
                                    </div>
                                </div>
                            ) : error ? (
                                <div className="flex justify-center items-center py-8">
                                    <div className="text-red-500 text-lg font-normal font-['Inter']">
                                        Error: {error}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start justify-between">
                                    <div className="flex flex-col">
                                        <div className="flex items-center space-x-4 mb-4">
                                            {(() => {
                                                const avatar = generateAvatar(friendData?.friend_Name || 'Unknown');
                                                return (
                                                    <div 
                                                        className="w-[64px] h-[58px] rounded-full flex items-center justify-center text-white text-xl font-bold"
                                                        style={{ backgroundColor: avatar.backgroundColor }}
                                                    >
                                                        {avatar.letter}
                                                    </div>
                                                );
                                            })()}
                                            <div>
                                                <div className="text-[#040b2b] text-lg font-normal font-['Inter']">
                                                    {friendData?.friend_Name || 'Unknown Friend'}
                                                </div>
                                                <div className=" text-[#5c5470] text-xs font-normal font-['Inter']">
                                                    Friend ID: {friendData?.friend_Id || 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Tabs moved below the name and Friend ID */}
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => setActiveTab('expenses')}
                                                className={`px-6 py-2 rounded-2xl text-sm transition ${activeTab === 'expenses' ? 'bg-[#040B2B] text-white' : 'bg-gray-200 text-[#040B2B]'
                                                    }`}
                                            >
                                                Expenses
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('report')}
                                                className={`px-6 py-2 rounded-2xl text-sm transition ${activeTab === 'report' ? 'bg-[#040B2B] text-white' : 'bg-gray-200 text-[#040B2B]'
                                                    }`}
                                            >
                                                Report
                                            </button>
                                        </div>
                                    </div>

                                    {/* Owed amount and Settle Up button in top right */}
                                    <div className="text-right">
                                        {friendData?.netAmount !== undefined && (
                                            <>
                                                <div className="mb-3">
                                                    <span className="text-[#040B2B] text-base font-semibold font-['Inter']">
                                                        {friendData.netAmount >= 0 ? 'You Are Owed' : 'You Owe'}
                                                        <br />
                                                    </span>
                                                    <span className={`text-lg font-bold font-['Inter'] ${
                                                        friendData.netAmount >= 0 ? 'text-[#83DB62]' : 'text-[#FF6B6B]'
                                                    }`}>
                                                        {Math.abs(friendData.netAmount).toFixed(2)} LKR
                                                    </span>
                                                </div>
                                                
                                                {/* Settle Up Button below the amount */}
                                                <button
                                                    onClick={handleSettleUpClick}
                                                    className="bg-[#040B2B] text-white px-6 py-2 rounded-2xl text-sm font-medium hover:bg-[#0a1654] transition-colors duration-200"
                                                >
                                                    Settle Up
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}


                        </div>

                    </div>
                </div>






                <div className="bg-white p-4 mt-4 mx-2 sm:mx-4 md:mx-6 lg:mx-8">
                    {activeTab === 'expenses' && (
                        <div className="space-y-8 w-full">
                            {friendData?.details && friendData.details.length > 0 ? (
                                <div>
                                    {/* Group expenses and transactions by month */}
                                    {(() => {
                                        const groupedItems = groupExpensesAndTransactionsByMonth(friendData.details);
                                        return Object.entries(groupedItems).map(([monthYear, items]) => (
                                            <div key={monthYear} className="mt-2">
                                                {/* Month Header */}
                                                <div className="text-[#61677d] text-sm font-semibold font-['Poppins'] mb-4 border-b border-gray-200 pb-2">
                                                    {monthYear}
                                                </div>
                                                
                                                {/* Items for this month (expenses and transactions) */}
                                                <div className="space-y-4">
                                                    {items.map((item, index) => {
                                                        if (item.type === 'expense') {
                                                            // Render expense using OwedCard
                                                            const isCurrentUserCreator = item.currentUserRole === 'creator';
                                                            const isFriendCreator = item.friendRole === 'creator';
                                                            
                                                            let description = '';
                                                            let amount = '';
                                                            let isOwed = true;
                                                            
                                                            if (isCurrentUserCreator && !isFriendCreator) {
                                                                // Current user is creator, friend owes them
                                                                description = `${friendData.friend_Name} owes you`;
                                                                amount = `${item.friendAmount?.toFixed(2) || '0.00'}`;
                                                                isOwed = true;
                                                            } else if (isFriendCreator && !isCurrentUserCreator) {
                                                                // Friend is creator, current user owes them
                                                                description = `You owe ${friendData.friend_Name}`;
                                                                amount = `${item.currentUserAmount?.toFixed(2) || '0.00'}`;
                                                                isOwed = false;
                                                            } else {
                                                                // Both are creators (split expense) or other scenario
                                                                description = `Split expense`;
                                                                amount = `${item.currentUserAmount?.toFixed(2) || '0.00'}`;
                                                                isOwed = item.currentUserAmount >= item.friendAmount;
                                                            }
                                                            
                                                            return (
                                                                <div 
                                                                    key={item.expenseId || index}
                                                                    onClick={() => handleExpenseClick(item.expenseId)}
                                                                    className="cursor-pointer hover:bg-gray-50 transition-colors duration-200 rounded-lg"
                                                                >
                                                                    <OwedCard
                                                                        dateMonth={item.dateMonth || 'Dec'}
                                                                        dateDay={String(item.dateDay || new Date().getDate())}
                                                                        title={item.expenseName || 'Expense'}
                                                                        description={description}
                                                                        amount={`${amount}`}
                                                                        totalAmount={item.expenseTotalAmount?.toFixed(2) || '0.00'}
                                                                        isOwed={isOwed}
                                                                        friendName={friendData.friend_Name}
                                                                        currentUserRole={item.currentUserRole}
                                                                        friendRole={item.friendRole}
                                                                        currentUserAmount={item.currentUserAmount?.toFixed(2) || '0.00'}
                                                                        friendAmount={item.friendAmount?.toFixed(2) || '0.00'}
                                                                        creatorName={item.creatorName || 'Unknown'}
                                                                    />
                                                                </div>
                                                            );
                                                        } else if (item.type === 'transaction') {
                                                            // Render transaction using PaidCard
                                                            const transactionDescription = getTransactionDescription(item);
                                                            const transactionTitle = `${item.expenseName} - Settlement`;
                                                            
                                                            // Find the parent expense to get creator name
                                                            const parentExpense = friendData.details.find(expense => 
                                                                expense.expenseId === item.expenseExpense_Id || 
                                                                expense.transactions?.some(txn => txn.transaction_Id === item.transaction_Id)
                                                            );
                                                            
                                                            return (
                                                                <div 
                                                                    key={item.transaction_Id || index}
                                                                    className="hover:bg-gray-50 transition-colors duration-200 rounded-lg"
                                                                >
                                                                    <PaidCard
                                                                        dateMonth={item.dateMonth || 'Dec'}
                                                                        dateDay={String(item.dateDay || new Date().getDate())}
                                                                        image="src/images/Frame.png"
                                                                        title={transactionTitle}
                                                                        description={transactionDescription}
                                                                        amount={`${item.payed_amount?.toFixed(2) || '0.00'} LKR`}
                                                                        payeeName={item.payee_name || 'Someone'}
                                                                        expenseCreatorName={parentExpense?.creatorName || 'Unknown'}
                                                                        payedAmount={item.payed_amount?.toFixed(2) || '0.00'}
                                                                    />
                                                                </div>
                                                            );
                                                        }
                                                        
                                                        return null;
                                                    })}
                                                </div>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-[#61677d] text-base font-normal font-['Poppins']">
                                        No expenses found with {friendData?.friend_Name || 'this friend'}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {activeTab === 'report' && (
                        <div className="space-y-8 w-full">
                            <div className="text-center py-8">
                                <div className="text-[#040b2b] text-lg font-semibold font-['Poppins'] mb-4">
                                    Expense Report Generation
                                </div>
                                <div className="text-[#61677d] text-base font-normal font-['Poppins'] mb-6">
                                    Generate a comprehensive PDF report of all expenses with {friendData?.friend_Name || 'this friend'}
                                </div>
                                
                                {friendData && (
                                    <div className="bg-[#f1f2f9] rounded-xl p-6 mb-6 max-w-md mx-auto">
                                        <div className="text-[#040b2b] text-sm font-medium mb-2">Report Summary:</div>
                                        <div className="text-[#61677d] text-sm">
                                            • Friend: {friendData.friend_Name}<br/>
                                            • Total Expenses: {friendData.details?.length || 0}<br/>
                                            • Net Balance: LKR {Math.abs(friendData.netAmount || 0).toFixed(2)}<br/>
                                            • Status: {(friendData.netAmount || 0) >= 0 ? 'You are owed' : 'You owe'}
                                        </div>
                                    </div>
                                )}
                                
                                <button
                                    onClick={handleGenerateReport}
                                    disabled={generatingReport || !friendData}
                                    className={`px-8 py-4 rounded-2xl text-base font-medium transition ${
                                        generatingReport || !friendData
                                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                                            : 'bg-[#040B2B] text-white hover:bg-[#0a1654] active:bg-[#030a26]'
                                    }`}
                                >
                                    {generatingReport ? (
                                        <>
                                            <span className="inline-block animate-spin mr-2">⏳</span>
                                            Generating PDF Report...
                                        </>
                                    ) : (
                                        <>
                                            📄 Download PDF Report
                                        </>
                                    )}
                                </button>
                                
                                <div className="text-[#61677d] text-xs font-normal font-['Poppins'] mt-4">
                                    The report will include all expense details, payment information, and balance summary.
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default FriendView;
