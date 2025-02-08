import React from 'react';

export default function HeaderProfile() {
    return (
        <div className="w-full h-28  flex justify-between items-center bg-[#f7f7f7] px-8">
            <img className="h-24" src="/SplitTrack Logo.svg" alt="Placeholder" />
            <div className="flex items-center space-x-4">
                <div className="text-right">
                    <div className="text-[#5c5470] text-sm font-normal font-['Inter']">Good Morning,</div>
                    <div className="text-[#040b2b] text-2xl font-bold font-['Inter']">Jason</div>
                </div>
                <img className="w-[60px] h-[61px]" src="https://placehold.co/60x61" alt="Profile" />{/* Placeholder image TODO: Add a proper icon */}
            </div>
        </div>
    );
};

