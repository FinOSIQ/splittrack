import React from 'react';

const GroupView = () => {
  return (
    <div className="flex min-h-screen bg-white">
      <nav className="w-16 flex-shrink-0 bg-[#F1F2F9] flex flex-col items-center py-4">
        <button className="mb-8 mt-20" onClick={() => (window.location.href = "/settle")}>
          <img src="src/images/settle.png" alt="Icon 1" className="block w-6 h-6 rounded-full" />
        </button>
        <button className="mb-8" onClick={() => (window.location.href = "/cgroup")}>
          <img src="src/images/cgroup.png" alt="Icon 2" className="block w-6 h-6 rounded-full" />
        </button>
        <button className="mb-8" onClick={() => (window.location.href = "/add")}>
          <img src="src/images/add.png" alt="Icon 3" className="block w-6 h-6 rounded-full" />
        </button>
        <button className="mb-8" onClick={() => (window.location.href = "/activity")}>
          <img src="src/images/activity.png" alt="Icon 4" className="block w-6 h-6 rounded-full" />
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-8 mr-16">
        {/* Logo Above Header */}
        <div className="mb-6">
          <img
            src="src/images/SplitTrack Logo 1.png" // Replace with your logo's path
            alt="Logo"
            className="w-64 h-auto" // Adjust the size of the logo as needed
          />
        </div>
        {/* Header Card */}
        <div className="bg-[#F1F2F9] p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center">
                <img
                  src="src/images/group.png"
                  alt="Your Image"
                  className="w-12 h-12 rounded-full mr-4" // Adjust size and spacing
                />
                <div>
                  <h1 className="text-2xl text-[#040B2B]">Software Group</h1>
                  <p className="text-sm text-gray-500">10 Dec, 2023</p>
                </div>
              </div>

              <p className="text-sm text-gray-500">Sonal Attanayake, Shehan Rajapaksha, +2 more</p>
            </div>
            {/* Adjusted Right Content */}
            <div className="ml-2">
              <p className="font-bold text-sm text-black">You Are Owed</p>
              <p className="text-2xl font-bold text-green-500">21,468.00 LKR</p>
            </div>
          </div>

          <div className="mt-4 flex space-x-16">
            {/* Updated Buttons as Links */}
            <button 
              onClick={() => (window.location.href = "/balances")} 
              className="px-20 py-2 bg-[#040B2B] text-white rounded"
            >
              Balances
            </button>
            <button 
              onClick={() => (window.location.href = "/expenses")} 
              className="px-20 py-2 bg-gray-200 rounded"
            >
              Expenses
            </button>
            <button 
              onClick={() => (window.location.href = "/members")} 
              className="px-20 py-2 bg-gray-200 rounded"
            >
              Members
            </button>
            <button 
              onClick={() => (window.location.href = "/report")} 
              className="px-20 py-2 bg-gray-200 rounded"
            >
              Report
            </button>
          </div>
        </div>

        {/* Monthly Balances */}
        <div className="mt-8 grid grid-cols-2 gap-8">
          {/* December 2024 */}
          <div className="border-r border-gray-300 pr-8"> {/* Vertical line on the right */}
            <h2 className="text-lg font-bold">December 2024</h2>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between p-4 rounded">
                <div className="flex items-center">
                  <div className="mr-4 text-center">
                    <p className="text-sm text-black">Dec</p>
                    <p className="text-sm text-black">18</p>
                  </div>
                  <img
                    src="src/images/plate.png"
                    alt="Dinner Plate"
                    className="w-10 h-10"
                  />

                  <div className="ml-4">
                    <p className="font-bold">Dinner</p>
                    <p className="text-sm text-gray-500">You Paid LKR 5,000.00</p>
                  </div>
                </div>
                <p className="font-bold">5,000.00 LKR</p>
              </div>

              <div className="flex items-center justify-between p-4 rounded">
                <div className="flex items-center">
                  <div className="mr-4 text-center">
                    <p className="text-sm text-black">Dec</p>
                    <p className="text-sm text-black">18</p>
                  </div>
                  <img
                    src="src/images/plate.png"
                    alt="Dinner Plate"
                    className="w-10 h-10"
                  />
                  <div className="ml-4">
                    <p className="font-bold">Dinner</p>
                    <p className="text-sm text-gray-500">You Paid LKR 5,000.00</p>
                  </div>
                </div>
                <p className="font-bold">5,000.00 LKR</p>
              </div>
            </div>
          </div>

          {/* November 2024 */}
          <div className="pl-8">
            <h2 className="text-lg font-bold">November 2024</h2>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between p-4 rounded">
                <div className="flex items-center">
                  <div className="mr-4 text-center">
                    <p className="text-sm text-black">Nov</p>
                    <p className="text-sm text-black">18</p>
                  </div>
                  <img
                    src="src/images/plate.png"
                    alt="Dinner Plate"
                    className="w-10 h-10"
                  />
                  <div className="ml-4">
                    <p className="font-bold">Dinner</p>
                    <p className="text-sm text-gray-500">You Paid LKR 5,000.00</p>
                  </div>
                </div>
                <p className="font-bold">5,000.00 LKR</p>
              </div>

              <div className="flex items-center justify-between p-4 rounded">
                <div className="flex items-center">
                  <div className="mr-4 text-center">
                    <p className="text-sm text-black">Nov</p>
                    <p className="text-sm text-black">18</p>
                  </div>
                  <img
                    src="src/images/plate.png"
                    alt="Dinner Plate"
                    className="w-10 h-10"
                  />
                  <div className="ml-4">
                    <p className="font-bold">Dinner</p>
                    <p className="text-sm text-gray-500">You Paid LKR 5,000.00</p>
                  </div>
                </div>
                <p className="font-bold">5,000.00 LKR</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GroupView;
