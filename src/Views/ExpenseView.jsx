import React from "react";
import HeaderProfile from "../Components/HeaderProfile";
import photo from "../images/Untitled design (10) 1.png";


export default function ExpenseView() {
  return (
    <div>
      {/* Header Profile - Should not be inside the flex container */}
      <HeaderProfile />

      {/* Outer Flexbox for Expense Rows */}
        <div className="flex flex-col w-full mt-10 ">
            {/* First Expense Row */}
            <div className="flex items-center p-4 w-full max-w-[750px]">
            {/* Column 1 - Image */}
            <div className="w-16 flex justify-center">
                <img className="w-16 h-16" src={photo} alt="Expense" />
            </div>

            {/* Column 2 - Title & Amount */}
            <div className="flex-1 flex flex-col text-left ml-4">
                <h1 className="text-[#040b2b] font-normal font-['Poppins']">
                Dinner
                </h1>
                <h1 className="text-[#040b2b] text-3xl font-bold font-['Poppins']">
                5,000.00 LKR
                </h1>
            </div>

            {/* Column 3 - Date */}
            <div className="text-right">
                <h1 className="text-[#61677d] text-base font-normal font-['Poppins']">
                18 December 2024
                </h1>
            </div>
            </div>

            {/* Second Expense Row - Responsive Design */}
            <div className="p-4 w-full max-w-[750px] md:flex md:items-left">
            {/* Column 1 - Shortened Width */}
            <div className="hidden md:block w-16"></div>

            {/* Column 2 - Debt Info */}
                <div className="flex-1 flex flex-col text-left ml-4">
                <h1 className="text-[#61677d] font-normal font-['Poppins'] italic">
                    <p className="mb-2">- Shehan Rajapaksha owes You 2,000.00 LKR <br/></p>
                    <p className="mb-2">- Sonal Attanayake owes You 2,000.00 LKR <br /></p>
                    <p className="mb-2">- Saradi Dassanayake owes You 1,000.00 LKR <br /></p>
                </h1>
                </div>
            </div>
        </div>
        <hr className=" w-11/12 mx-auto mt-10"/>
    </div>
  );
}
