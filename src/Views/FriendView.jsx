import React, { useState } from 'react';
import Navbar from '../Components/NavBar.jsx';
import HeaderProfile from '../Components/HeaderProfile.jsx';
import OwedCard from '../Components/OwedCard.jsx';
import PaidCard from '../Components/PaidCard.jsx';


const FriendView = () => {
    const [activeTab, setActiveTab] = useState('settleup');
    const [isModalOpen, setIsModalOpen] = useState(false);


    const members = [
        { name: "Sonal Attanayake", img: "src/images/profile1.png" },
        { name: "Shehan Rajapaksha", img: "src/images/profile2.png" },
        { name: "Saradi Dassanayake", img: "src/images/profile3.png" },
        { name: "Thanura Mendis", img: "src/images/profile4.png" },
        { name: "Thanura Mendis", img: "src/images/profile4.png" }
    ];

    // Extract 
    const visibleMembers = members.slice(0, 2);
    const remainingCount = members.length - 2;


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
                        <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
            <img
                src="src/images/profile.png"
                alt="profile"
                className="w-[64px] h-[58px] top-[10px]"
            />
            <div>
                <div className="w-[240.67px] text-[#040b2b] text-lg font-normal font-['Inter']">
                    Sonal Attanayake
                </div>
                <div className="w-[139.39px] text-[#5c5470] text-xs font-normal font-['Inter']">
                    10 Dec, 2023
                </div>
            </div>
        </div>

        {/* Owed amount section (Aligned across from profile) */}
        <div className="ml-1 text-right w-[280px] mt-2">
            <span className="text-[#040B2B] text-base font-semibold font-['Inter']">
                You Are Owed
                <br />
            </span>
            <span className="text-[#83DB62] text-lg font-bold font-['Inter']">
                21,468.00 LKR
            </span>
        </div>
    </div>

                            

                            {/* Buttons section */}
                            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 w-full mt-2 gap-4 lg:gap-6">
                                <button
                                    onClick={() => setActiveTab('settleup')}
                                    className={`w-full sm:w-1/3 lg:w-1/4 py-2 rounded-2xl max-w-[300px] ${activeTab === 'settleup' ? 'bg-[#040B2B] text-white text-sm' : 'bg-gray-200'}`}
                                >
                                 Settle Up
                                </button>
                                <button
                                    onClick={() => setActiveTab('expenses')}
                                    className={`w-full sm:w-1/3 lg:w-1/4 py-2 rounded-2xl max-w-[300px] ${activeTab === 'expenses' ? 'bg-[#040B2B] text-white text-sm' : 'bg-gray-200'}`}
                                >
                                    Expenses
                                </button>
                                <button
                                    onClick={() => setActiveTab('report')}
                                    className={`w-full sm:w-1/3 lg:w-1/4 py-2 rounded-2xl max-w-[300px] ${activeTab === 'report' ? 'bg-[#040B2B] text-white text-sm' : 'bg-gray-200'}`}
                                >
                                    Report
                                </button>
                            </div>

                        </div>

                    </div>
                </div>

                {/* Modal */}
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

                


                <div className="bg-white p-4 mt-4 mx-2 sm:mx-4 md:mx-6 lg:mx-8">
                    {activeTab === 'settleup' && (
                        <div className="space-y-8 w-full">
                            {/* December 2024 (Latest Month on Top) */}
                            <div>
                                <div className="w-[252.51px] h-[37.41px] text-[#040b2b] text-base font-medium font-['Poppins'] leading-[24.94px] mt-8">December 2024</div>
                                <div className="mt-4 space-y-4">

                                    <OwedCard />
                                    <OwedCard />
                                    <PaidCard/>
                                </div>
                            </div>
                            <div>
                                <div className="w-[252.51px] h-[37.41px] text-[#040b2b] text-base font-medium font-['Poppins'] leading-[24.94px] mt-8">November 2024</div>
                                <div className="mt-4 space-y-4">
                                    <OwedCard />
                                    <OwedCard />
                                    <PaidCard/>

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
