// src/screens/SettleUp.jsx
import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import HeaderProfile from "../Components/HeaderProfile";
import SettleUpFriendCard from "../Components/SettleUpFriendCard";
import YourBalanceCard from "../Components/YourBalanceCard";
import TransactionHistoryComponent from "../Components/TransactionHistoryComponent";
import { friendsToPay, friendsToBePaid } from "../../data";

export default function SettleUp() {
  const [activeTab, setActiveTab]     = useState("toPay");
  const [selectedFriend, setSelected] = useState(null);
  const listRef                       = useRef(null);

  // slide-in animation
  useEffect(() => {
    if (listRef.current) {
      gsap.fromTo(
        listRef.current,
        { x: -100, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [activeTab]);

  const list    = activeTab === "toPay" ? friendsToPay : friendsToBePaid;
  const history = selectedFriend?.transactions || [];

  return (
    <>
      <HeaderProfile />

      <div className="h-[80vh] flex bg-white rounded-md md:mx-5 -mt-8 md:mt-4 overflow-hidden">
        {/* Left */}
        <div className="xl:w-[70%] lg:w-[60%] w-full p-4 flex flex-col">
          <h2 className="text-2xl font-bold mb-4">Settle Ups</h2>

          {/* balance on mobile above list */}
          <div className="block lg:hidden mb-4">
            <YourBalanceCard />
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-300">
            <button
              className={`flex-1 py-2 text-center ${
                activeTab === "toPay"
                  ? "border-b-2 border-[#040b2b] text-[#040b2b]"
                  : "text-gray-500"
              }`}
              onClick={() => { setActiveTab("toPay"); setSelected(null); }}
            >
              To pay
            </button>
            <button
              className={`flex-1 py-2 text-center ${
                activeTab === "toBePaid"
                  ? "border-b-2 border-[#040b2b] text-[#040b2b]"
                  : "text-gray-500"
              }`}
              onClick={() => { setActiveTab("toBePaid"); setSelected(null); }}
            >
              To be payed
            </button>
          </div>

          {/* Search */}
          <div className="mt-4">
            <div className="bg-[#f1f2f9] rounded-lg flex items-center px-4 h-10 border border-gray-300">
              {/* SVG omitted */}
              <input
                className="ml-2 w-full bg-transparent outline-none placeholder-gray-500 text-sm"
                placeholder="Search Friends"
              />
            </div>
          </div>

          {/* Friend list */}
          <div ref={listRef} className="mt-4 flex-1 overflow-y-auto scrollable-div">
            {list.map(fr => (
              <SettleUpFriendCard
                key={fr.id}
                {...fr}
                type={activeTab}
                onClick={() => setSelected(fr)}
              />
            ))}
          </div>
        </div>

        {/* Desktop Right (unchanged) */}
        <div className="xl:w-[30%] lg:w-[40%] hidden lg:flex flex-col p-4 bg-[#f1f2f9] rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">Your Balance</h2>
          <YourBalanceCard />
          <div className="mt-6 flex-1 overflow-y-auto scrollable-div">
            {selectedFriend ? (
              <TransactionHistoryComponent transactions={history} />
            ) : (
              <div className="text-gray-500 text-center mt-10">
                Select a friend to view history
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Pop‑Up of right section */}
      {selectedFriend && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-[#f1f2f9] w-11/12 max-w-sm rounded-2xl overflow-hidden flex flex-col max-h-[80vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Scrollable history */}
            <div className="p-4 flex-1 overflow-y-auto">
              <h3 className="text-lg font-medium mb-4">
                {selectedFriend.name}'s activity
              </h3>
              <TransactionHistoryComponent transactions={history} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
