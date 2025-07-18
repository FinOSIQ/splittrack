import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../Components/NavBar.jsx';
import HeaderProfile from '../Components/HeaderProfile.jsx';
import OwedCard from '../Components/OwedCard.jsx';
import PaidCard from '../Components/PaidCard.jsx';
import { getFriendExpense } from '../utils/requests/Friend.js';
import { generateDetailedReport } from '../utils/pdfGenerator.js';


const FriendView = () => {
    const [activeTab, setActiveTab] = useState('settleup');
    const [friendData, setFriendData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [generatingReport, setGeneratingReport] = useState(false);
    const { friendId } = useParams(); // Get friendId from URL parameters

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


                        <div className="bg-[#f1f2f9] p-2 flex flex-col space-y-8">
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
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <img
                                            src="src/images/profile.png"
                                            alt="profile"
                                            className="w-[64px] h-[58px] "
                                        />
                                        <div>
                                            <div className="text-[#040b2b] text-lg font-normal font-['Inter']">
                                                {friendData?.friend_Name || 'Unknown Friend'}
                                            </div>
                                            <div className=" text-[#5c5470] text-xs font-normal font-['Inter']">
                                                Friend ID: {friendData?.friend_Id || 'N/A'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Owed amount section (Aligned across from profile) */}
                                    <div className="ml-1 text-right mt-2">
                                        {friendData?.netAmount !== undefined && (
                                            <>
                                                <span className="text-[#040B2B] text-base font-semibold font-['Inter']">
                                                    {friendData.netAmount >= 0 ? 'You Are Owed' : 'You Owe'}
                                                    <br />
                                                </span>
                                                <span className={`text-lg font-bold font-['Inter'] ${
                                                    friendData.netAmount >= 0 ? 'text-[#83DB62]' : 'text-[#FF6B6B]'
                                                }`}>
                                                    {Math.abs(friendData.netAmount).toFixed(2)} LKR
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}



                           
                            

                            {/* Responsive Buttons */}
                            <div className="mt-6">
                                <div className="flex justify-center flex-wrap gap-8 w-full">
                                    <button
                                        onClick={() => setActiveTab('settleup')}
                                        className={`w-[200px] sm:w-[240px] md:w-[280px] py-2 rounded-2xl text-sm transition ${activeTab === 'settleup' ? 'bg-[#040B2B] text-white' : 'bg-gray-200 text-[#040B2B]'
                                            }`}
                                    >
                                        Settle Up
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('expenses')}
                                        className={`w-[200px] sm:w-[240px] md:w-[280px] py-2 rounded-2xl text-sm transition ${activeTab === 'expenses' ? 'bg-[#040B2B] text-white' : 'bg-gray-200 text-[#040B2B]'
                                            }`}
                                    >
                                          Expenses
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






                <div className="bg-white p-4 mt-4 mx-2 sm:mx-4 md:mx-6 lg:mx-8">
                    {activeTab === 'settleup' && (
                        <div className="space-y-8 w-full">
                            {friendData?.details && friendData.details.length > 0 ? (
                                <div>
                                    <div className="text-[#040b2b] text-base font-medium font-['Poppins'] mt-8">
                                        Expenses with {friendData.friend_Name || 'Friend'}
                                    </div>
                                    <div className="mt-4 space-y-4">
                                        {friendData.details.map((expense, index) => {
                                            const isCurrentUserCreator = expense.currentUserRole === 'creator';
                                            const isFriendCreator = expense.friendRole === 'creator';
                                            
                                            let description = '';
                                            let amount = '';
                                            let isOwed = true;
                                            
                                            if (isCurrentUserCreator && !isFriendCreator) {
                                                // Current user is creator, friend owes them
                                                description = `${friendData.friend_Name} owes you`;
                                                amount = `${expense.friendAmount?.toFixed(2) || '0.00'}`;
                                                isOwed = true;
                                            } else if (isFriendCreator && !isCurrentUserCreator) {
                                                // Friend is creator, current user owes them
                                                description = `You owe ${friendData.friend_Name}`;
                                                amount = `${expense.currentUserAmount?.toFixed(2) || '0.00'}`;
                                                isOwed = false;
                                            } else {
                                                // Handle edge cases
                                                description = 'Shared expense';
                                                amount = '0.00';
                                                isOwed = true;
                                            }
                                            
                                            return (
                                                <OwedCard
                                                    key={expense.expenseId || index}
                                                    dateMonth="Dec"
                                                    dateDay={String(new Date().getDate())}
                                                    title={expense.expenseName || 'Expense'}
                                                    description={description}
                                                    amount={`${amount}`}
                                                    totalAmount={expense.expenseTotalAmount?.toFixed(2) || '0.00'}
                                                    isOwed={isOwed}
                                                    friendName={friendData.friend_Name}
                                                    currentUserRole={expense.currentUserRole}
                                                    friendRole={expense.friendRole}
                                                    currentUserAmount={expense.currentUserAmount?.toFixed(2) || '0.00'}
                                                    friendAmount={expense.friendAmount?.toFixed(2) || '0.00'}
                                                />
                                            );
                                        })}
                                    </div>
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
                    
                    {activeTab === 'expenses' && (
                        <div className="space-y-8 w-full">
                            <div className="text-center py-8">
                                <div className="text-[#61677d] text-base font-normal font-['Poppins']">
                                    Expenses tab content coming soon...
                                </div>
                            </div>
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
