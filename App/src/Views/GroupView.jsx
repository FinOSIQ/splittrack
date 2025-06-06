import React, { useState,useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../Components/NavBar.jsx';
import HeaderProfile from '../Components/HeaderProfile.jsx';
import OwedCard from '../Components/OwedCard.jsx';
import PaidCard from '../Components/PaidCard.jsx';
import CommentSection from '../Components/CommentSection.jsx';
import { getGroupDetails } from '../utils/requests/Group'; 
import GroupImage from '../images/group.png'; 
import ProfileImage from '../images/profile.png'; 

const GroupView = () => {
    const [activeTab, setActiveTab] = useState('expenses');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [groupDetails, setGroupDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);



    const { groupId } = useParams();

    // Map group members from API data
    const members = groupDetails?.group?.groupMembers?.map(member => ({
        name: `${member.first_name} ${member.last_name}`,
        img: "../images/profile.png"
    })) || [];

    const visibleMembers = members.slice(0, 2);
    const remainingCount = members.length - 2;


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
                                        <img src={member.img} alt={member.name} className="w-10 h-10 rounded-full" />
                                        <span className="text-[#040b2b] text-lg">{member.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab content */}
                <div className="bg-white p-4 mt-4 mx-2 sm:mx-4 md:mx-6 lg:mx-8">
                    {activeTab === 'expenses' && (
                        <div className="space-y-8 w-full">
                            <div>
                                <div className="text-[#040b2b] text-base font-medium font-['Poppins'] mt-8">
                                    December 2024
                                </div>
                                <div className="mt-4 space-y-4">
                                    {groupDetails?.group?.expenses?.map((expense) => (
                                        <OwedCard
                                            key={expense.expense_Id}
                                            dateMonth="Dec"
                                            dateDay="18"
                                            title={expense.name}
                                            description={`You Paid LKR ${expense.expense_total_amount.toLocaleString()}`}
                                            amount={`${expense.expense_owe_amount.toLocaleString()} LKR`}
                                        />
                                    ))}
                                    <PaidCard />
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