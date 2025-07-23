import React, { useState } from "react";
import { createGroup } from "../utils/requests/Group";
import { toast } from "sonner";
import { useUserData } from "../hooks/useUserData";
import { fetchSearchData } from "../utils/requests/expense";
import axios from "axios";
import SearchResults from "./SearchResults";

export default function CreateGroupModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [friendInput, setFriendInput] = useState("");
    const [friends, setFriends] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    
    // Get user data from hook
    const { user, loading: userLoading } = useUserData();

    const handleAddFriend = (e) => {
        e.preventDefault();
        if (friendInput.trim()) {
            setFriends((prev) => [...prev, friendInput.trim()]);
            setFriendInput("");
            setSearchResults({}); // Clear search results after adding
        }
    };

    const handleRemoveFriend = (friendToRemove) => {
        setFriends((prev) => prev.filter((friend) => {
            const friendId = typeof friend === 'object' ? friend.id : friend;
            const removeId = typeof friendToRemove === 'object' ? friendToRemove.id : friendToRemove;
            return friendId !== removeId;
        }));
    };

    // Handle search for users and friends
    const handleSearch = async (searchValue) => {
        if (!searchValue.trim()) {
            setSearchResults([]);
            return;
        }

        if (!user || !user.user_Id) {
            console.log("User not logged in");
            return;
        }

        const source = axios.CancelToken.source();

        try {
            const searchData = await fetchSearchData(
                searchValue, 
                "users,friends", // Search for users and friends
                user.user_Id, 
                source.token
            );
            
            console.log("Search results:", searchData);
            setSearchResults(searchData || {});
        } catch (error) {
            console.error("Error fetching search data:", error);
            setSearchResults({});
        }
    };

    // Handle input change for friend search
    const handleFriendInputChange = (e) => {
        const value = e.target.value;
        setFriendInput(value);
        handleSearch(value);
    };

    // Add selected search result to friends
    const handleSearchItemClick = (item, type) => {
        // Store both ID and display name with all necessary data
        const friendData = {
            id: item.user_id || item.userId || item.user_Id || item.id,
            name: item.name || `${item.first_name || ''} ${item.last_name || ''}`.trim(),
            email: item.email || '',
            img: item.img || null,
            type: type
        };
        
        // Check if friend is already added
        const isAlreadyAdded = friends.some(friend => 
            (typeof friend === 'object' ? friend.id : friend) === friendData.id
        );
        
        if (friendData.id && !isAlreadyAdded) {
            setFriends((prev) => [...prev, friendData]);
            setFriendInput("");
            setSearchResults({});
        }
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim()) {
            toast.error("Please enter a group name");
            return;
        }

        // Check if user data is available
        if (!user || !user.user_Id) {
            toast.error("User not logged in. Please login first.");
            return;
        }

        setIsLoading(true);
        try {
            const currentUserId = user.user_Id;
            
            const members = [
                { userId: currentUserId, role: "creator" }
            ];

            // Add friends as members
            friends.forEach(friend => {
                const friendId = typeof friend === 'object' ? friend.id : friend;
                members.push({ userId: friendId, role: "member" });
            });

            const groupData = {
                name: groupName,
                members: members
            };

            const response = await createGroup(groupData);
            
            if (response.success) {
                toast.success("Group created successfully!");
                // Reset form
                setGroupName("");
                setFriends([]);
                setFriendInput("");
                setSearchResults({});
                setIsOpen(false);
            } else {
                toast.error(response.error || "Failed to create group");
            }
        } catch (error) {
            console.error("Unexpected error creating group:", error);
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <button
                onClick={() => setIsOpen(true)}
                className=""
            >
                <img 
                    src="/create-group.svg" 
                    alt="Create Group" 
                    className="w-5 h-5"
                />
               
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="w-[661px] h-[650px] relative bg-[#f1f2f9] rounded-[18px] shadow-[0px_4px_4px_-1px_rgba(0,0,0,0.25)] overflow-hidden">
                        <div className="w-[502px] h-[493px] left-[79px] top-[104px] absolute bg-white rounded-[18px] border-4 border-[#e9e7e7]" />

                        <div
                            data-svg-wrapper
                            className="left-[596px] top-[34px] absolute cursor-pointer"
                            onClick={() => {
                                setIsOpen(false);
                                setSearchResults({});
                                setFriendInput("");
                            }}
                        >
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M26.6666 13.3335L13.3333 26.6668M26.6666 26.6668L13.3333 13.3335" stroke="#040B2B" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>

                        <div className="w-[338px] left-[166px] top-[53px] absolute text-[#040b2b] text-[40px] font-semibold font-['Poppins'] leading-[41.57px]">
                            Create a Group
                        </div>

                        <div className="left-[147px] top-[189px] absolute">
                            <svg width="67" height="67" viewBox="0 0 67 67" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5.58325 6.979H61.4166M22.3333 22.3332H44.6666M22.3333 36.2915H44.6666M10.2454 6.979V40.3953C10.2454 43.1311 11.5295 45.7273 13.735 47.3744L28.2795 58.2619C31.3783 60.579 35.6495 60.579 38.7483 58.2619L53.2928 47.3744C55.4982 45.7273 56.7824 43.1311 56.7824 40.3953V6.979H10.2454Z" stroke="#040B2B" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </div>

                        <div className="w-[303px] h-[50px] px-[26px] pt-3 pb-[13px] left-[236px] top-[189px] absolute bg-[#f1f2f9] rounded-xl inline-flex items-center">
                            <input
                                type="text"
                                placeholder="Group Name"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                className="bg-transparent outline-none text-[#61677d] text-xl font-['Poppins'] w-full"
                            />
                        </div>

                        <div className="left-[147px] top-[289px] absolute">
                            <svg width="67" height="67" viewBox="0 0 67 67" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M51.1908 56.0176C45.8072 59.1066 39.7068 60.7278 33.5 60.7188M51.1908 56.0176C51.4764 55.8536 51.7193 55.6245 51.8998 55.349C52.0802 55.0735 52.1931 54.7593 52.2293 54.4319C52.5253 51.7969 52.2615 49.1291 51.4551 46.6031C50.6486 44.0771 49.3178 41.7499 47.5497 39.7739C45.7816 37.7979 43.6161 36.2175 41.1949 35.1364C38.7738 34.0552 36.1516 33.4976 33.5 33.5V60.7188M51.1908 56.0176L50.9418 55.584M51.1908 56.0176L50.942 55.5839C50.9419 55.5839 50.9419 55.584 50.9418 55.584M33.5 60.7188C27.0652 60.7188 21.0213 59.0103 15.8092 56.0176L33.5 60.7188ZM50.9418 55.584C45.6342 58.6294 39.62 60.2276 33.5007 60.2188H33.5C27.1547 60.2188 21.1964 58.5342 16.0582 55.584C15.8408 55.4591 15.6559 55.2848 15.5185 55.0751C15.3812 54.8653 15.2952 54.6262 15.2677 54.377M50.9418 55.584C51.1592 55.4591 51.3441 55.2848 51.4815 55.0751C51.6188 54.8653 51.7048 54.6262 51.7323 54.377L51.7324 54.3761C52.0206 51.8111 51.7637 49.2141 50.9787 46.7552C50.1937 44.2963 48.8982 42.0309 47.1771 40.1073C45.4559 38.1837 43.3479 36.6454 40.9911 35.5929C38.6342 34.5405 36.0816 33.9976 33.5005 34H33.4997C30.4181 33.9983 27.3857 34.7735 24.683 36.254C22.0227 37.7114 19.7663 39.8057 18.1154 42.3486M15.2677 54.377L18.1154 42.3486M15.2677 54.377L14.7708 54.4319L15.2677 54.3775C15.2677 54.3773 15.2677 54.3771 15.2677 54.377ZM18.1154 42.3486V42.2044V42.2016H17.6154L17.6198 42.2044L18.0369 42.4706C18.0629 42.4298 18.0891 42.3892 18.1154 42.3486ZM23.5312 18.8438C23.5312 16.1999 24.5815 13.6643 26.451 11.7948C28.3205 9.92528 30.8561 8.875 33.5 8.875C36.1439 8.875 38.6795 9.92528 40.549 11.7948C42.4185 13.6643 43.4688 16.1999 43.4688 18.8438C43.4688 21.4876 42.4185 24.0232 40.549 25.8927C38.6795 27.7622 36.1439 28.8125 33.5 28.8125C30.8561 28.8125 28.3205 27.7622 26.451 25.8927C24.5815 24.0232 23.5312 21.4876 23.5312 18.8438ZM44.4688 27.2188C44.4688 25.1302 45.2984 23.1271 46.7753 21.6503C48.2521 20.1734 50.2552 19.3438 52.3438 19.3438C54.4323 19.3438 56.4354 20.1734 57.9122 21.6503C59.3891 23.1271 60.2188 25.1302 60.2188 27.2188C60.2188 29.3073 59.3891 31.3104 57.9122 32.7872C56.4354 34.2641 54.4323 35.0938 52.3438 35.0938C50.2552 35.0938 48.2521 34.2641 46.7753 32.7872C45.2984 31.3104 44.4688 29.3073 44.4688 27.2188ZM6.78125 27.2188C6.78125 25.1302 7.61094 23.1271 9.08778 21.6503C10.5646 20.1734 12.5677 19.3438 14.6562 19.3438C16.7448 19.3438 18.7479 20.1734 20.2247 21.6503C21.7016 23.1271 22.5312 25.1302 22.5312 27.2188C22.5312 29.3073 21.7016 31.3104 20.2247 32.7872C18.7479 34.2641 16.7448 35.0938 14.6562 35.0938C12.5677 35.0938 10.5646 34.2641 9.08778 32.7872C7.61094 31.3104 6.78125 29.3073 6.78125 27.2188Z" fill="white" stroke="#040B2B" />
                                <path d="M13.2343 40.3839C10.8974 44.3548 9.77063 48.9256 9.99752 53.533C8.56315 53.2811 7.15161 52.9114 5.77723 52.4277L5.77549 52.4271L5.45743 52.3165C5.45697 52.3163 5.45652 52.3162 5.45606 52.316C5.26132 52.2466 5.09079 52.1223 4.96507 51.9582C4.83905 51.7936 4.76344 51.5961 4.7474 51.3895L4.7472 51.387L4.71937 51.0503C4.71936 51.0501 4.71934 51.0499 4.71933 51.0497C4.61203 49.7153 4.7746 48.373 5.19735 47.1028C5.62015 45.8324 6.29453 44.6602 7.18025 43.6561C8.06597 42.652 9.14488 41.8367 10.3526 41.2587C11.265 40.822 12.2368 40.5276 13.2343 40.3839ZM62.2528 51.387L62.2526 51.3885C62.2362 51.5948 62.1605 51.792 62.0345 51.9561C61.9088 52.1199 61.7385 52.2439 61.544 52.3132C61.5436 52.3133 61.5431 52.3135 61.5426 52.3137L61.2245 52.4243L61.2224 52.425C59.86 52.9056 58.4515 53.2786 57.0024 53.5331C57.2293 48.9257 56.1026 44.3548 53.7657 40.3839C54.7631 40.5276 55.735 40.822 56.6474 41.2587C57.8551 41.8367 58.934 42.652 59.8197 43.6561C60.7054 44.6602 61.3798 45.8324 61.8026 47.1028C62.2253 48.3729 62.3879 49.7153 62.2806 51.0496C62.2806 51.0498 62.2806 51.05 62.2806 51.0503L62.2528 51.387Z" fill="white" stroke="#040B2B" />
                            </svg>
                        </div>

                        <form
                            onSubmit={handleAddFriend}
                            className="w-[303px] h-[50px] px-[26px] pt-3 pb-[13px] left-[236px] top-[289px] absolute bg-[#f1f2f9] rounded-xl inline-flex items-center gap-2"
                        >
                            <input
                                type="text"
                                placeholder="Search and Add Friends"
                                value={friendInput}
                                onChange={handleFriendInputChange}
                                className="bg-transparent outline-none text-[#61677d] text-xl font-['Poppins'] flex-1"
                            />
                        </form>

                        {/* Search Results Dropdown */}
                        {friendInput && (searchResults.friends?.length > 0 || searchResults.users?.length > 0) && (
                            <div className="w-[303px] left-[236px] top-[345px] absolute bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-y-auto z-50">
                                <SearchResults
                                    searchData={searchResults}
                                    onItemClick={handleSearchItemClick}
                                />
                            </div>
                        )}

                        {friends.map((friend, i) => (
                            <div
                                key={i}
                                className="w-[232px] h-[37px] left-[236px] absolute bg-white rounded-2xl shadow-md flex items-center justify-between px-4"
                                style={{ top: `${395 + i * 45}px` }}
                            >
                                <div className="text-[#61677d] text-base font-normal font-['Poppins'] leading-[24.94px]">
                                    {typeof friend === 'object' ? friend.name : friend}
                                </div>
                                <div
                                    className="cursor-pointer border border-[#A00C0C] rounded-full p-1"
                                    onClick={() => handleRemoveFriend(friend)}
                                >
                                    <svg
                                        width="12"
                                        height="12"
                                        viewBox="0 0 12 12"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M8 4L4 8M4 4L8 8"
                                            stroke="#A00C0C"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                            </div>
                        ))}

                        <div
                            className="w-[115px] h-[42px] left-[423px] top-[509px] absolute cursor-pointer"
                            onClick={handleCreateGroup}
                        >
                            <div className="w-[115px] h-[42px] px-[24.94px] py-[18.71px] left-0 top-0 absolute bg-[#040b2b] rounded-lg justify-center items-center gap-[16.63px] inline-flex">
                                <div className="text-white text-xl font-medium font-['Poppins'] leading-[24.94px]">
                                    {isLoading ? "Creating..." : "Create"}
                                </div>
                                {!isLoading && (
                                    <svg width="9" height="14" viewBox="0 0 9 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5.36325 7L-0.00341797 1.63333L1.62992 0L8.62992 7L1.62992 14L-0.00341797 12.3667L5.36325 7Z" fill="#FEF7FF" />
                                    </svg>
                                )}
                            </div>
                        </div>

                       
                    </div>
                </div>
            )}
        </div>
    );
}
