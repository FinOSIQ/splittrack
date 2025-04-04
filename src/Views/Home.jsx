import React, { useEffect, useState } from 'react';
import GroupCard from '../Components/GroupCard';
import HeaderProfile from '../Components/HeaderProfile';
import CreateGroupModal from '../Components/CreateGroup';
import YourBalanceCard from '../Components/YourBalanceCard';
import AddExpensePopup from '../Components/AddExpensePopup';
import { Input } from "@material-tailwind/react";
import MobileOverlay from '../Components/MobileOverlay';
import { QRCodeSVG } from 'qrcode.react';
import DatePicker from '../Components/DatePicker';
import DatePickerTest from '../Components/DatePickerTest';
import NavBar from '../Components/NavBar';  




const Home = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.matchMedia("(max-width: 768px)").matches);
        };

        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);

        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    return (
        <div>
        <NavBar />
            <HeaderProfile />
            <YourBalanceCard />
            <AddExpensePopup />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <GroupCard />
                <GroupCard />
                <GroupCard />

                <GroupCard />
                <GroupCard />
                <GroupCard />

                {isMobile && <MobileOverlay />}
            </div>
        </div>
    );
};

export default Home;
