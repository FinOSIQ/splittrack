import React, { useState } from "react";
import { Input } from "@material-tailwind/react";
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
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
                    <div className="w-96 bg-white p-6 rounded-2xl shadow-lg relative overflow-visible">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                setSearchResults({});
                                setFriendInput("");
                            }}
                            className="absolute top-3 right-3 text-gray-500"
                        >
                            ✖
                        </button>

                        <div className="relative">
                            {/* Header */}
                            <div className="text-left mt-16 mb-4 text-[#040b2b] text-[32px] font-semibold font-['Poppins'] leading-[41.57px]">
                                Create a Group
                            </div>

                            {/* Group Name */}
                            <div className="mt-8 flex items-center space-x-4">
                                <svg
                                    width="38"
                                    height="38"
                                    viewBox="0 0 38 38"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M3.1676 3.95825H34.8343M12.6676 12.6666H25.3343M12.6676 20.5833H25.3343M5.81179 3.95825V22.9108C5.81179 24.4624 6.54012 25.9349 7.79096 26.8691L16.0401 33.0441C17.7976 34.3582 20.2201 34.3582 21.9776 33.0441L30.2268 26.8691C31.4776 25.9349 32.2059 24.4624 32.2059 22.9108V3.95825H5.81179Z"
                                        stroke="#040B2B"
                                        strokeWidth="1.5"
                                        strokeMiterlimit="10"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="h-6 border-l border-gray-400"></div>
                                <Input
                                    variant="standard"
                                    label="Group Name"
                                    placeholder="Family, Work Trip, etc.."
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                />
                            </div>

                            {/* Add Friends */}
                            <div className="mt-8 flex items-center space-x-4">
                                <svg
                                    width="36"
                                    height="36"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path 
                                        d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" 
                                        stroke="#040B2B" 
                                        strokeWidth="1.5" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                    />
                                    <circle 
                                        cx="8.5" 
                                        cy="7" 
                                        r="4" 
                                        stroke="#040B2B" 
                                        strokeWidth="1.5"
                                    />
                                    <path 
                                        d="M20 8V14M23 11H17" 
                                        stroke="#040B2B" 
                                        strokeWidth="1.5" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                <div className="h-6 border-l border-gray-400"></div>
                                <Input
                                    variant="standard"
                                    label="Add Friends"
                                    placeholder="Search and Add Friends"
                                    value={friendInput}
                                    onChange={handleFriendInputChange}
                                />
                            </div>

                            {/* Search Results and Friend Pills Container */}
                            <div className="flex w-72 flex-col gap-6 text-left mt-0 -mb-4 relative">

                                {/* Display selected friends as blue pills like in expense */}
                                {friends.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {friends.map((friend, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center gap-1 px-1 py-0.5 bg-blue-50 text-blue-800 rounded-full text-xs border border-blue-200"
                                            >
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <circle cx="12" cy="7" r="4" />
                                                    <path d="M5.5 20C5.5 16.9624 7.96243 14.5 11 14.5H13C16.0376 14.5 18.5 16.9624 18.5 20" />
                                                </svg>
                                                <span>{typeof friend === 'object' ? friend.name : friend}</span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveFriend(friend);
                                                    }}
                                                    className="ml-1 text-blue-600 hover:text-blue-800"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Search Results Dropdown */}
                                {friendInput && (searchResults.friends?.length > 0 || searchResults.users?.length > 0) && (
                                    <div className="absolute top-12 left-0 right-0 mt-1 bg-white shadow-lg rounded-md overflow-y-auto z-50 border border-gray-200">
                                        <SearchResults
                                            searchData={searchResults}
                                            onItemClick={handleSearchItemClick}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Create Button */}
                            <div className="flex items-center justify-end mt-12">
                                <button
                                    type="button"
                                    onClick={handleCreateGroup}
                                    disabled={isLoading}
                                    className="px-6 py-2 bg-[#040b2b] text-white rounded-lg flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed min-w-[120px]"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            Create
                                            <svg
                                                width="8"
                                                height="12"
                                                viewBox="0 0 8 12"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path d="M4.7134 6L0.113403 1.4L1.5134 0L7.5134 6L1.5134 12L0.113403 10.6L4.7134 6Z" fill="#FEF7FF" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}