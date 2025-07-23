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

    // Transform data with proper images and names
    const transformedFriends = friends.map(friend => ({
        ...friend,
        name: friend.name || `${friend.first_name || ''} ${friend.last_name || ''}`.trim() || friend.email || 'Unknown Friend',
        img: friend.img || DEFAULT_IMAGES.friend
    }));

    const transformedGroups = groups.map(group => ({
        ...group,
        name: group.name || 'Unknown Group',
        img: group.img || DEFAULT_IMAGES.group
    }));

    const transformedUsers = users.map(user => ({
        ...user,
        name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || 'Unknown User',
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
        <div className="max-h-64 overflow-y-auto">
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
        </div>
    );
}

// Reusable Section Component with click handling
const Section = ({ title, data, type, onItemClick }) => (
    <>
        <div className="flex items-center justify-between px-4 py-2 sticky top-0 bg-white border-b border-gray-100">
            <span className="text-gray-600 font-medium text-sm">{title}</span>
        </div>
        {data.map((item, index) => (
            <div 
                key={item.user_id || item.userId || item.user_Id || item.group_Id || item.groupId || item.id || `${type}-${index}`} 
                onClick={() => onItemClick(item, type)} 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
            >
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