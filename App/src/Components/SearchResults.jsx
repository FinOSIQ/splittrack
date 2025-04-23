import React from 'react';
import { List } from '@material-tailwind/react';
import UserCard from './UserCard';

// Optimized SearchResults Component
export default function SearchResults({ searchData = {} }) {
    // Default empty arrays to prevent errors and improve performance
    const friends = searchData.friends || [];
    const groups = searchData.groups || [];
    const users = searchData.users || [];

    return (
        <List>
            {/* Friends Section (Only render if there are friends) */}
            {friends.length > 0 && <Section title="Friends" data={friends} />}

            {/* Groups Section */}
            {groups.length > 0 && <Section title="Groups" data={groups} />}

            {/* Users Section */}
            {users.length > 0 && <Section title="Users" data={users} />}
        </List>
    );
}

// Reusable Section Component
const Section = ({ title, data }) => (
    <>
        <div className="flex items-center justify-between px-4 py-2">
            <span className="text-gray-600 font-medium -mt-1.5">{title}</span>
            <hr className="flex-1 ml-4 border-gray-300" />
        </div>
        {data.map((item, index) => (
            <UserCard key={index} img={item.img} name={item.name} email={item.email} styles='ml-1' />
        ))}
    </>
);
