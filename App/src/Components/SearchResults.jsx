import React from 'react';
import { List } from '@material-tailwind/react';
import UserCard from './UserCard';

// Optimized SearchResults Component with click handling
export default function SearchResults({ searchData = {}, onItemClick }) {
    // Default empty arrays to prevent errors and improve performance
    const friends = searchData.friends || [];
    const groups = searchData.groups || [];
    const users = searchData.users || [];

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
            {friends.length > 0 && (
                <Section 
                    title="Friends" 
                    data={friends} 
                    type="friend"
                    onItemClick={handleItemClick} 
                />
            )}

            {/* Groups Section */}
            {groups.length > 0 && (
                <Section 
                    title="Groups" 
                    data={groups} 
                    type="group"
                    onItemClick={handleItemClick} 
                />
            )}

            {/* Users Section */}
            {users.length > 0 && (
                <Section 
                    title="Users" 
                    data={users} 
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
            <div key={item.user_id || item.group_id || index} onClick={() => onItemClick(item, type)} className="cursor-pointer">
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