import React from "react";
import GroupCard from "../Components/GroupCard";
import HeaderProfile from "../Components/HeaderProfile";
import NavBar from "../Components/NavBar";
import YourBalanceCard from "../Components/YourBalanceCard";
import FriendReqComponent from "../Components/FriendReqComponent";

export default function Home() {
  return (
    <>
      <NavBar />
      <div className="ml-8">
        
      <HeaderProfile />
      <div className="h-[80vh] flex flex-row bg-white rounded-md md:mx-5 -mt-8 px-0 md:mt-4 overflow-x-hidden overflow-y-hidden">
        {/* LEFT SIDE: Group Cards */}
        <div className="xl:w-[70%] lg:w-[60%] w-full md:px-3 px-1 xl:h-[78vh] lg:h-[76vh]">
          <div className="h-full rounded-2xl p-4 overflow-hidden">
            <div className="text-[#040b2b] text-2xl font-bold font-inter mx-0 mt-1">
              Groups
            </div>
            {/* A responsive grid for group cards */}
            <div className="grid grid-cols-2 gap-4 mt-4 overflow-y-auto h-[calc(100%-3rem)]">
              <GroupCard />
              <GroupCard />
              <GroupCard />
              <GroupCard />
              <GroupCard />
              <GroupCard />
              {/* Add as many GroupCard components as you need */}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Empty Column with bg-[#f1f2f9] */}
        <div className="xl:w-[30%] lg:w-[40%] px-3 pb-10 hidden lg:block xl:h-[85vh] lg:h-[84vh]">
          <div className="h-full bg-[#f1f2f9] rounded-2xl p-0 overflow-hidden">
            {/* This 35% column is intentionally left blank */}
            <YourBalanceCard/>
            <div className="p-8 -mt-8 ">
                <FriendReqComponent/>

            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
