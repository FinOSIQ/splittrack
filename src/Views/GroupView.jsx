import React, { useState } from 'react';
import Navbar from '../Components/Navbar.jsx';
import HeaderProfile from '../Components/HeaderProfile.jsx';

const GroupView = () => {
    const [activeTab, setActiveTab] = useState('expenses');
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
        <div className="flex min-h-screen bg-white w-full">
            <Navbar setActiveTab={setActiveTab} activeTab={activeTab} />

            <main className="flex-1 p-8 w-full max-w-[90vw] lg:max-w-[1400px] xl:max-w-[1600px] ml-24">
                <div className="mb-8">
                    <img src="src/images/SplitTrack Logo 1.png" alt="Logo" className="w-[504px] h-[116px]" />
                </div>

                <div className="w-full max-w-full mx-auto bg-[#f1f2f9] rounded-xl p-6 h-[380px] md:h-[350px] lg:h-[214px]">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center relative top-[-20px]">
                                <img src="src/images/group.png" alt="Group" className="w-[64px] h-[58px] top-[10px]" />
                                <div>
                                    <div className="w-[240.67px] text-[#040b2b] text-[20px] font-normal font-['Inter']">
                                        Software Group
                                    </div>
                                    <div className="w-[139.39px] text-[#5c5470] text-[13px] font-normal font-['Inter']">
                                        10 Dec, 2023
                                    </div>
                                </div>
                            </div>

                            <div className="w-[160.26px] mt-2 relative top-[-25px]">
                                {visibleMembers.map((member, index) => (
                                    <span key={index} className="text-[#5c5470] text-[14px] font-normal font-['Poppins']">
                                        {member.name}<br />
                                    </span>
                                ))}
                                {remainingCount > 0 && (
                                    <span
                                        className="text-[#5c5470] text-[14px] font-light font-['Poppins'] cursor-pointer underline"
                                        onClick={() => setIsModalOpen(true)}
                                    >
                                        +{remainingCount} more
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="ml-1 text-right w-[280px] mt-24">
                            <span className="text-[#040B2B] text-[20px] font-semibold font-['Inter']">
                                You Are Owed<br />
                            </span>
                            <span className="text-[#83FB62] text-[25px] font-bold font-['Inter']">
                                21,468.00 LKR
                            </span>
                        </div>
                    </div>
                    <div className="mt-4 flex space-x-24" style={{ marginTop: '-1.5rem' }}>
                        <button
                            onClick={() => setActiveTab('expenses')}
                            className={`px-24 py-2 rounded-2xl ${activeTab === 'expenses' ? 'bg-[#040B2B] text-white text-[15px]' : 'bg-gray-200'}`}
                        >
                            Expenses
                        </button>
                        <button
                            onClick={() => setActiveTab('balance')}
                            className={`px-24 py-2 rounded-2xl ${activeTab === 'balance' ? 'bg-[#040B2B] text-white text-[15px]' : 'bg-gray-200'}`}
                        >
                            Balance
                        </button>
                        <button
                            onClick={() => setActiveTab('report')}
                            className={`px-28 py-2 rounded-2xl ${activeTab === 'report' ? 'bg-[#040B2B] text-white text-[15px]' : 'bg-gray-200'}`}
                        >
                            Report
                        </button>


                    </div>
                </div>

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white p-6 rounded-lg w-[400px] shadow-lg">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold">Group Members</h2>
                                <button className="text-gray-500 text-lg" onClick={() => setIsModalOpen(false)}>✖</button>
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
                {activeTab === 'expenses' && (
                    <div className="space-y-8 w-full">
                        {/* December 2024 (Latest Month on Top) */}
                        <div>
                            <div className="w-[252.51px] h-[37.41px] text-[#040b2b] text-[17px] font-medium font-['Poppins'] leading-[24.94px] mt-8">December 2024</div>
                            <div className="mt-4 space-y-4">
                                <div className="flex items-center justify-between p-4 rounded">
                                    <div className="flex items-center">
                                        <div className="mr-4 text-center">
                                            <div className="w-[40.65px] h-[27.87px] text-[#040b2b] text-l font-normal font-['Poppins'] leading-[24.94px]">Dec</div>
                                            <div className="w-[36.29px] h-[27.87px] text-center text-[#040b2b] text-l font-normal font-['Poppins'] leading-[24.94px]">18</div>
                                        </div>
                                        <img src="src/images/plate.png" alt="Dinner Plate" className="w-[74px] h-[67px]" />
                                        <div className="ml-4">
                                            <div className="w-[137.73px] h-[35.85px] text-[#040b2b] text-[17px] font-normal font-['Poppins'] leading-[24.94px]">Dinner</div>
                                            <div className="w-[268.57px] h-[23.38px] text-[#61677d] text-base text-[13px] font-light font-['Poppins'] leading-[24.94px]">You Paid LKR 5,000.000</div>
                                        </div>
                                    </div>
                                    <div className="w-[168.40px] h-[26.50px] text-right text-[#040b2b] text-l font-semibold font-['Poppins']">5,000.00 LKR</div>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded">
                                    <div className="flex items-center">
                                        <div className="mr-4 text-center">
                                            <div class="w-[40.65px] h-[27.87px] text-[#040b2b] text-l font-normal font-['Poppins'] leading-[24.94px]">Dec</div>
                                            <div class="w-[36.29px] h-[27.87px] text-center text-[#040b2b] text-l font-normal font-['Poppins'] leading-[24.94px]">18</div>
                                        </div>
                                        <img
                                            src="src/images/plate.png"
                                            alt="Dinner Plate"
                                            class="w-[74px] h-[67px]" />

                                        <div className="ml-4">
                                            <div class="w-[137.73px] h-[35.85px] text-[#040b2b] text-[17px] font-normal font-['Poppins'] leading-[24.94px]">Dinner</div>
                                            <div class="w-[268.57px] h-[23.38px] text-[#61677d] text-base text-[13px] font-light font-['Poppins'] leading-[24.94px]">You Paid LKR 5,000.000</div>
                                        </div>
                                    </div>
                                    <div class="w-[168.40px] h-[26.50px] text-right text-[#040b2b] text-l font-semibold font-['Poppins']">5,000.00 LKR</div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="w-[252.51px] h-[37.41px] text-[#040b2b] text-[17px] font-medium font-['Poppins'] leading-[24.94px] mt-8">November 2024</div>
                            <div className="mt-4 space-y-4">
                                <div className="flex items-center justify-between p-4 rounded">
                                    <div className="flex items-center">
                                        <div className="mr-4 text-center">
                                            <div className="w-[40.65px] h-[27.87px] text-[#040b2b] text-l font-normal font-['Poppins'] leading-[24.94px]">Nov</div>
                                            <div className="w-[36.29px] h-[27.87px] text-center text-[#040b2b] text-l font-normal font-['Poppins'] leading-[24.94px]">18</div>
                                        </div>
                                        <img src="src/images/plate.png" alt="Dinner Plate" className="w-[74px] h-[67px]" />
                                        <div className="ml-4">
                                            <div className="w-[137.73px] h-[35.85px] text-[#040b2b] text-[17px] font-normal font-['Poppins'] leading-[24.94px]">Dinner</div>
                                            <div className="w-[268.57px] h-[23.38px] text-[#61677d] text-base text-[13px] font-light font-['Poppins'] leading-[24.94px]">You Paid LKR 5,000.000</div>
                                        </div>
                                    </div>
                                    <div className="w-[168.40px] h-[26.50px] text-right text-[#040b2b] text-l font-semibold font-['Poppins']">5,000.00 LKR</div>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded">
                                    <div className="flex items-center">
                                        <div className="mr-4 text-center">
                                            <div class="w-[40.65px] h-[27.87px] text-[#040b2b] text-l font-normal font-['Poppins'] leading-[24.94px]">Nov</div>
                                            <div class="w-[36.29px] h-[27.87px] text-center text-[#040b2b] text-l font-normal font-['Poppins'] leading-[24.94px]">18</div>
                                        </div>
                                        <img
                                            src="src/images/plate.png"
                                            alt="Dinner Plate"
                                            class="w-[74px] h-[67px]" />

                                        <div className="ml-4">
                                            <div class="w-[137.73px] h-[35.85px] text-[#040b2b] text-[17px] font-normal font-['Poppins'] leading-[24.94px]">Dinner</div>
                                            <div class="w-[268.57px] h-[23.38px] text-[#61677d] text-base text-[13px] font-light font-['Poppins'] leading-[24.94px]">You Paid LKR 5,000.000</div>
                                        </div>
                                    </div>
                                    <div class="w-[168.40px] h-[26.50px] text-right text-[#040b2b] text-l font-semibold font-['Poppins']">5,000.00 LKR</div>
                                </div>
                            </div>
                        </div>
                        


                    </div>
                )}
            </main>
        </div>
    );
};

export default GroupView;

