import React, { useState,useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../Components/NavBar.jsx';
import HeaderProfile from '../Components/HeaderProfile.jsx';
import OwedCard from '../Components/OwedCard.jsx';
import PaidCard from '../Components/PaidCard.jsx';
import CommentSection from '../Components/CommentSection.jsx';
import { getGroupDetails } from '../utils/requests/Group'; 
import { generateGroupReport } from '../utils/pdfGenerator.js';
import { parseBalDateTime, getMonthDay } from '../utils/dateUtils.js';
import useUserData from '../hooks/useUserData';
import GroupImage from '../images/group.png'; 
import ProfileImage from '../images/profile.png'; 
import ExpenseImage from '../images/plate.png'; // Adjust the path as necessary

const GroupView = () => {
    const [activeTab, setActiveTab] = useState('expenses');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [groupDetails, setGroupDetails] = useState(null);
    const [loading, setLoading] = useState(true);
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


    useEffect(() => {
        const loadGroupDetails = async () => {
            setLoading(true);
            try {
                const data = await getGroupDetails(groupId);
                setGroupDetails(data);
                setLoading(false);
                console.log('Group Details:', data);
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
                                    <img
                                        src={GroupImage}
                                        alt="Group"
                                        className="w-[64px] h-[58px]"
                                    />
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
                                    <span className="text-[#040B2B] text-base font-semibold font-['Inter']">
                                        You Are Owed
                                        <br />
                                    </span>
                                    <span className="text-[#83DB62] text-lg font-bold font-['Inter']">
                                        21,468.00 LKR
                                    </span>
                                </div>
                            </div>

                            {/* Responsive Buttons */}
                            <div className="mt-6">
                                <div className="flex justify-center flex-wrap gap-8 w-full">
                                    <button
                                        onClick={() => setActiveTab('expenses')}
                                        className={`w-[200px] sm:w-[240px] md:w-[280px] py-2 rounded-2xl text-sm transition ${activeTab === 'expenses' ? 'bg-[#040B2B] text-white' : 'bg-gray-200 text-[#040B2B]'
                                            }`}
                                    >
                                        Expenses
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('balance')}
                                        className={`w-[200px] sm:w-[240px] md:w-[280px] py-2 rounded-2xl text-sm transition ${activeTab === 'balance' ? 'bg-[#040B2B] text-white' : 'bg-gray-200 text-[#040B2B]'
                                            }`}
                                    >
                                        Balance
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('report')}
                                        className={`w-[200px] sm:w-[240px] md:w-[280px] py-2 rounded-2xl text-sm transition ${activeTab === 'report' ? 'bg-[#040B2B] text-white' : 'bg-gray-200 text-[#040B2B]'
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
                                {members.map((member, index) => (
                                    <div key={index} className="flex items-center space-x-3 p-2 border-b">
                                        <img src={ProfileImage} alt={member.name} className="w-10 h-10 rounded-full" />
                                        <span className="text-[#040b2b] text-lg">{member.name}</span>
                                    </div>
                                ))}
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
                                    
                                    
                                    {/* Group expenses by month */}
                                    {(() => {
                                        const groupedExpenses = groupExpensesByMonth(groupDetails.group.expenses);
                                        return Object.entries(groupedExpenses).map(([monthYear, expenses]) => (
                                            <div key={monthYear} className="mt-6">
                                                {/* Month Header */}
                                                <div className="text-[#61677d] text-sm font-semibold font-['Poppins'] mb-4 border-b border-gray-200 pb-2">
                                                    {monthYear}
                                                </div>
                                                
                                                {/* Expenses for this month */}
                                                <div className="space-y-4">
                                                    {expenses.map((expense, index) => {
                                                        // Determine expense details based on participant_role
                                                        let description = '';
                                                        let amount = '';
                                                        let isOwed = false;
                                                        
                                                        // Check if current user has "self" participant role (meaning they are the creator/payer)
                                                        const isCurrentUserCreator = expense.participant_role === "self";
                                                        const currentUserName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'User';
                                                        
                                                        if (isCurrentUserCreator) {
                                                            // Current user created/paid the expense (participant_role: "self")
                                                            if (expense.expense_owe_amount && expense.expense_owe_amount > 0) {
                                                                description = `${currentUserName} paid - Others owe ${currentUserName}`;
                                                                amount = `${expense.expense_owe_amount?.toFixed(2) || '0.00'}`;
                                                                isOwed = true;
                                                            } else {
                                                                description = `${currentUserName} paid`;
                                                                amount = `${expense.expense_total_amount?.toFixed(2) || '0.00'}`;
                                                                isOwed = true;
                                                            }
                                                        } else {
                                                            // Someone else created/paid the expense
                                                            const creatorName = getCreatorName(expense.created_by) || 'Someone';
                                                            
                                                            if (expense.expense_owe_amount && Math.abs(expense.expense_owe_amount) > 0) {
                                                                description = `${creatorName} paid - ${currentUserName} owes`;
                                                                amount = `${Math.abs(expense.expense_owe_amount)?.toFixed(2) || '0.00'}`;
                                                                isOwed = false;
                                                            } else {
                                                                // Calculate split amount if no specific owe amount
                                                                const splitAmount = expense.expense_total_amount / (members.length || 1);
                                                                description = `${creatorName} paid - ${currentUserName} owes`;
                                                                amount = `${splitAmount?.toFixed(2) || '0.00'}`;
                                                                isOwed = false;
                                                            }
                                                        }
                                                        
                                                        return (
                                                            <div 
                                                                key={expense.expense_Id || index}
                                                                onClick={() => handleExpenseClick(expense.expense_Id)}
                                                                className="cursor-pointer hover:bg-gray-50 transition-colors duration-200 rounded-lg"
                                                            >
                                                                <OwedCard
                                                                    dateMonth={expense.dateMonth || 'Dec'}
                                                                    dateDay={String(expense.dateDay || new Date().getDate())}
                                                                    title={expense.name || 'Group Expense'}
                                                                    description={description}
                                                                    amount={`${amount}`}
                                                                    totalAmount={expense.expense_total_amount?.toFixed(2) || '0.00'}
                                                                    isOwed={isOwed}
                                                                    groupName={groupDetails.group?.name}
                                                                />
                                                            </div>
                                                        );
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
                            <div className="text-center py-8">
                                <div className="text-[#61677d] text-base font-normal font-['Poppins']">
                                    Balance tab content coming soon...
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
                                            • Your Total Owed: LKR 21,468.00
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