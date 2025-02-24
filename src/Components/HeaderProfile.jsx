import React from 'react';

export default function HeaderProfile() {
    return (
        <div className="w-full h-28  flex justify-between items-center md:bg-[#f7f7f7] md:px-8 px-2">
            <img className="h-16 md:h-16 lg:h-24" src="/SplitTrack Logo.svg" alt="Placeholder" />

            <div className="md:flex items-center space-x-4 hidden">
                <div className="text-right">
                    <div className="text-[#5c5470] text-sm font-normal font-['Inter']">Good Morning,</div>
                    <div className="text-[#040b2b] text-2xl font-bold font-['Inter']">Jason</div>
                </div>
                <img className="w-[60px] h-[61px]" src="https://placehold.co/60x61" alt="Profile" />{/* Placeholder image TODO: Add a proper icon */}
            </div>

            <div className="md:hidden mr-2">
                <div className="relative w-[41px] h-[41px] rounded-full bg-[#F1F2F9] flex items-center justify-center">
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M3.75 6.75H20.25M3.75 12H20.25M3.75 17.25H20.25"
                            stroke="black"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            </div>

        </div>
    );
};

