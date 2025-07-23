import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../Components/NavBar.jsx';
import HeaderProfile from '../Components/HeaderProfile.jsx';
import OwedCard from '../Components/OwedCard.jsx';
import PaidCard from '../Components/PaidCard.jsx';
import CommentSection from '../Components/CommentSection.jsx';
import AddGroupMember from '../Components/AddGroupMember.jsx';
import ConfirmationModal from '../Components/ConfirmationModal.jsx';
import { useToast } from '../Components/ToastProvider.jsx';
import { getGroupDetails, getGroupMemberBalanceSummary, updateGroup, removeMember, deleteGroup } from '../utils/requests/Group'; 
import { generateGroupReport } from '../utils/pdfGenerator.js';
import { parseBalDateTime, getMonthDay } from '../utils/dateUtils.js';
import { useUserData } from '../hooks/useUserData';
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
    const [isEditingGroupName, setIsEditingGroupName] = useState(false);
    const [editedGroupName, setEditedGroupName] = useState('');
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [removingMemberId, setRemovingMemberId] = useState(null);
    
    // Generic confirmation modal state
    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        details: '',
        confirmButtonText: 'Confirm',
        onConfirm: () => {},
        requiresTyping: false,
        requiredText: '',
        isLoading: false
    });

    const { groupId } = useParams();
    const navigate = useNavigate();
    const { user } = useUserData(); // Get current user data
    const { showSuccess, showError, showWarning } = useToast(); // Toast notifications

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

    // Function to com
    // bine and group expenses and transactions by month
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

    // Helper function to get user ID from member data consistently
    const getMemberUserId = useCallback((member) => {
        return member.userUser_Id || member.user?.user_Id || member.user_Id || member.userId;
    }, []);

    // Helper function to get current user ID
    const getCurrentUserId = useCallback(() => {
        return user?.user_Id || null;
    }, [user]);

    // Helper functions for confirmation modals
    const showConfirmationModal = useCallback((config) => {
        setConfirmationModal({
            isOpen: true,
            title: config.title,
            message: config.message,
            details: config.details || '',
            confirmButtonText: config.confirmButtonText || 'Confirm',
            onConfirm: config.onConfirm,
            requiresTyping: config.requiresTyping || false,
            requiredText: config.requiredText || '',
            isLoading: false
        });
    }, []);

    const closeConfirmationModal = useCallback(() => {
        setConfirmationModal(prev => ({
            ...prev,
            isOpen: false,
            isLoading: false
        }));
    }, []);

    const setConfirmationLoading = useCallback((loading) => {
        setConfirmationModal(prev => ({
            ...prev,
            isLoading: loading
        }));
    }, []);

    // Check if current user is the group creator
    const isCurrentUserCreator = useMemo(() => {
        const currentUserId = getCurrentUserId();
        if (!currentUserId || !groupDetails?.group?.groupMembers) return false;
        
        const currentUserMember = groupDetails.group.groupMembers.find(member => 
            getMemberUserId(member) === currentUserId
        );
        
        return currentUserMember?.member_role === 'creator';
    }, [getCurrentUserId, getMemberUserId, groupDetails?.group?.groupMembers]);

    // Helper function to get creator name from group members
    const getCreatorName = useCallback((creatorId) => {
        if (!creatorId || !groupDetails?.group?.groupMembers) return 'Someone';
        
        // Find the creator in the group members
        const creator = groupDetails.group.groupMembers.find(member => 
            getMemberUserId(member) === creatorId
        );
        
        if (creator) {
            return `${creator.first_name || ''} ${creator.last_name || ''}`.trim() || 'Someone';
        }
        
        return 'Someone';
    }, [getMemberUserId, groupDetails?.group?.groupMembers]);

    // Helper function to get user name by ID
    const getUserNameById = useCallback((userId) => {
        if (!userId || !groupDetails?.group?.groupMembers) return 'Someone';
        
        const user = groupDetails.group.groupMembers.find(member => 
            getMemberUserId(member) === userId
        );
        
        if (user) {
            return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Someone';
        }
        
        return 'Someone';
    }, [getMemberUserId, groupDetails?.group?.groupMembers]);

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

    // Map group members from API data (memoized to prevent unnecessary re-renders)
    const members = useMemo(() => {
        return groupDetails?.group?.groupMembers?.map(member => ({
            name: `${member.first_name} ${member.last_name}`,
            img: "../images/profile.png"
        })) || [];
    }, [groupDetails?.group?.groupMembers]);

    const visibleMembers = useMemo(() => members.slice(0, 2), [members]);
    const remainingCount = useMemo(() => members.length - 2, [members.length]);

    const handleGenerateReport = async () => {
        if (!groupDetails) {
            showError('No group data available to generate report');
            return;
        }

        try {
            setGeneratingReport(true);
            const result = await generateGroupReport(groupDetails);
            
            if (result.success) {
                showSuccess(`Report generated successfully! File saved as: ${result.fileName}`);
            } else {
                showError(`Error generating report: ${result.error}`);
            }
        } catch (error) {
            console.error('Error generating report:', error);
            showError('Failed to generate report. Please try again.');
        } finally {
            setGeneratingReport(false);
        }
    };

    // Function to calculate total balance amount (memoized)
    const totalBalance = useMemo(() => {
        if (!balanceData?.members) return 0;
        
        return balanceData.members.reduce((total, member) => {
            const amount = parseFloat(member.amount) || 0;
            return total + amount;
        }, 0);
    }, [balanceData?.members]);

    // Function to load balance data
    const loadBalanceData = useCallback(async () => {
        if (!groupId) return;
        
        setBalanceLoading(true);
        setError(null); // Reset error state
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
    }, [groupId]);

    // Function to reload group details
    const loadGroupDetails = useCallback(async () => {
        if (!groupId) return;
        
        setLoading(true);
        setError(null); // Reset error state
        try {
            const data = await getGroupDetails(groupId);
            setGroupDetails(data);
            console.log('Group Details:', data);
            
            // Also reload balance data
            await loadBalanceData();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [groupId, loadBalanceData]);

    // Function to handle group name editing
    const handleEditGroupName = () => {
        setEditedGroupName(groupDetails?.group?.name || '');
        setIsEditingGroupName(true);
    };

    const handleUpdateGroupName = useCallback(async () => {
        if (!editedGroupName.trim()) {
            showWarning('Please enter a valid group name.');
            return;
        }

        try {
            setIsEditingGroupName(false); // Set to false to show loading state
            setError(null); // Reset error state
            
            // Get current members from group details
            const currentMembers = groupDetails?.group?.groupMembers?.map(member => ({
                userId: getMemberUserId(member),
                role: member.member_role || 'member'
            })) || [];

            // Prepare update data - send all current members back with new name
            const updateData = {
                name: editedGroupName.trim(),
                members: currentMembers
            };

            console.log('Updating group name with data:', updateData);
            
            // Call the API to update group
            const response = await updateGroup(groupId, updateData);
            
            if (response.success) {
                // Update local state
                if (groupDetails && groupDetails.group) {
                    groupDetails.group.name = editedGroupName;
                    setGroupDetails({ ...groupDetails });
                }
                
                showSuccess('Group name updated successfully!');
            } else {
                // Revert editing state on error
                setIsEditingGroupName(true);
                setError(response.error || 'Failed to update group name. Please try again.');
                showError(response.error || 'Failed to update group name. Please try again.');
            }
        } catch (error) {
            console.error('Error updating group name:', error);
            setIsEditingGroupName(true); // Revert editing state on error
            setError('Failed to update group name. Please try again.');
            showError('Failed to update group name. Please try again.');
        }
    }, [editedGroupName, getMemberUserId, groupDetails, groupId, showSuccess, showError, showWarning]);

    const handleCancelEditGroupName = () => {
        setEditedGroupName('');
        setIsEditingGroupName(false);
    };

    // Check if group name has changed
    const hasGroupNameChanged = editedGroupName !== groupDetails?.group?.name && editedGroupName.trim() !== '';

    // Handle remove member confirmation
    const handleRemoveMember = useCallback(async (memberIndex, member) => {
        const memberData = groupDetails?.group?.groupMembers?.[memberIndex];
        const memberUserId = getMemberUserId(memberData);
        const currentUserId = getCurrentUserId();
        const isCurrentUser = memberUserId === currentUserId;
        
        if (!memberUserId) {
            showError('Error: Unable to identify the member to remove. Please try again.');
            return;
        }
        
        // Allow creators to remove any member (except themselves), or allow members to remove themselves
        if (!isCurrentUserCreator && !isCurrentUser) {
            showWarning('You can only remove yourself from the group. Only the group creator can remove other members.');
            return;
        }

        if (memberData?.member_role === 'creator') {
            showWarning('Cannot remove the group creator.');
            return;
        }

        // Check if member has non-zero balance before allowing removal
        try {
            // Load balance data if not already loaded
            if (!balanceData) {
                setBalanceLoading(true);
                await loadBalanceData();
                setBalanceLoading(false);
            }
            
            // Find member's balance in the balance data
            const memberBalance = balanceData?.members?.find(balanceMember => 
                balanceMember.userId === memberUserId
            );
            
            const memberAmount = memberBalance ? parseFloat(memberBalance.amount) : 0;
            
            // Prevent removal if member has non-zero balance
            if (memberAmount !== 0) {
                const balanceText = memberAmount > 0 
                    ? `owes LKR ${Math.abs(memberAmount).toFixed(2)} to the group`
                    : `is owed LKR ${Math.abs(memberAmount).toFixed(2)} by the group`;
                
                showError(`Cannot ${isCurrentUser ? 'leave' : 'remove'} ${member.name} - they have an outstanding balance. ${member.name} ${balanceText}. Please settle all balances before ${isCurrentUser ? 'leaving' : 'removing them from'} the group.`);
                return;
            }
        } catch (error) {
            console.error('Error checking member balance:', error);
            showError('Error checking member balance. Please try again.');
            return;
        }

        const actionText = isCurrentUser ? 'leave the group' : `remove ${member.name} from the group`;
        const title = isCurrentUser ? 'Leave Group' : 'Remove Member';
        const message = `Are you sure you want to ${actionText}?`;
        const details = `This action cannot be undone. ${isCurrentUser ? 'You' : 'The member'} will lose access to all group expenses and data.`;

        showConfirmationModal({
            title,
            message,
            details,
            confirmButtonText: isCurrentUser ? 'Leave Group' : 'Remove Member',
            onConfirm: () => confirmRemoveMember(memberUserId, member.name),
        });
    }, [isCurrentUserCreator, groupDetails?.group?.groupMembers, getMemberUserId, getCurrentUserId, showConfirmationModal, balanceData, loadBalanceData]);

    // Confirm remove member
    const confirmRemoveMember = useCallback(async (memberUserId, memberName) => {
        if (!memberUserId) {
            showError('Error: Unable to identify the member to remove. Please try again.');
            return;
        }
        
        try {
            setConfirmationLoading(true);
            setRemovingMemberId(memberUserId);
            setError(null); // Reset error state
            
            // Call the new removeMember API function
            const response = await removeMember(groupId, memberUserId);
            
            if (response.success) {
                closeConfirmationModal();
                // Reload group details to get updated member list
                await loadGroupDetails();
                showSuccess(`Successfully removed ${memberName} from the group!`);
                
                // If current user removed themselves, navigate back to home
                const currentUserId = getCurrentUserId();
                if (memberUserId === currentUserId) {
                    navigate('/home');
                }
            } else {
                setError(response.error || 'Failed to remove member. Please try again.');
                showError(response.error || 'Failed to remove member. Please try again.');
                closeConfirmationModal();
            }
        } catch (error) {
            console.error('Error removing member:', error);
            setError('Failed to remove member. Please try again.');
            showError('Failed to remove member. Please try again.');
            closeConfirmationModal();
        } finally {
            setConfirmationLoading(false);
            setRemovingMemberId(null);
        }
    }, [groupId, loadGroupDetails, closeConfirmationModal, setConfirmationLoading, getCurrentUserId, navigate, showSuccess, showError]);

    // Handle delete group (creator only)
    const handleDeleteGroup = useCallback(async () => {
        if (!isCurrentUserCreator) {
            showWarning('Only the group creator can delete the group.');
            return;
        }

        const hasActiveExpenses = groupDetails?.group?.expenses && groupDetails.group.expenses.length > 0;
        if (hasActiveExpenses) {
            showError(`Cannot delete group - ${groupDetails.group.expenses.length} active expense(s) found. Please settle or remove all expenses first.`);
            return;
        }

        const groupName = groupDetails?.group?.name || 'this group';
        
        showConfirmationModal({
            title: 'Delete Group',
            message: `Are you sure you want to permanently delete "${groupName}"?`,
            details: 'This action cannot be undone and will remove:\n- All group data\n- All member information\n- All expense history',
            confirmButtonText: 'Delete Group',
            requiresTyping: true,
            requiredText: 'DELETE',
            onConfirm: () => confirmDeleteGroup(),
        });
    }, [isCurrentUserCreator, groupDetails, showConfirmationModal, showWarning, showError]);

    // Confirm delete group
    const confirmDeleteGroup = useCallback(async () => {
        try {
            setConfirmationLoading(true);
            setError(null);
            
            const response = await deleteGroup(groupId);
            
            if (response.success) {
                closeConfirmationModal();
                showSuccess('Group deleted successfully!');
                navigate('/home');
            } else {
                setError(response.error || 'Failed to delete group. Please try again.');
                showError(response.error || 'Failed to delete group. Please try again.');
                closeConfirmationModal();
            }
        } catch (error) {
            console.error('Error deleting group:', error);
            setError('Failed to delete group. Please try again.');
            showError('Failed to delete group. Please try again.');
            closeConfirmationModal();
        } finally {
            setConfirmationLoading(false);
        }
    }, [groupId, closeConfirmationModal, setConfirmationLoading, navigate, showSuccess, showError]);

    // Handle member addition
    const handleMemberAdded = useCallback((newMembers) => {
        // Reload group details to get updated member list
        loadGroupDetails();
    }, [loadGroupDetails]);

    // Load balance data when switching to balance tab
    const handleTabChange = useCallback((tab) => {
        setActiveTab(tab);
        if (tab === 'balance' && !balanceData) {
            loadBalanceData();
        }
    }, [balanceData, loadBalanceData]);


    useEffect(() => {
        loadGroupDetails();
    }, [loadGroupDetails]);



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
                                                            
                                                            // Find the creator from the expense participants
                                                            const creatorParticipant = item.participant?.find(p => p.participant_role === 'Creator');
                                                            let creatorName = 'Someone';
                                                            
                                                            if (creatorParticipant) {
                                                                // Find the creator's name from group members
                                                                const creatorMember = groupDetails?.group?.groupMembers?.find(member => 
                                                                    getMemberUserId(member) === creatorParticipant.userUser_Id
                                                                );
                                                                
                                                                if (creatorMember) {
                                                                    creatorName = `${creatorMember.first_name || ''} ${creatorMember.last_name || ''}`.trim();
                                                                }
                                                            }
                                                            
                                                            // Check if current user is the creator
                                                            const currentUserId = getCurrentUserId();
                                                            const isCurrentUserCreator = creatorParticipant?.userUser_Id === currentUserId;
                                                            
                                                            if (isCurrentUserCreator) {
                                                                // Current user created/paid the expense
                                                                creatorName = 'You';
                                                                if (item.expense_owe_amount && item.expense_owe_amount > 0) {
                                                                    description = `Others owe you`;
                                                                    amount = `${item.expense_owe_amount?.toFixed(2) || '0.00'}`;
                                                                    isOwed = true;
                                                                } else {
                                                                    description = `You paid`;
                                                                    amount = `${item.expense_total_amount?.toFixed(2) || '0.00'}`;
                                                                    isOwed = true;
                                                                }
                                                            } else {
                                                                // Someone else created/paid the expense
                                                                if (item.expense_owe_amount && Math.abs(item.expense_owe_amount) > 0) {
                                                                    description = `You owe ${creatorName}`;
                                                                    amount = `${Math.abs(item.expense_owe_amount)?.toFixed(2) || '0.00'}`;
                                                                    isOwed = false;
                                                                } else {
                                                                    // Calculate split amount if no specific owe amount
                                                                    const splitAmount = item.expense_total_amount / (members.length || 1);
                                                                    description = `You owe ${creatorName}`;
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
                                                                        creatorName={creatorName}
                                                                    />
                                                                </div>
                                                            );
                                                        } else if (item.type === 'transaction') {
                                                            // Render transaction using PaidCard
                                                            const transactionDescription = getTransactionDescription(item, currentUserId);
                                                            const transactionTitle = `${item.expenseName} - Settlement`;
                                                            
                                                            // Find the expense creator for this transaction
                                                            let expenseCreatorName = 'Someone';
                                                            
                                                            // Find the expense that contains this transaction
                                                            const parentExpense = groupDetails?.group?.expenses?.find(expense => 
                                                                expense.transactions?.some(trans => trans.transaction_Id === item.transaction_Id)
                                                            );
                                                            
                                                            if (parentExpense) {
                                                                // Find the creator from the expense participants
                                                                const creatorParticipant = parentExpense.participant?.find(p => p.participant_role === 'Creator');
                                                                
                                                                if (creatorParticipant) {
                                                                    // Find the creator's name from group members
                                                                    const creatorMember = groupDetails?.group?.groupMembers?.find(member => 
                                                                        getMemberUserId(member) === creatorParticipant.userUser_Id
                                                                    );
                                                                    
                                                                    if (creatorMember) {
                                                                        expenseCreatorName = `${creatorMember.first_name || ''} ${creatorMember.last_name || ''}`.trim();
                                                                        
                                                                        // If current user is the creator, show "You"
                                                                        if (creatorParticipant.userUser_Id === currentUserId) {
                                                                            expenseCreatorName = 'You';
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                            
                                                            // Get payee name - check if current user is the payee
                                                            let payeeName = 'Someone';
                                                            if (item.payee_IdUser_Id === currentUserId) {
                                                                payeeName = 'You';
                                                            } else {
                                                                // Find payee name from group members
                                                                const payeeMember = groupDetails?.group?.groupMembers?.find(member => 
                                                                    getMemberUserId(member) === item.payee_IdUser_Id
                                                                );
                                                                
                                                                if (payeeMember) {
                                                                    payeeName = `${payeeMember.first_name || ''} ${payeeMember.last_name || ''}`.trim();
                                                                }
                                                            }
                                                            
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
                                                                        payeeName={payeeName}
                                                                        expenseCreatorName={expenseCreatorName}
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
                                                value={isEditingGroupName ? editedGroupName : (groupDetails?.group?.name || '')}
                                                onChange={(e) => setEditedGroupName(e.target.value)}
                                                disabled={!isEditingGroupName}
                                                className={`w-full mt-1 p-3 border border-gray-300 rounded-lg text-[#040b2b] ${
                                                    isEditingGroupName ? 'bg-white focus:outline-none focus:ring-2 focus:ring-blue-500' : 'bg-gray-100'
                                                }`}
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            {!isEditingGroupName ? (
                                                <button 
                                                    onClick={handleEditGroupName}
                                                    disabled={!isCurrentUserCreator}
                                                    className={`flex items-center gap-2 px-6 py-3 font-medium font-['Poppins'] rounded-lg text-sm transition-all ${
                                                        isCurrentUserCreator 
                                                            ? 'border border-[#040B2B] text-[#040B2B] hover:bg-[#040B2B] hover:text-white' 
                                                            : 'border border-gray-300 text-gray-400 cursor-not-allowed'
                                                    }`}
                                                    title={!isCurrentUserCreator ? 'Only the group creator can edit the group name' : ''}
                                                >
                                                    Edit
                                                </button>
                                            ) : (
                                                <div className="flex space-x-2">
                                                    <button 
                                                        onClick={handleUpdateGroupName}
                                                        disabled={!hasGroupNameChanged}
                                                        className={`flex items-center gap-2 px-6 py-3 font-medium font-['Poppins'] rounded-lg text-sm transition-all ${
                                                            hasGroupNameChanged 
                                                                ? 'border border-[#040B2B] text-[#040B2B] hover:bg-[#040B2B] hover:text-white' 
                                                                : 'border border-gray-300 text-gray-400 cursor-not-allowed'
                                                        }`}
                                                    >
                                                        {hasGroupNameChanged ? 'Update' : 'No Changes'}
                                                    </button>
                                                    <button 
                                                        onClick={handleCancelEditGroupName}
                                                        className="flex items-center gap-2 px-6 py-3 border border-[#DC2626] font-medium font-['Poppins'] text-[#DC2626] rounded-lg text-sm transition-all hover:bg-[#DC2626] hover:text-white"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Group Members Section */}
                                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="text-[#040b2b] text-base font-medium font-['Poppins']">
                                            Group Members ({members.length})
                                        </div>
                                        <button 
                                            onClick={() => isCurrentUserCreator ? setIsAddMemberModalOpen(true) : null}
                                            disabled={!isCurrentUserCreator}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                                                isCurrentUserCreator 
                                                    ? 'bg-[#040B2B] text-white hover:bg-[#0a1654]' 
                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                            title={!isCurrentUserCreator ? 'Only the group creator can add members' : ''}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" />
                                                <circle cx="8.5" cy="7" r="4" />
                                                <path d="M20 8V14M23 11H17" />
                                            </svg>
                                            Add Member
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {members.map((member, index) => {
                                            const memberAvatar = generateAvatar(member.name);
                                            const memberRole = groupDetails?.group?.groupMembers?.[index]?.member_role || 'member';
                                            const memberId = getMemberUserId(groupDetails?.group?.groupMembers?.[index]);
                                            const isRemoving = removingMemberId === memberId;
                                            const canRemove = isCurrentUserCreator && memberRole !== 'creator';
                                            
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
                                                        {canRemove && (
                                                            <button 
                                                                onClick={() => handleRemoveMember(index, member)}
                                                                disabled={isRemoving}
                                                                className={`px-3 py-1 text-xs rounded-lg transition ${
                                                                    isRemoving 
                                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                                                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                                                                }`}
                                                            >
                                                                {isRemoving ? 'Removing...' : 'Remove'}
                                                            </button>
                                                        )}
                                                        {memberRole === 'creator' && (
                                                            <span className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-lg">
                                                                Creator
                                                            </span>
                                                        )}
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
                                        {isCurrentUserCreator 
                                            ? "Deleting the group will permanently remove all data including expenses and member information. This action cannot be undone."
                                            : "Leaving the group will remove your access to all group expenses and data. You can be re-added by the group creator."
                                        }
                                    </div>
                                    <div className="space-y-3">
                                        {isCurrentUserCreator ? (
                                            // Show Delete Group button only for creators
                                            (() => {
                                                const hasActiveExpenses = groupDetails?.group?.expenses && groupDetails.group.expenses.length > 0;
                                                const canDelete = !hasActiveExpenses;
                                                
                                                return (
                                                    <button 
                                                        onClick={handleDeleteGroup}
                                                        disabled={!canDelete}
                                                        className={`w-full md:w-auto px-6 py-3 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                                                            canDelete 
                                                                ? 'bg-red-600 text-white hover:bg-red-700' 
                                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        }`}
                                                        title={
                                                            !canDelete 
                                                                ? `Cannot delete group - ${groupDetails.group.expenses.length} active expense(s) found. Please settle or remove all expenses first.`
                                                                : "Permanently delete this group and all its data"
                                                        }
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c0 1 1 2 2 2v2"/>
                                                            <line x1="10" y1="11" x2="10" y2="17"/>
                                                            <line x1="14" y1="11" x2="14" y2="17"/>
                                                        </svg>
                                                        {canDelete ? 'Delete Group' : 'Cannot Delete - Has Expenses'}
                                                    </button>
                                                );
                                            })()
                                        ) : (
                                            // Show Leave Group button only for members
                                            <button 
                                                onClick={() => {
                                                    const currentUserId = getCurrentUserId();
                                                    const currentUserMember = groupDetails?.group?.groupMembers?.find(member => 
                                                        getMemberUserId(member) === currentUserId
                                                    );
                                                    if (currentUserMember) {
                                                        const memberName = `${currentUserMember.first_name} ${currentUserMember.last_name}`;
                                                        handleRemoveMember(
                                                            groupDetails.group.groupMembers.indexOf(currentUserMember),
                                                            { name: memberName }
                                                        );
                                                    }
                                                }}
                                                className="w-full md:w-auto px-6 py-3 bg-white text-red-600 border border-red-300 rounded-lg text-sm font-medium hover:bg-red-50 transition flex items-center gap-2"
                                                title="Leave this group"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                                    <polyline points="16,17 21,12 16,7"/>
                                                    <line x1="21" y1="12" x2="9" y2="12"/>
                                                </svg>
                                                Leave Group
                                            </button>
                                        )}
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

            {/* Generic Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmationModal.isOpen}
                title={confirmationModal.title}
                message={confirmationModal.message}
                details={confirmationModal.details}
                confirmButtonText={confirmationModal.confirmButtonText}
                onConfirm={confirmationModal.onConfirm}
                onCancel={closeConfirmationModal}
                requiresTyping={confirmationModal.requiresTyping}
                requiredText={confirmationModal.requiredText}
                isLoading={confirmationModal.isLoading}
            />

            {/* Add Group Member Modal */}
            <AddGroupMember
                isOpen={isAddMemberModalOpen}
                onClose={() => setIsAddMemberModalOpen(false)}
                groupId={groupId}
                groupName={groupDetails?.group?.name || 'Group'}
                onMemberAdded={handleMemberAdded}
            />
        </div>
    );
};

export default GroupView;