import React from 'react';
import GroupCard from '../Components/GroupCard';
import HeaderProfile from '../Components/HeaderProfile';
import CreateGroupModal from '../Components/CreateGroup';
import YourBalanceCard from '../Components/YourBalanceCard';
import AddExpensePopup from '../Components/AddExpensePopup';
import { Input } from "@material-tailwind/react";


const Home = () => {
    return (
        
    <div>
    <HeaderProfile />
        <YourBalanceCard />
        <AddExpensePopup />
        <div className="flex w-72 flex-col gap-6">
            <Input variant="static" label="Static" placeholder="Static" />
            <Input variant="standard" label="Standard" placeholder="Standard"/>
            <Input variant="outlined" label="Outlined" placeholder="Outlined"/>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <GroupCard />
            <GroupCard />
            <GroupCard/>

            <GroupCard />
            <GroupCard />
            <GroupCard/>    
        </div>
        {/* <CreateGroupModal /> */}
    </div>
    );
};

export default Home;
