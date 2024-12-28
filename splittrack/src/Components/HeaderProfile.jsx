import React from 'react';

const HeaderProfile = () => {
    return (
        <div className="w-full h-[145px] fixed top-0 left-0 flex  justify-between bg-[#f7f7f7] px-8 shadow-md z-50">
    
            <img className="w-[504px] h-[145px] left-0 top-0 absolute" src="https://via.placeholder.com/504x145" alt="Placeholder" />
            <div className="w-[98px] h-[18px] left-[1086px] top-[71px] absolute text-[#5c5470] text-sm font-normal font-['Inter']">Good Morning,</div>
            <img className="w-[60px] h-[61px] left-[1192px] top-[58px] absolute" src="https://via.placeholder.com/60x61" alt="Profile" />
        </div>
    );
};

export default HeaderProfile;
