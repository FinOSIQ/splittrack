import React from 'react';
import { ListItem, ListItemPrefix, Avatar, Typography } from '@material-tailwind/react';

export default function UserCard({ img, name, email,styles }) {
    return (
        <ListItem>
            <div className={`flex items-center space-x-4 -my-1 ${styles}`}>
                <img src={img} alt={name} className="w-8 h-8 rounded-full" />
                <div>
                    <p className="text-sm font-normal leading-normal text-gray-900">{name}</p>
                    <p className="text-xs text-gray-500">{email}</p>
                </div>
            </div>
        </ListItem>
    );
};

