import React, { useState } from 'react';
import Navbar from '../Components/NavBar.jsx';
import HeaderProfile from '../Components/HeaderProfile.jsx';



const GroupView = () => {
    const [activeTab, setActiveTab] = useState('settleup');
    

    return (
        <div className="flex min-h-screen bg-white w-full ">

            
                <Navbar setActiveTab={setActiveTab} activeTab={activeTab} />
                
            




                <main className="flex-1 p-8 w-full max-w-[90vw] lg:max-w-[1400px] xl:max-w-[1600px] ml-28">

                    
                <div className="mb-8">
                    <img src="src/images/SplitTrack Logo 1.png" alt="Logo" className="w-[504px] h-[145px]" />
                </div>

                <div className="w-full max-w-full  mx-auto bg-[#f1f2f9] rounded-xl p-6 h-[400px] md:h-[350px] lg:h-[300px]">

                    <div className="flex items-center justify-between">
                        <div>
                        <div className="flex items-center mt-[-60px]">
                                <img src="src/images/profile.png" alt="Profile" className="w-[85px] h-[80px] right-[200]" />
                                <div>
                                    <div className="w-[329.67px] text-[#040b2b] text-[30px] font-normal font-['Inter'] " >
                                        Sonal Attanayake
                                    </div>

                                    <div className="w-[139.39px] text-[#5c5470] text-l font-normal font-['Inter']">
                                        10 Dec, 2023
                                    </div>
                                </div>
                            </div>
                            
                        </div>
                        <div className="ml-2 text-right w-[280px] mt-24">
                            <span className="text-[#040B2B] text-xl font-semibold font-['Inter']">
                                You Are Owed<br />
                            </span>
                            <span className="text-black text-[35px] font-bold font-['Inter']">
                                {/* Placeholder for empty space */}
                            </span>
                            <span className="text-[#83FB62] text-[35px] font-bold font-['Inter']">
                                21,468.00 LKR
                            </span>
                        </div>
                    </div>

                    <div className="mt-4 flex space-x-20" style={{ marginTop: '2rem' }}>
                        <button
                            onClick={() => setActiveTab('settleup')}
                            className={`px-28 py-3 rounded-2xl ${activeTab === 'settleup' ? 'bg-[#040B2B] text-white' : 'bg-gray-200'}`}
                        >
                            Settle Up
                        </button>
                        <button
                            onClick={() => setActiveTab('expenses')}
                            className={`px-28 py-3 rounded-2xl ${activeTab === 'expenses' ? 'bg-[#040B2B] text-white' : 'bg-gray-200'}`}
                        >
                            Expenses
                        </button>
                        <button
                            onClick={() => setActiveTab('report')}
                            className={`px-32 py-3 rounded-2xl ${activeTab === 'report' ? 'bg-[#040B2B] text-white' : 'bg-gray-200'}`}
                        >
                            Report
                        </button>
                       
                       
                    </div>
                </div>

                {activeTab === 'settleup' && (
                    <div className="space-y-8 w-full">
                        {/* December 2024 (Latest Month on Top) */}
                        <div>
                            <div class="w-[252.51px] h-[37.41px] text-[#040b2b] text-xl font-medium font-['Poppins'] leading-[24.94px] mt-8">December 2024</div>

                            <div className="mt-4 space-y-4">
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
                                            <div class="w-[137.73px] h-[35.85px] text-[#040b2b] text-xl font-normal font-['Poppins'] leading-[24.94px]">Dinner</div>
                                            <div class="w-[268.57px] h-[23.38px] text-[#61677d] text-base font-light font-['Poppins'] leading-[24.94px]">You Paid LKR 5,000.000</div>
                                        </div>
                                    </div>
                                    <div class="w-[168.40px] h-[26.50px] text-right text-[#040b2b] text-l font-semibold font-['Poppins']">5,000.00 LKR</div>
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
                                            <div class="w-[137.73px] h-[35.85px] text-[#040b2b] text-xl font-normal font-['Poppins'] leading-[24.94px]">Dinner</div>
                                            <div class="w-[268.57px] h-[23.38px] text-[#61677d] text-base font-light font-['Poppins'] leading-[24.94px]">You Paid LKR 5,000.000</div>
                                        </div>
                                    </div>
                                    <div class="w-[168.40px] h-[26.50px] text-right text-[#040b2b] text-l font-semibold font-['Poppins']">5,000.00 LKR</div>
                                </div>


                            </div>
                        </div>

                        {/* November 2024 */}
                        <div>
                            <div class="w-[252.51px] h-[37.41px] text-[#040b2b] text-xl font-medium font-['Poppins'] leading-[24.94px] mt-8">November 2024</div>

                            <div className="mt-4 space-y-4">
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
                                            <div class="w-[137.73px] h-[35.85px] text-[#040b2b] text-xl font-normal font-['Poppins'] leading-[24.94px]">Dinner</div>
                                            <div class="w-[268.57px] h-[23.38px] text-[#61677d] text-base font-light font-['Poppins'] leading-[24.94px]">You Paid LKR 5,000.000</div>
                                        </div>
                                    </div>
                                    <div class="w-[168.40px] h-[26.50px] text-right text-[#040b2b] text-l font-semibold font-['Poppins']">5,000.00 LKR</div>
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
                                            <div class="w-[137.73px] h-[35.85px] text-[#040b2b] text-xl font-normal font-['Poppins'] leading-[24.94px]">Dinner</div>
                                            <div class="w-[268.57px] h-[23.38px] text-[#61677d] text-base font-light font-['Poppins'] leading-[24.94px]">You Paid LKR 5,000.000</div>
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
