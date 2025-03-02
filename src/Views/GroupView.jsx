import React from 'react';

const GroupView = () => {
  const [activeTab, setActiveTab] = useState('balances');
  const members = [
    { name: 'Sonal Attanayake', image: 'src/images/profile1.png' },
    { name: 'Shehan Rajapaksha', image: 'src/images/profile2.png' },
    { name: 'Saradi dassanayake', image: 'src/images/profile3.png' },
    { name: 'Thanura Mendis', image: 'src/images/profile4.png' }
  ];

  return (
    <div className="flex min-h-screen bg-white">
      <nav className="w-16 flex-shrink-0 bg-[#F1F2F9] flex flex-col items-center py-4">
        <button className="mb-8 mt-20" onClick={() => setActiveTab('settle')}>
          <img src="src/images/settle.png" alt="Settle" className="block w-6 h-6 rounded-full" />
        </button>
        <button className="mb-8" onClick={() => setActiveTab('cgroup')}>
          <img src="src/images/cgroup.png" alt="Create Group" className="block w-6 h-6 rounded-full" />
        </button>
        <button className="mb-8" onClick={() => setActiveTab('add')}>
          <img src="src/images/add.png" alt="Add" className="block w-6 h-6 rounded-full" />
        </button>
        <button className="mb-8" onClick={() => setActiveTab('activity')}>
          <img src="src/images/activity.png" alt="Activity" className="block w-6 h-6 rounded-full" />
        </button>
      </nav>

      <main className="flex-1 p-8 mr-16">
        <div className="mb-6">
          <img src="src/images/SplitTrack Logo 1.png" alt="Logo"
            class="w-[504px] h-[145px]" />
        </div>

        <div className="w-[1145px] h-[333px] bg-[#f1f2f9] rounded-xl p-6">

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center">
                <img src="src/images/group.png" alt="Group" class="w-[99.57px] h-[90px]" />
                <div>
                  <div className="w-[329.67px] text-[#040b2b] text-[40px] font-normal font-['Inter']">
                    Software Group
                  </div>

                  <div className="w-[139.39px] text-[#5c5470] text-xl font-normal font-['Inter']">
                    10 Dec, 2023
                  </div>

                </div>
              </div>
              <div className="w-[221.26px] mt-2">
                <span className="text-[#5c5470] text-xl font-normal font-['Poppins']">
                  Sonal Attanayake<br />Shehan Rajapaksha<br />
                </span>
                <span className="text-[#5c5470] text-xl font-light font-['Poppins']">
                  +2 more
                </span>
              </div>
            </div>
            <div className="ml-2 text-right w-[280px] mt-8" >
              <span className="text-[#040B2B] text-2xl font-semibold font-['Inter']">
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

          <div className="mt-4 flex space-x-16" style={{ marginTop: '4rem' }}>
            <button
              onClick={() => setActiveTab('balances')}
              className={`px-20 py-2 rounded-3xl ${activeTab === 'balances' ? 'bg-[#040B2B] text-white' : 'bg-gray-200'}`}
            >
              Balances
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`px-20 py-2 rounded-3xl ${activeTab === 'expenses' ? 'bg-[#040B2B] text-white' : 'bg-gray-200'}`}
            >
              Expenses
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`px-20 py-2 rounded-3xl ${activeTab === 'members' ? 'bg-[#040B2B] text-white' : 'bg-gray-200'}`}
            >
              Members
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`px-20 py-2 rounded-3xl ${activeTab === 'report' ? 'bg-[#040B2B] text-white' : 'bg-gray-200'}`}
            >
              Report
            </button>
          </div>

        </div>


        {activeTab === 'balances' && (
          <div className="space-y-8">
            {/* December 2024 (Latest Month on Top) */}
            <div>
              <div class="w-[252.51px] h-[37.41px] text-[#040b2b] text-[26px] font-medium font-['Poppins'] leading-[24.94px] mt-8">December 2024</div>

              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between p-4 rounded">
                  <div className="flex items-center">
                    <div className="mr-4 text-center">
                      <div class="w-[40.65px] h-[27.87px] text-[#040b2b] text-xl font-normal font-['Poppins'] leading-[24.94px]">Dec</div>
                      <div class="w-[36.29px] h-[27.87px] text-center text-[#040b2b] text-xl font-normal font-['Poppins'] leading-[24.94px]">18</div>
                    </div>
                    <img
                      src="src/images/plate.png"
                      alt="Dinner Plate"
                      class="w-[74px] h-[67px]" />

                    <div className="ml-4">
                      <div class="w-[137.73px] h-[35.85px] text-[#040b2b] text-[26px] font-normal font-['Poppins'] leading-[24.94px]">Dinner</div>
                      <div class="w-[268.57px] h-[23.38px] text-[#61677d] text-base font-light font-['Poppins'] leading-[24.94px]">You Paid LKR 5,000.000</div>
                    </div>
                  </div>
                  <div class="w-[168.40px] h-[26.50px] text-right text-[#040b2b] text-xl font-semibold font-['Poppins']">5,000.00 LKR</div>
                </div>
                <div className="flex items-center justify-between p-4 rounded">
                  <div className="flex items-center">
                    <div className="mr-4 text-center">
                      <div class="w-[40.65px] h-[27.87px] text-[#040b2b] text-xl font-normal font-['Poppins'] leading-[24.94px]">Dec</div>
                      <div class="w-[36.29px] h-[27.87px] text-center text-[#040b2b] text-xl font-normal font-['Poppins'] leading-[24.94px]">18</div>
                    </div>
                    <img
                      src="src/images/plate.png"
                      alt="Dinner Plate"
                      class="w-[74px] h-[67px]" />

                    <div className="ml-4">
                      <div class="w-[137.73px] h-[35.85px] text-[#040b2b] text-[26px] font-normal font-['Poppins'] leading-[24.94px]">Dinner</div>
                      <div class="w-[268.57px] h-[23.38px] text-[#61677d] text-base font-light font-['Poppins'] leading-[24.94px]">You Paid LKR 5,000.000</div>
                    </div>
                  </div>
                  <div class="w-[168.40px] h-[26.50px] text-right text-[#040b2b] text-xl font-semibold font-['Poppins']">5,000.00 LKR</div>
                </div>


              </div>
            </div>

            {/* November 2024 */}
            <div>
              <div class="w-[252.51px] h-[37.41px] text-[#040b2b] text-[26px] font-medium font-['Poppins'] leading-[24.94px] mt-8">November 2024</div>

              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between p-4 rounded">
                  <div className="flex items-center">
                    <div className="mr-4 text-center">
                      <div class="w-[40.65px] h-[27.87px] text-[#040b2b] text-xl font-normal font-['Poppins'] leading-[24.94px]">Nov</div>
                      <div class="w-[36.29px] h-[27.87px] text-center text-[#040b2b] text-xl font-normal font-['Poppins'] leading-[24.94px]">18</div>
                    </div>
                    <img
                      src="src/images/plate.png"
                      alt="Dinner Plate"
                      class="w-[74px] h-[67px]" />

                    <div className="ml-4">
                      <div class="w-[137.73px] h-[35.85px] text-[#040b2b] text-[26px] font-normal font-['Poppins'] leading-[24.94px]">Dinner</div>
                      <div class="w-[268.57px] h-[23.38px] text-[#61677d] text-base font-light font-['Poppins'] leading-[24.94px]">You Paid LKR 5,000.000</div>
                    </div>
                  </div>
                  <div class="w-[168.40px] h-[26.50px] text-right text-[#040b2b] text-xl font-semibold font-['Poppins']">5,000.00 LKR</div>
                </div>
                <div className="flex items-center justify-between p-4 rounded">
                  <div className="flex items-center">
                    <div className="mr-4 text-center">
                      <div class="w-[40.65px] h-[27.87px] text-[#040b2b] text-xl font-normal font-['Poppins'] leading-[24.94px]">Nov</div>
                      <div class="w-[36.29px] h-[27.87px] text-center text-[#040b2b] text-xl font-normal font-['Poppins'] leading-[24.94px]">18</div>
                    </div>
                    <img
                      src="src/images/plate.png"
                      alt="Dinner Plate"
                      class="w-[74px] h-[67px]" />

                    <div className="ml-4">
                      <div class="w-[137.73px] h-[35.85px] text-[#040b2b] text-[26px] font-normal font-['Poppins'] leading-[24.94px]">Dinner</div>
                      <div class="w-[268.57px] h-[23.38px] text-[#61677d] text-base font-light font-['Poppins'] leading-[24.94px]">You Paid LKR 5,000.000</div>
                    </div>
                  </div>
                  <div class="w-[168.40px] h-[26.50px] text-right text-[#040b2b] text-xl font-semibold font-['Poppins']">5,000.00 LKR</div>
                </div>


              </div>
            </div>


          </div>
        )}

        {activeTab === 'members' && (

          <div className="mt-8 grid grid-cols-2 gap-4"> {/* This uses CSS grid to display 2 items per row */}
            {members.map((member, index) => (
              <div key={index} className="flex items-center bg-[#F1F2F9] p-4 rounded-lg shadow-md">
                <img src={member.image} alt={member.name} className="w-12 h-12 rounded-full mr-4" />
                <p className="text-lg font-bold text-black">{member.name}</p>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
};

export default GroupView;
