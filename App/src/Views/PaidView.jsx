import React from "react";
import HeaderProfile from "../Components/HeaderProfile";
import Frame from "../images/Frame.png";
import NavBar from "../Components/NavBar";

export default function PaidView() {
  return (

    <div>
      <NavBar />
      <div className="ml-8">
        <HeaderProfile />
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center">
            <img src={Frame} alt="Payment Frame" className="mx-auto mb-6" />
            <div className="text-center text-[#040b2b] text-2xl font-medium mb-2">
              Shehan Rajapaksha Paid you
            </div>
            <div className="text-center text-[#040b2b] text-xl font-medium mb-1">
              5,000.00 LKR
            </div>
            <div className="text-center text-[#61677d] text-sm font-light italic">
              24 November 2024
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
