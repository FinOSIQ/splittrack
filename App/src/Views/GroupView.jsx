import React, { useState,useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../Components/NavBar.jsx';
import HeaderProfile from '../Components/HeaderProfile.jsx';
import OwedCard from '../Components/OwedCard.jsx';
import PaidCard from '../Components/PaidCard.jsx';
import CommentSection from '../Components/CommentSection.jsx';
import { getGroupDetails, getGroupMemberBalanceSummary } from '../utils/requests/Group'; 
import { generateGroupReport } from '../utils/pdfGenerator.js';
import { parseBalDateTime, getMonthDay } from '../utils/dateUtils.js';
import useUserData from '../hooks/useUserData';
import GroupImage from '../images/group.png'; 
import ProfileImage from '../images/profile.png'; 
import ExpenseImage from '../images/plate.png'; // Adjust the path as necessary

// Generate avatar with consistent colors
const generateAvatar = (name) => {
  if (!name) return { letter: 'G', backgroundColor: '#6B7280' };
  
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

const GroupView = () => {
    const [activeTab, setActiveTab] = useState('expenses');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [groupDetails, setGroupDetails] = useState(null);
    const [balanceData, setBalanceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [balanceLoading, setBalanceLoading] = useState(false);
    const [error, setError] = useState(null);
    const [generatingReport, setGeneratingReport] = useState(false);

    const { groupId } = useParams();
    const navigate = useNavigate();
    const { user } = useUserData(); // Get current user data

    // Function to group expenses by month and sort by date
    const groupExpensesByMonth = (expenses) => {
        if (!expenses || expenses.length === 0) return {};

        // Sort expenses by date (most recent first)
        const sortedExpenses = expenses.sort((a, b) => {
            const dateA = a.created_at ? parseBalDateTime(a.created_at) : new Date();
            const dateB = b.created_at ? parseBalDateTime(b.created_at) : new Date();
            return dateB - dateA;
        });

        // Group by month-year
        const groupedExpenses = {};
        sortedExpenses.forEach(expense => {
            const date = expense.created_at ? parseBalDateTime(expense.created_at) : new Date();
            const monthYear = date.toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
            });
            
            if (!groupedExpenses[monthYear]) {
                groupedExpenses[monthYear] = [];
            }
            
            const monthDay = getMonthDay(expense.created_at);
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
        const currentUserId = getCurrentUserId();

        // Process expenses
        expenses.forEach(expense => {
            const monthDay = getMonthDay(expense.created_at);
            allItems.push({
                type: 'expense',
                id: expense.expense_Id,
                date: parseBalDateTime(expense.created_at),
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
                        expenseName: expense.name, // Link to parent expense
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

    // Function to navigate to expense details
    const handleExpenseClick = (expenseId) => {
        navigate(`/expense/${expenseId}`);
    };

    // Helper function to get current user ID
    const getCurrentUserId = () => {
        return user?.user_Id || null;
    };

    // Helper function to get creator name from group members
    const getCreatorName = (creatorId) => {
        if (!creatorId || !groupDetails?.group?.groupMembers) return 'Someone';
        
        // Find the creator in the group members
        const creator = groupDetails.group.groupMembers.find(member => 
            member.user_Id === creatorId || member.userId === creatorId
        );
        
        if (creator) {
            return `${creator.first_name || ''} ${creator.last_name || ''}`.trim() || 'Someone';
        }
        
        return 'Someone';
    };

    // Helper function to get user name by ID
    const getUserNameById = (userId) => {
        if (!userId || !groupDetails?.group?.groupMembers) return 'Someone';
        
        const user = groupDetails.group.groupMembers.find(member => 
            member.userUser_Id === userId || member.user_Id === userId
        );
        
        if (user) {
            return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Someone';
        }
        
        return 'Someone';
    };

    // Helper function to generate transaction description
    const getTransactionDescription = (transaction, currentUserId) => {
        const payerName = getUserNameById(transaction.payee_IdUser_Id);
        const currentUserName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'You';
        
        if (transaction.payee_IdUser_Id === currentUserId) {
            return `${currentUserName} paid LKR ${transaction.payed_amount?.toFixed(2) || '0.00'}`;
        } else {
            return `${payerName} paid LKR ${transaction.payed_amount?.toFixed(2) || '0.00'}`;
        }
    };

    // Map group members from API data
    const members = groupDetails?.group?.groupMembers?.map(member => ({
        name: `${member.first_name} ${member.last_name}`,
        img: "../images/profile.png"
    })) || [];

    const visibleMembers = members.slice(0, 2);
    const remainingCount = members.length - 2;

    const handleGenerateReport = async () => {
        if (!groupDetails) {
            alert('No group data available to generate report');
            return;
        }

        try {
            setGeneratingReport(true);
            const result = await generateGroupReport(groupDetails);
            
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

    // Function to calculate total balance amount
    const calculateTotalBalance = () => {
        if (!balanceData?.members) return 0;
        
        return balanceData.members.reduce((total, member) => {
            const amount = parseFloat(member.amount) || 0;
            return total + amount;
        }, 0);
    };

    // Function to load balance data
    const loadBalanceData = async () => {
        if (!groupId) return;
        
        setBalanceLoading(true);
        try {
            const data = await getGroupMemberBalanceSummary(groupId);
            setBalanceData(data);
            console.log('Balance Data:', data);
        } catch (err) {
            console.error('Error fetching balance data:', err);
            setError(err.message);
        } finally {
            setBalanceLoading(false);
        }
    };

    // Load balance data when switching to balance tab
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'balance' && !balanceData) {
            loadBalanceData();
        }
    };


    useEffect(() => {
        const loadGroupDetails = async () => {
            setLoading(true);
            try {
                const data = await getGroupDetails(groupId);
                setGroupDetails(data);
                setLoading(false);
                console.log('Group Details:', data);
                
                // Also load balance data for the header display
                await loadBalanceData();
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        
        loadGroupDetails();
    }, [groupId]);



    return (
        <div className="flex min-h-screen bg-white">
            {/* Sidebar Navbar */}
            <Navbar />

            <main className="flex-1 ml-14">
                <div className="w-full">
                    <HeaderProfile />
                </div>

                <div className="px-8 sm:px-6 md:px-10 py-2 mt-4">
                    <div className="w-full rounded-xl bg-[#f1f2f9] p-4">

                        <div className="bg-[#f1f2f9] p-2 flex flex-col space-y-4">
                            <div className="flex items-center justify-between flex-wrap">
                                <div className="flex items-center space-x-4">
                                    {(() => {
                                        const groupAvatar = generateAvatar(groupDetails?.group?.name || 'Group');
                                        return (
                                            <div 
                                                className="w-[64px] h-[58px] rounded-lg flex items-center justify-center text-white text-2xl font-bold"
                                                style={{ backgroundColor: groupAvatar.backgroundColor }}
                                            >
                                                {groupAvatar.letter}
                                            </div>
                                        );
                                    })()}
                                    <div>

                                        <div className=" text-[#040b2b] text-lg font-normal font-['Inter']">
                                            {groupDetails?.group?.name}

                                        </div>
                                        <div className="text-[#5c5470] text-xs font-normal font-['Inter']">
                                            {/* {groupCreatedDate} */}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between mt-2 space-y-4 sm:space-y-0">
                                {/* Member Names */}
                               <div>
                                    {visibleMembers.map((member, index) => (
                                        <span key={index} className="text-[#5c5470] text-xs font-normal font-['Poppins']">
                                            {member.name}
                                            <br />
                                        </span>
                                    ))}
                                    {remainingCount > 0 && (
                                        <span
                                            className="text-[#5c5470] text-xs font-light font-['Poppins'] cursor-pointer underline"
                                            onClick={() => setIsModalOpen(true)}
                                        >
                                            +{remainingCount} more
                                        </span>
                                    )}
                                </div>

                                {/* Amount Owed */}
                                <div className="text-right">
                                    {(() => {
                                        const totalBalance = calculateTotalBalance();
                                        const isPositive = totalBalance >= 0;
                                        const absoluteAmount = Math.abs(totalBalance);
                                        
                                        return (
                                            <>
                                                <span className="text-[#040B2B] text-base font-semibold font-['Inter']">
                                                    {isPositive ? 'You Are Owed' : 'You Owe'}
                                                    <br />
                                                </span>
                                                <span className={`text-lg font-bold font-['Inter'] ${isPositive ? 'text-[#83DB62]' : 'text-[#EF4444]'}`}>
                                                    {absoluteAmount.toFixed(2)} LKR
                                                </span>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>

                            {/* Responsive Buttons */}
                            <div className="mt-6">
                                <div className="flex justify-center flex-wrap gap-4 w-full">
                                    <button
                                        onClick={() => handleTabChange('expenses')}
                                        className={`w-[180px] sm:w-[200px] md:w-[220px] py-2 rounded-2xl text-sm transition ${activeTab === 'expenses' ? 'bg-[#040B2B] text-white' : 'bg-gray-200 text-[#040B2B]'
                                            }`}
                                    >
                                        Expenses
                                    </button>
                                    <button
                                        onClick={() => handleTabChange('balance')}
                                        className={`w-[180px] sm:w-[200px] md:w-[220px] py-2 rounded-2xl text-sm transition ${activeTab === 'balance' ? 'bg-[#040B2B] text-white' : 'bg-gray-200 text-[#040B2B]'
                                            }`}
                                    >
                                        Balance
                                    </button>
                                    <button
                                        onClick={() => handleTabChange('manage')}
                                        className={`w-[180px] sm:w-[200px] md:w-[220px] py-2 rounded-2xl text-sm transition ${activeTab === 'manage' ? 'bg-[#040B2B] text-white' : 'bg-gray-200 text-[#040B2B]'
                                            }`}
                                    >
                                        Manage
                                    </button>
                                    <button
                                        onClick={() => handleTabChange('report')}
                                        className={`w-[180px] sm:w-[200px] md:w-[220px] py-2 rounded-2xl text-sm transition ${activeTab === 'report' ? 'bg-[#040B2B] text-white' : 'bg-gray-200 text-[#040B2B]'
                                            }`}
                                    >
                                        Report
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal for all group members */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white p-6 rounded-lg w-[400px] shadow-lg">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold">Group Members</h2>
                                <button
                                    className="text-gray-500 text-lg cursor-pointer"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    ✖
                                </button>
                            </div>
                            <div className="mt-4 space-y-3">
                                {members.map((member, index) => {
                                    const memberAvatar = generateAvatar(member.name);
                                    return (
                                        <div key={index} className="flex items-center space-x-3 p-2 border-b">
                                            <div 
                                                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                                                style={{ backgroundColor: memberAvatar.backgroundColor }}
                                            >
                                                {memberAvatar.letter}
                                            </div>
                                            <span className="text-[#040b2b] text-lg">{member.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab content */}
                <div className="bg-white p-4 mt-2 mx-2 sm:mx-4 md:mx-6 lg:mx-8">
                    {activeTab === 'expenses' && (
                        <div className="space-y-8 w-full">
                            {groupDetails?.group?.expenses && groupDetails.group.expenses.length > 0 ? (
                                <div>
                                    {/* Group expenses and transactions by month */}
                                    {(() => {
                                        const groupedItems = groupExpensesAndTransactionsByMonth(groupDetails.group.expenses);
                                        return Object.entries(groupedItems).map(([monthYear, items]) => (
                                            <div key={monthYear} className="mt-6">
                                                {/* Month Header */}
                                                <div className="text-[#61677d] text-sm font-semibold font-['Poppins'] mb-4 border-b border-gray-200 pb-2">
                                                    {monthYear}
                                                </div>
                                                
                                                {/* Items for this month (expenses and transactions) */}
                                                <div className="space-y-4">
                                                    {items.map((item, index) => {
                                                        const currentUserId = getCurrentUserId();
                                                        
                                                        if (item.type === 'expense') {
                                                            // Render expense using OwedCard
                                                            let description = '';
                                                            let amount = '';
                                                            let isOwed = false;
                                                            
                                                            // Check if current user has "self" participant role (meaning they are the creator/payer)
                                                            const isCurrentUserCreator = item.participant_role === "self";
                                                            const currentUserName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'User';
                                                            
                                                            if (isCurrentUserCreator) {
                                                                // Current user created/paid the expense (participant_role: "self")
                                                                if (item.expense_owe_amount && item.expense_owe_amount > 0) {
                                                                    description = `${currentUserName} paid - Others owe ${currentUserName}`;
                                                                    amount = `${item.expense_owe_amount?.toFixed(2) || '0.00'}`;
                                                                    isOwed = true;
                                                                } else {
                                                                    description = `${currentUserName} paid`;
                                                                    amount = `${item.expense_total_amount?.toFixed(2) || '0.00'}`;
                                                                    isOwed = true;
                                                                }
                                                            } else {
                                                                // Someone else created/paid the expense
                                                                const creatorName = getCreatorName(item.created_by) || 'Someone';
                                                                
                                                                if (item.expense_owe_amount && Math.abs(item.expense_owe_amount) > 0) {
                                                                    description = `${creatorName} paid - ${currentUserName} owes`;
                                                                    amount = `${Math.abs(item.expense_owe_amount)?.toFixed(2) || '0.00'}`;
                                                                    isOwed = false;
                                                                } else {
                                                                    // Calculate split amount if no specific owe amount
                                                                    const splitAmount = item.expense_total_amount / (members.length || 1);
                                                                    description = `${creatorName} paid - ${currentUserName} owes`;
                                                                    amount = `${splitAmount?.toFixed(2) || '0.00'}`;
                                                                    isOwed = false;
                                                                }
                                                            }
                                                            
                                                            return (
                                                                <div 
                                                                    key={item.expense_Id || index}
                                                                    onClick={() => handleExpenseClick(item.expense_Id)}
                                                                    className="cursor-pointer hover:bg-gray-50 transition-colors duration-200 rounded-lg"
                                                                >
                                                                    <OwedCard
                                                                        dateMonth={item.dateMonth || 'Dec'}
                                                                        dateDay={String(item.dateDay || new Date().getDate())}
                                                                        title={item.name || 'Group Expense'}
                                                                        description={description}
                                                                        amount={`${amount}`}
                                                                        totalAmount={item.expense_total_amount?.toFixed(2) || '0.00'}
                                                                        isOwed={isOwed}
                                                                        groupName={groupDetails.group?.name}
                                                                    />
                                                                </div>
                                                            );
                                                        } else if (item.type === 'transaction') {
                                                            // Render transaction using PaidCard
                                                            const transactionDescription = getTransactionDescription(item, currentUserId);
                                                            const transactionTitle = `${item.expenseName} - Settlement`;
                                                            
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
                                        No expenses found in {groupDetails?.group?.name || 'this group'}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'balance' && (
                        <div className="space-y-8 w-full">
                            <div className="max-w-4xl mx-auto">
                                <div className="text-[#040b2b] text-lg font-semibold font-['Poppins'] mb-6">
                                    Group Balance Summary
                                </div>
                                
                                {balanceLoading ? (
                                    <div className="text-center py-8">
                                        <div className="text-[#61677d] text-base font-normal font-['Poppins']">
                                            Loading balance data...
                                        </div>
                                    </div>
                                ) : balanceData && balanceData.status === 'success' ? (
                                    <div>
                                        

                                        {/* Member Balance Cards */}
                                        <div className="space-y-4">
                                            {balanceData.members && balanceData.members.length > 0 ? (
                                                balanceData.members.map((member, index) => {
                                                    const memberAvatar = generateAvatar(member.name);
                                                    const amount = parseFloat(member.amount) || 0;
                                                    const isOwedToYou = amount > 0;
                                                    const isYouOwe = amount < 0;
                                                    
                                                    let badgeClass, badgeText, description;
                                                    
                                                    if (isOwedToYou) {
                                                        badgeClass = 'bg-green-100 text-green-700';
                                                        badgeText = `+${Math.abs(amount).toFixed(2)} LKR`;
                                                        description = `${member.name} owes you`;
                                                    } else if (isYouOwe) {
                                                        badgeClass = 'bg-red-100 text-red-700';
                                                        badgeText = `-${Math.abs(amount).toFixed(2)} LKR`;
                                                        description = `You owe ${member.name}`;
                                                    } else {
                                                        badgeClass = 'bg-gray-100 text-gray-700';
                                                        badgeText = '0.00 LKR';
                                                        description = `Settled with ${member.name}`;
                                                    }

                                                    return (
                                                        <div 
                                                            key={member.userId || index} 
                                                            className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                                                            onClick={() => navigate(`/friend/${member.userId}`)}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center space-x-4">
                                                                    <div 
                                                                        className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold"
                                                                        style={{ backgroundColor: memberAvatar.backgroundColor }}
                                                                    >
                                                                        {memberAvatar.letter}
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-[#040b2b] text-base font-medium">{member.name}</div>
                                                                        <div className="text-[#61677d] text-sm">{member.email}</div>
                                                                        <div className="text-[#61677d] text-xs mt-1">{description}</div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className={`px-4 py-2 rounded-lg font-semibold text-sm ${badgeClass}`}>
                                                                        {badgeText}
                                                                    </div>
                                                                    
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="text-center py-8">
                                                    <div className="text-[#61677d] text-base font-normal font-['Poppins']">
                                                        No balance data available
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Summary Stats */}
                                        {balanceData.members && balanceData.members.length > 0 && (
                                            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                                                    <div className="text-green-600 text-xl font-bold">
                                                        {balanceData.members.filter(m => parseFloat(m.amount) > 0).length}
                                                    </div>
                                                    <div className="text-green-600 text-sm">Members Owe You</div>
                                                </div>
                                                <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                                                    <div className="text-red-600 text-xl font-bold">
                                                        {balanceData.members.filter(m => parseFloat(m.amount) < 0).length}
                                                    </div>
                                                    <div className="text-red-600 text-sm">You Owe</div>
                                                </div>
                                                <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                                    <div className="text-gray-600 text-xl font-bold">
                                                        {balanceData.members.filter(m => parseFloat(m.amount) === 0).length}
                                                    </div>
                                                    <div className="text-gray-600 text-sm">Settled</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="text-[#61677d] text-base font-normal font-['Poppins'] mb-4">
                                            {error || 'Failed to load balance data'}
                                        </div>
                                        <button 
                                            onClick={loadBalanceData}
                                            className="px-4 py-2 bg-[#040B2B] text-white rounded-lg text-sm hover:bg-[#0a1654] transition"
                                        >
                                            Retry
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'manage' && (
                        <div className="space-y-8 w-full">
                            <div className="max-w-4xl mx-auto">
                                <div className="text-[#040b2b] text-lg font-semibold font-['Poppins'] mb-6">
                                    Group Management
                                </div>
                                
                                {/* Group Information Section */}
                                <div className="bg-[#f1f2f9] rounded-xl p-6 mb-6">
                                    <div className="text-[#040b2b] text-base font-medium font-['Poppins'] mb-4">
                                        Group Information
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[#61677d] text-sm font-normal font-['Poppins']">Group Name</label>
                                            <input 
                                                type="text" 
                                                value={groupDetails?.group?.name || ''} 
                                                disabled
                                                className="w-full mt-1 p-3 border border-gray-300 rounded-lg bg-gray-100 text-[#040b2b]"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[#61677d] text-sm font-normal font-['Poppins']">Group ID</label>
                                            <input 
                                                type="text" 
                                                value={groupDetails?.group?.group_Id || ''} 
                                                disabled
                                                className="w-full mt-1 p-3 border border-gray-300 rounded-lg bg-gray-100 text-[#040b2b]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Group Members Section */}
                                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="text-[#040b2b] text-base font-medium font-['Poppins']">
                                            Group Members ({members.length})
                                        </div>
                                        <button className="px-4 py-2 bg-[#040B2B] text-white rounded-lg text-sm font-medium hover:bg-[#0a1654] transition">
                                            Add Member
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {members.map((member, index) => {
                                            const memberAvatar = generateAvatar(member.name);
                                            const memberRole = groupDetails?.group?.groupMembers?.[index]?.member_role || 'member';
                                            return (
                                                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                                    <div className="flex items-center space-x-3">
                                                        <div 
                                                            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                                                            style={{ backgroundColor: memberAvatar.backgroundColor }}
                                                        >
                                                            {memberAvatar.letter}
                                                        </div>
                                                        <div>
                                                            <div className="text-[#040b2b] text-sm font-medium">{member.name}</div>
                                                            <div className="text-[#61677d] text-xs capitalize">{memberRole}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        {memberRole !== 'admin' && (
                                                            <button className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition">
                                                                Remove
                                                            </button>
                                                        )}
                                                        <button className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition">
                                                            Edit Role
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Group Statistics Section */}
                                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                                    <div className="text-[#040b2b] text-base font-medium font-['Poppins'] mb-4">
                                        Group Statistics
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="text-center p-4 bg-[#f1f2f9] rounded-lg">
                                            <div className="text-[#040b2b] text-2xl font-bold">
                                                {groupDetails?.group?.expenses?.length || 0}
                                            </div>
                                            <div className="text-[#61677d] text-sm">Total Expenses</div>
                                        </div>
                                        <div className="text-center p-4 bg-[#f1f2f9] rounded-lg">
                                            <div className="text-[#040b2b] text-2xl font-bold">
                                                {members.length}
                                            </div>
                                            <div className="text-[#61677d] text-sm">Total Members</div>
                                        </div>
                                        <div className="text-center p-4 bg-[#f1f2f9] rounded-lg">
                                            <div className="text-[#040b2b] text-2xl font-bold">
                                                LKR {groupDetails?.group?.expenses?.reduce((total, expense) => total + (expense.expense_total_amount || 0), 0)?.toFixed(2) || '0.00'}
                                            </div>
                                            <div className="text-[#61677d] text-sm">Total Amount</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Danger Zone */}
                                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                                    <div className="text-red-600 text-base font-medium font-['Poppins'] mb-4">
                                        Danger Zone
                                    </div>
                                    <div className="text-[#61677d] text-sm font-normal font-['Poppins'] mb-4">
                                        These actions are irreversible. Please proceed with caution.
                                    </div>
                                    <div className="space-y-3">
                                        <button className="w-full md:w-auto px-6 py-3 bg-white text-red-600 border border-red-300 rounded-lg text-sm font-medium hover:bg-red-50 transition">
                                            Leave Group
                                        </button>
                                        <button className="w-full md:w-auto px-6 py-3 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition ml-0 md:ml-3">
                                            Delete Group
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'report' && (
                        <div className="space-y-8 w-full">
                            <div className="text-center py-8">
                                <div className="text-[#040b2b] text-lg font-semibold font-['Poppins'] mb-4">
                                    Group Expense Report Generation
                                </div>
                                <div className="text-[#61677d] text-base font-normal font-['Poppins'] mb-6">
                                    Generate a comprehensive PDF report of all group expenses and member details
                                </div>
                                
                                {groupDetails && (
                                    <div className="bg-[#f1f2f9] rounded-xl p-6 mb-6 max-w-md mx-auto">
                                        <div className="text-[#040b2b] text-sm font-medium mb-2">Report Summary:</div>
                                        <div className="text-[#61677d] text-sm">
                                            • Group: {groupDetails.group?.name}<br/>
                                            • Total Members: {groupDetails.group?.groupMembers?.length || 0}<br/>
                                            • Total Expenses: {groupDetails.group?.expenses?.length || 0}<br/>
                                            • Your Balance: {(() => {
                                                const totalBalance = calculateTotalBalance();
                                                const isPositive = totalBalance >= 0;
                                                const absoluteAmount = Math.abs(totalBalance);
                                                return `${isPositive ? '+' : '-'}${absoluteAmount.toFixed(2)} LKR ${isPositive ? '(Owed to you)' : '(You owe)'}`;
                                            })()}
                                        </div>
                                    </div>
                                )}
                                
                                <button
                                    onClick={handleGenerateReport}
                                    disabled={generatingReport || !groupDetails}
                                    className={`px-8 py-4 rounded-2xl text-base font-medium transition ${
                                        generatingReport || !groupDetails
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
                                            📄 Download Group PDF Report
                                        </>
                                    )}
                                </button>
                                
                                <div className="text-[#61677d] text-xs font-normal font-['Poppins'] mt-4">
                                    The report will include all group expenses, member details, and balance summary.
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default GroupView;