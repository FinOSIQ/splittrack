import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import axios from "axios";
import { PlusIcon, CurrencyDollarIcon, UserGroupIcon,UserPlusIcon } from "@heroicons/react/24/solid";
import { Card } from "@material-tailwind/react";
import SearchResults from "./SearchResults";
import { fetchSearchData } from "../utils/requests/expense";
import { useUser } from "../contexts/UserContext";

// Constants
const SEARCH_DEBOUNCE_MS = 300;
const MIN_SEARCH_LENGTH = 2;
const MENU_RADIUS = 90;
const MENU_ANGLES = [180, 225, 270];
const INITIAL_SEARCH_STATE = { users: [], friends: [], groups: [] };

export default function MobileOverlay() {
    const { user } = useUser();
    const navigate = useNavigate();
    
    // UI State
    const [isOpen, setIsOpen] = useState(false);
    
    // Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState(INITIAL_SEARCH_STATE);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);

    // Refs
    const menuRef = useRef([]);
    const overlayRef = useRef(null);
    const plusIconRef = useRef(null);
    const searchRef = useRef(null);
    const cancelTokenRef = useRef(null);

    // Memoized values
    const trimmedQuery = useMemo(() => searchQuery.trim(), [searchQuery]);
    const hasResults = useMemo(() => 
        searchResults.users.length > 0 || 
        searchResults.friends.length > 0 || 
        searchResults.groups.length > 0
    , [searchResults]);

    // Utility functions
    const resetSearchState = useCallback(() => {
        setSearchQuery("");
        setSearchResults(INITIAL_SEARCH_STATE);
        setSearchError(null);
        setHasSearched(false);
    }, []);

    const animatePlusIcon = useCallback((rotation) => {
        gsap.to(plusIconRef.current, {
            rotation,
            duration: 0.05,
            ease: "power2.out",
        });
    }, []);

    const transformSearchResults = useCallback((results) => ({
        users: (results.users || []).map(user => ({
            name: user.first_name || 'Unknown User',
            email: user.email || '',
            user_id: user.user_id
        })),
        friends: (results.friends || []).map(friend => ({
            name: friend.first_name || 'Unknown Friend',
            email: friend.email || '',
            user_id: friend.user_id
        })),
        groups: (results.groups || []).map(group => ({
            name: group.name || 'Unknown Group',
            email: `Group ID: ${group.group_Id}`,
            group_id: group.group_Id
        }))
    }), []);

    // Search functionality with debouncing
    useEffect(() => {
        const performSearch = async () => {
            if (trimmedQuery.length === 0) {
                setSearchResults(INITIAL_SEARCH_STATE);
                setSearchError(null);
                setHasSearched(false);
                return;
            }

            if (trimmedQuery.length < MIN_SEARCH_LENGTH) {
                setHasSearched(false);
                return;
            }

            try {
                setIsSearching(true);
                setSearchError(null);
                setHasSearched(false);

                // Cancel previous request if it exists
                if (cancelTokenRef.current) {
                    cancelTokenRef.current.cancel("Operation canceled due to new request.");
                }

                // Create new cancel token
                cancelTokenRef.current = axios.CancelToken.source();

                // Get current user ID from context
                const userId = user?.user_Id || "";

                // Fetch search results
                const results = await fetchSearchData(
                    trimmedQuery,
                    'users,friends,groups',
                    userId,
                    cancelTokenRef.current.token
                );

                if (results && !axios.isCancel(results)) {
                    const transformedResults = transformSearchResults(results);
                    setSearchResults(transformedResults);
                    setHasSearched(true);
                }
            } catch (error) {
                if (!axios.isCancel(error)) {
                    console.error("Search error:", error);
                    setSearchError("Failed to search. Please try again.");
                    setSearchResults(INITIAL_SEARCH_STATE);
                    setHasSearched(true);
                }
            } finally {
                setIsSearching(false);
            }
        };

        // Debounce search
        const debounceTimer = setTimeout(performSearch, SEARCH_DEBOUNCE_MS);

        return () => {
            clearTimeout(debounceTimer);
        };
    }, [trimmedQuery, user?.user_Id, transformSearchResults]);

    // Cleanup function to cancel ongoing requests
    useEffect(() => {
        return () => {
            if (cancelTokenRef.current) {
                cancelTokenRef.current.cancel("Component unmounting");
            }
        };
    }, []);

    // Handle search result item click
    const handleSearchItemClick = useCallback((item, type) => {
        console.log(`Clicked ${type}:`, item);

        // Close overlay and reset state
        setIsOpen(false);
        resetSearchState();
        animatePlusIcon(0);

        // Navigation logic
        switch (type) {
            case 'user':
                console.log('Navigate to user:', item.user_id);
                break;
            case 'friend':
                navigate(`/friend/${item.user_id}`);
                break;
            case 'group':
                navigate(`/group/${item.group_id}`);
                break;
            default:
                console.log('Unknown type:', type);
        }
    }, [resetSearchState, animatePlusIcon]);

    // Handle plus button click
    const handlePlusClick = useCallback(() => {
        const newIsOpen = !isOpen;
        setIsOpen(newIsOpen);
        animatePlusIcon(newIsOpen ? 45 : 0);
    }, [isOpen, animatePlusIcon]);

    // Handle overlay background click
    const handleOverlayClick = useCallback(() => {
        setIsOpen(false);
        animatePlusIcon(0);
    }, [animatePlusIcon]);

    // Navigation handlers
    const handleNavigation = useCallback((path) => {
        setIsOpen(false); // Close the floating menu
        animatePlusIcon(0); // Reset plus icon
        navigate(path); // Navigate to the specified path
    }, [animatePlusIcon, navigate]);

    // Menu items configuration with navigation
    const menuItems = useMemo(() => [
        {
            Icon: CurrencyDollarIcon,
            path: "/settleup",
            label: "Settle Ups"
        },
        {
            Icon: UserGroupIcon,
            path: "/allfriends",
            label: "Friends"
        },
        {
            Icon: UserPlusIcon,
            path: "/home",
            label: "Home"
        }
    ], []);


    useEffect(() => {
        if (isOpen) {
            gsap.to(menuRef.current, {
                opacity: 1,
                scale: 1,
                duration: 0.3,
                ease: "power2.out",
                stagger: 0.1,
            });

            // Circular arc positions (3 buttons)
            MENU_ANGLES.forEach((angle, index) => {
                const radians = (angle * Math.PI) / 180;
                const x = Math.cos(radians) * MENU_RADIUS - 35;
                const y = Math.sin(radians) * MENU_RADIUS - 50;

                gsap.to(menuRef.current[index], {
                    x,
                    y,
                    duration: 0.4,
                    ease: "power2.out",
                    delay: index * 0.1,
                });
            });

            gsap.to(overlayRef.current, { opacity: 0.5, duration: 0.3, pointerEvents: "auto" });

            // Show search bar
            gsap.to(searchRef.current, {
                opacity: 1,
                y: 0,
                duration: 0.3,
                ease: "power2.out",
            });
        } else {
            gsap.to(menuRef.current, { opacity: 0, scale: 0.5, duration: 0.2 });
            gsap.to(menuRef.current, { x: 0, y: 0, duration: 0.2 });
            gsap.to(overlayRef.current, { opacity: 0, duration: 0.2, pointerEvents: "none" });

            // Hide search bar
            gsap.to(searchRef.current, {
                opacity: 0,
                y: -20,
                duration: 0.2,
                ease: "power2.in",
            });

            resetSearchState();
        }
    }, [isOpen, resetSearchState]);

    // Render search results content
    const renderSearchContent = useMemo(() => {
        if (searchError) {
            return (
                <div className="p-4 text-center text-red-600">
                    {searchError}
                </div>
            );
        }

        if (trimmedQuery.length < MIN_SEARCH_LENGTH) {
            return (
                <div className="p-4 text-center text-gray-500">
                    Type at least {MIN_SEARCH_LENGTH} characters to search...
                </div>
            );
        }

        if (isSearching) {
            return (
                <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    Searching...
                </div>
            );
        }

        if (hasSearched && !hasResults) {
            return (
                <div className="p-4 text-center text-gray-500">
                    No results found for "{trimmedQuery}"
                </div>
            );
        }

        if (hasSearched && hasResults) {
            console.log("Search Results:", searchResults);
            
            return (
                <SearchResults
                    searchData={searchResults}
                    onItemClick={handleSearchItemClick}
                />
            );
        }

        return null;
    }, [searchError, trimmedQuery, isSearching, hasSearched, hasResults, searchResults, handleSearchItemClick]);

    // Optimized ref setter for menu items
    const setMenuRef = useCallback((el, index) => {
        if (el && !menuRef.current[index]) {
            menuRef.current[index] = el;
        }
    }, []);

    return (
        <div className="fixed bottom-5 right-5 z-40">
            {/* Background Overlay */}
            <div
                ref={overlayRef}
                className="fixed inset-0 bg-black opacity-0 transition-opacity"
                onClick={handleOverlayClick}
            />
            {/* Search Bar */}
            <div ref={searchRef} className="fixed top-5 left-1/2 transform -translate-x-1/2 w-full opacity-0 z-50">
                <div>
                    <div className="mx-4 bg-[#f1f2f9] rounded-lg flex items-center px-4 border border-gray-300 focus-within:border-blue-500 mt-6 h-10 shadow-md">
                        {/* Search Icon */}
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"></path>
                            <circle cx="10" cy="10" r="7"></circle>
                        </svg>

                        {/* Search Input */}
                        <input
                            type="text"
                            placeholder="Search Users, Friends, Groups..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent outline-none text-gray-900 placeholder-gray-500 text-sm pl-2"
                        />

                        {/* Loading indicator */}
                        {isSearching && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 ml-2"></div>
                        )}
                    </div>

                    {/* Search Results Card */}
                    {(trimmedQuery.length > 0 || searchError) && (
                        <Card className="mx-4 mt-4 bg-[#f1f2f9] z-50 relative">
                            {renderSearchContent}
                        </Card>
                    )}
                </div>
            </div>

            {/* Floating Action Button & Menu */}
            <div className="relative">
                {/* Action Buttons */}
                <div className="absolute bottom-0 right-0 flex flex-col items-center">
                    {menuItems.map(({ Icon, path, label }, index) => (
                        <button
                            key={index}
                            ref={(el) => setMenuRef(el, index)}
                            onClick={() => handleNavigation(path)}
                            className="w-12 h-12 rounded-full bg-white text-gray-700 flex items-center justify-center shadow-md opacity-0 scale-50 absolute hover:bg-gray-50 transition-colors"
                            title={label}
                        >
                            <Icon className="w-6 h-6" />
                        </button>
                    ))}
                </div>

                {/* Floating Action Button */}
                <button
                    className="w-14 h-14 rounded-full bg-[#040b2b] text-white flex items-center justify-center shadow-lg z-40"
                    onClick={handlePlusClick}
                >
                    <PlusIcon
                        ref={plusIconRef}
                        className="w-8 h-8 transition-transform duration-300"
                    />
                </button>
            </div>
        </div>
    );
}
