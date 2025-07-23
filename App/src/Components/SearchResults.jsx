import React from 'react';
import { List } from '@material-tailwind/react';
import UserCard from './UserCard';

// Default images for search results
const DEFAULT_IMAGES = {
    user: 'https://docs.material-tailwind.com/img/face-1.jpg',
    friend: 'https://docs.material-tailwind.com/img/face-2.jpg',
    group: 'https://docs.material-tailwind.com/img/face-3.jpg'
};

// Optimized SearchResults Component with click handling
export default function SearchResults({ searchData = {}, onItemClick }) {
    // Default empty arrays to prevent errors and improve performance
    const friends = searchData.friends || [];
    const groups = searchData.groups || [];
    const users = searchData.users || [];

    // Transform data with proper images
    const transformedFriends = friends.map(friend => ({
        ...friend,
        img: friend.img || DEFAULT_IMAGES.friend
    }));

    const transformedGroups = groups.map(group => ({
        ...group,
        img: group.img || DEFAULT_IMAGES.group
    }));

    const transformedUsers = users.map(user => ({
        ...user,
        img: user.img || DEFAULT_IMAGES.user
    }));

    // Handle item click and pass data to parent
    const handleItemClick = (item, type) => {
        // Call the parent's onItemClick function with the item and its type
        if (onItemClick) {
            onItemClick(item, type);
        }
    };

    return (
        <List>
            {/* Friends Section (Only render if there are friends) */}
            {transformedFriends.length > 0 && (
                <Section 
                    title="Friends" 
                    data={transformedFriends} 
                    type="friend"
                    onItemClick={handleItemClick} 
                />
            )}

            {/* Groups Section */}
            {transformedGroups.length > 0 && (
                <Section 
                    title="Groups" 
                    data={transformedGroups} 
                    type="group"
                    onItemClick={handleItemClick} 
                />
            )}

            {/* Users Section */}
            {transformedUsers.length > 0 && (
                <Section 
                    title="Users" 
                    data={transformedUsers} 
                    type="user"
                    onItemClick={handleItemClick} 
                />
            )}
        </List>
    );
}

// Reusable Section Component with click handling
const Section = ({ title, data, type, onItemClick }) => (
    <>
        <div className="flex items-center justify-between px-4 py-2">
            <span className="text-gray-600 font-medium -mt-1.5">{title}</span>
            <hr className="flex-1 ml-4 border-gray-300" />
        </div>
        {data.map((item, index) => (
            <div key={item.user_id || item.group_Id || index} onClick={() => onItemClick(item, type)} className="cursor-pointer">
                <UserCard 
                    img={item.img} 
                    name={item.name} 
                    email={item.email} 
                    styles='ml-1' 
                />
            </div>
        ))}
    </>
);