import FriendCard from "../Components/FriendCard";
import FriendReqComponent from "../Components/FriendReqComponent";
import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import HeaderProfile from "../Components/HeaderProfile";

export default function AllFriends() {
  const [activeTab, setActiveTab] = useState("friends");
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      // Determine direction based on the current tab
      const direction = activeTab === "friendRequests" ? 100 : -100;

      gsap.fromTo(
        contentRef.current,
        { x: direction, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
      );
    }
  }, [activeTab]);

  useEffect(() => {
    const handleResize = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) {
        setActiveTab("friends");
      }
    };

    // Initial check and add event listener
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <HeaderProfile />
      <div className="h-[80vh] flex flex-row bg-white rounded-md md:mx-5 -mt-8 px-0 md:mt-4 overflow-x-hidden overflow-y-hidden">
        {/* Left Column – 65% Width */}
        <div className="xl:w-[70%] lg:w-[60%] w-full md:px-3 px-1 xl:h-[78vh] lg:h-[76vh]">
          <div className="h-full rounded-2xl p-4 overflow-hidden">
            <div className="text-[#040b2b] text-2xl font-bold font-inter mx-6 mt-1 hidden lg:block">
              Friends
            </div>

            <div className="flex border-b border-gray-300 lg:hidden">
              <button
                className={`px-6 py-3 text-lg font-bold ${
                  activeTab === "friends"
                    ? "text-[#040b2b] border-b-2 border-[#040b2b]"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("friends")}
              >
                Friends
              </button>
              <button
                className={`px-6 py-3 text-lg font-bold ${
                  activeTab === "friendRequests"
                    ? "text-[#040b2b] border-b-2 border-[#040b2b]"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("friendRequests")}
              >
                Friend Requests
              </button>
            </div>
            <div>
              {/* Search Bar for Friends */}
              {activeTab === "friends" && (
                <div className="ml-5 bg-[#f1f2f9] rounded-lg flex items-center px-4 border border-gray-300 focus-within:border-blue-500 mt-6 h-8">
                  {/* Search Icon */}
                  <svg
                    className="w-4 h-4 mt-0.5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35"
                    ></path>
                    <circle cx="10" cy="10" r="7"></circle>
                  </svg>

                  <input
                    type="text"
                    placeholder="Search Friends"
                    className="w-full bg-transparent outline-none text-gray-900 placeholder-gray-500 text-sm pl-2"
                  />
                </div>
              )}

              {/* Content Area with Animation */}
              <div className="my-4 ml-2 overflow-y-auto max-h-[75vh] [&::-webkit-scrollbar]:w-2 scrollable-div">
                <div ref={contentRef}>
                  {activeTab === "friends" && (
                    <>
                      <FriendCard
                        name="Shehan Rajapaksha"
                        email="shehan@gmail.co"
                        img="https://placehold.co/60x61"
                      />
                      <FriendCard
                        name="Shehan Rajapaksha"
                        email="shehan@gmail.co"
                        img="https://placehold.co/60x61"
                      />
                      <FriendCard
                        name="Shehan Rajapaksha"
                        email="shehan@gmail.co"
                        img="https://placehold.co/60x61"
                      />
                      <FriendCard
                        name="Shehan Rajapaksha"
                        email="shehan@gmail.co"
                        img="https://placehold.co/60x61"
                      />
                      <FriendCard
                        name="Shehan Rajapaksha"
                        email="shehan@gmail.co"
                        img="https://placehold.co/60x61"
                      />
                      <FriendCard
                        name="Shehan Rajapaksha"
                        email="shehan@gmail.co"
                        img="https://placehold.co/60x61"
                      />
                      <FriendCard
                        name="Shehan Rajapaksha"
                        email="shehan@gmail.co"
                        img="https://placehold.co/60x61"
                      />
                      <FriendCard
                        name="Shehan Rajapaksha"
                        email="shehan@gmail.co"
                        img="https://placehold.co/60x61"
                      />
                      <FriendCard
                        name="Shehan Rajapaksha"
                        email="shehan@gmail.co"
                        img="https://placehold.co/60x61"
                      />
                      <FriendCard
                        name="Shehan Rajapaksha"
                        email="shehan@gmail.co"
                        img="https://placehold.co/60x61"
                      />
                      <FriendCard
                        name="Shehan Rajapaksha"
                        email="shehan@gmail.co"
                        img="https://placehold.co/60x61"
                      />
                      <FriendCard
                        name="Shehan Rajapaksha"
                        email="shehan@gmail.co"
                        img="https://placehold.co/60x61"
                      />
                      <FriendCard
                        name="Shehan Rajapaksha"
                        email="shehan@gmail.co"
                        img="https://placehold.co/60x61"
                      />
                    </>
                  )}

                  {activeTab === "friendRequests" && <FriendReqComponent />}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column – Desktop Only Friend Request Panel */}
        <div className="xl:w-[30%] lg:w-[40%] px-3 pb-10 hidden lg:block xl:h-[85vh] lg:h-[84vh]">
          <div className="h-full bg-[#f1f2f9] rounded-2xl p-4 overflow-hidden">
            <div className="text-[#040b2b] text-2xl font-bold font-inter mx-6 mt-1">
              Friend Requests
            </div>
            <FriendReqComponent />
          </div>
        </div>
      </div>
    </>
  );
}
