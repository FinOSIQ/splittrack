import React, { useState } from "react";
import { Input } from "@material-tailwind/react";
import { toast } from "sonner";
import { useUserData } from "../hooks/useUserData";
import { fetchSearchData } from "../utils/requests/expense";
import { updateGroup, getGroupDetails } from "../utils/requests/Group";
import axios from "axios";
import SearchResults from "./SearchResults";

export default function AddGroupMemberModal({ isOpen, onClose, groupId, groupName, onMemberAdded }) {
    const [friendInput, setFriendInput] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    
    // Get user data from hook
    const { user, loading: userLoading } = useUserData();

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
                "friends", // Search for friends only
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

    // Handle input change for member search
    const handleMemberInputChange = (e) => {
        const value = e.target.value;
        setFriendInput(value);
        handleSearch(value);
    };

    // Add selected search result to members
    const handleSearchItemClick = (item, type) => {
        // Store both ID and display name with all necessary data
        const memberData = {
            id: item.user_id || item.userId || item.user_Id || item.id,
            name: item.name || `${item.first_name || ''} ${item.last_name || ''}`.trim(),
            email: item.email || '',
            img: item.img || null,
            type: type
        };
        
        // Check if member is already selected
        const isAlreadySelected = selectedMembers.some(member => 
            (typeof member === 'object' ? member.id : member) === memberData.id
        );
        
        if (memberData.id && !isAlreadySelected) {
            setSelectedMembers((prev) => [...prev, memberData]);
            setFriendInput("");
            setSearchResults({});
        }
    };

    const handleRemoveMember = (memberToRemove) => {
        setSelectedMembers((prev) => prev.filter((member) => {
            const memberId = typeof member === 'object' ? member.id : member;
            const removeId = typeof memberToRemove === 'object' ? memberToRemove.id : memberToRemove;
            return memberId !== removeId;
        }));
    };

    const handleAddMembers = async () => {
        if (selectedMembers.length === 0) {
            toast.error("Please select at least one member to add");
            return;
        }

        // Check if user data is available
        if (!user || !user.user_Id) {
            toast.error("User not logged in. Please login first.");
            return;
        }

        setIsLoading(true);
        try {
            // First, get current group details to get existing members
            const currentGroupDetails = await getGroupDetails(groupId);
            
            if (!currentGroupDetails?.group?.groupMembers) {
                toast.error("Failed to get current group details");
                return;
            }

            // Get current members
            const currentMembers = currentGroupDetails.group.groupMembers.map(member => ({
                userId: member.userUser_Id || member.user?.user_Id,
                role: member.member_role || 'member'
            }));

            // Prepare new members to add
            const membersToAdd = selectedMembers.map(member => ({
                userId: typeof member === 'object' ? member.id : member,
                role: "member"
            }));

            // Combine current members with new members
            const allMembers = [...currentMembers, ...membersToAdd];

            // Prepare update data
            const updateData = {
                name: currentGroupDetails.group.name, // Keep current name
                members: allMembers
            };

            console.log('Adding members with data:', updateData);
            
            // Call the API to update group with new members
            const response = await updateGroup(groupId, updateData);
            
            if (response.success) {
                toast.success(`Successfully added ${selectedMembers.length} member(s) to ${groupName}!`);
                
                // Reset form and close modal
                setSelectedMembers([]);
                setFriendInput("");
                setSearchResults({});
                
                // Notify parent component about the addition
                if (onMemberAdded) {
                    onMemberAdded(selectedMembers);
                }
                
                onClose();
            } else {
                toast.error(response.error || "Failed to add members to group");
            }
        } catch (error) {
            console.error("Error adding members:", error);
            toast.error("Failed to add members to group");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedMembers([]);
        setFriendInput("");
        setSearchResults({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="w-96 max-w-[90vw] bg-white p-6 rounded-2xl shadow-lg relative overflow-visible">
                <button
                    onClick={handleClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors"
                >
                    ✖
                </button>

                <div className="relative">
                    {/* Header */}
                    <div className="text-left mt-16 mb-2 text-[#040b2b] text-[32px] font-semibold font-['Poppins'] leading-[41.57px]">
                        Add Members
                    </div>
                    
                    {/* Group name subtitle */}
                    <div className="text-left mb-6 text-[#61677d] text-sm font-normal font-['Poppins']">
                        to {groupName}
                    </div>

                    {/* Search Members */}
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
                        <div className="flex-1">
                            <Input
                                variant="standard"
                                label="Search Friends"
                                placeholder="Search friends to add"
                                value={friendInput}
                                onChange={handleMemberInputChange}
                                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                                labelProps={{
                                    className: "before:content-none after:content-none",
                                }}
                            />
                        </div>
                    </div>

                    {/* Search Results and Selected Members Container */}
                    <div className="w-full flex flex-col text-left mt-4 relative">

                        {/* Display selected members as blue pills */}
                        {selectedMembers.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                                {selectedMembers.map((member, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-800 rounded-full text-xs border border-blue-200 hover:bg-blue-100 transition-colors"
                                    >
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="7" r="4" />
                                            <path d="M5.5 20C5.5 16.9624 7.96243 14.5 11 14.5H13C16.0376 14.5 18.5 16.9624 18.5 20" />
                                        </svg>
                                        <span>
                                            {typeof member === 'object' ? member.name : member}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveMember(member);
                                            }}
                                            className="ml-1 text-blue-600 hover:text-blue-800 transition-colors"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Search Results Dropdown */}
                        {friendInput && (searchResults.friends?.length > 0) && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white shadow-lg rounded-md overflow-hidden z-50 border border-gray-200">
                                <SearchResults
                                    searchData={searchResults}
                                    onItemClick={handleSearchItemClick}
                                    showAddFriendButton={false}
                                />
                            </div>
                        )}

                        {/* No results message */}
                        {friendInput && searchResults && 
                         (!searchResults.friends || searchResults.friends.length === 0) && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white shadow-lg rounded-md border border-gray-200 p-4 text-center text-gray-500 text-sm">
                                No friends found for "{friendInput}"
                            </div>
                        )}
                    </div>

                    {/* Selected count and action buttons */}
                    <div className="flex items-center justify-between mt-8 pt-4">
                        <div className="text-sm text-[#61677d] font-normal font-['Poppins']">
                            {selectedMembers.length > 0 && (
                                `${selectedMembers.length} member${selectedMembers.length > 1 ? 's' : ''} selected`
                            )}
                        </div>
                        
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleAddMembers}
                                disabled={isLoading || selectedMembers.length === 0}
                                className="px-6 py-2 bg-[#040b2b] text-white rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed  hover:bg-[#0a1654] transition-colors font-medium"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        Add 
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
        </div>
    );
}
