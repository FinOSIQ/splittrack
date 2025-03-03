import FriendCard from "../Components/FriendCard";
import FriendReqCard from "../Components/FriendReqCard";

export default function AllFriends() {
    return (
        <div className="h-screen flex flex-row bg-white rounded-md mx-5 px-0 mt-4 overflow-x-hidden">

            {/* 65% column */}
            <div className="w-[70%] px-3">
                <div className="h-full rounded-2xl p-4 overflow-hidden">
                    <div className="text-[#040b2b] text-2xl font-bold font-inter mx-6 mt-1">Friends</div>
                    <div>
                        {/* ✅ Updated Search Bar */}
                        <div className=" ml-5 bg-[#f1f2f9] rounded-lg flex items-center px-4 border border-gray-300 focus-within:border-blue-500 mt-6 h-8">
                            {/* Search Icon */}
                            <svg className="w-4 h-4 mt-0.5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"></path>
                                <circle cx="10" cy="10" r="7"></circle>
                            </svg>

                            {/* Input Field */}
                            <input
                                type="text"
                                placeholder="Search Friends"
                                className="w-full bg-transparent outline-none text-gray-900 placeholder-gray-500 text-sm pl-2"
                            />
                        </div>
                        <div className="my-4 ml-2">
                            <FriendCard name={"Shehan Rajapaksha"} email={"shehan@gmail.co"} img="https://placehold.co/60x61" />

                        </div>

                    </div>
                </div>
            </div>

            {/* 35% column */}
            <div className="w-[30%] px-3 pb-12">
                <div className="h-full bg-[#f1f2f9] rounded-2xl p-4 overflow-hidden">
                    <div className="text-[#040b2b] text-2xl font-bold font-inter mx-6 mt-1">Friend Requests</div>

                    <div className="mx-1 my-4 pb-6 bg-white rounded-[32px]">
                        <div className="p-4 space-y-4">
                            <FriendReqCard img="https://placehold.co/60x61" name="John Doe" email="shehan@gmail.com" />
                            <FriendReqCard img="https://placehold.co/60x61" name="John Doe" email="shehan@gmail.com" />
                            <FriendReqCard img="https://placehold.co/60x61" name="John Doe" email="shehan@gmail.com" />
                            <FriendReqCard img="https://placehold.co/60x61" name="John Doe" email="shehan@gmail.com" />
                            <FriendReqCard img="https://placehold.co/60x61" name="John Doe" email="shehan@gmail.com" />
                            <FriendReqCard img="https://placehold.co/60x61" name="John Doe" email="shehan@gmail.com" />
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
}
