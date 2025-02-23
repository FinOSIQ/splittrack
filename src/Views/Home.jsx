import React from 'react';
import GroupCard from '../Components/GroupCard';
import HeaderProfile from '../Components/HeaderProfile';
import CreateGroupModal from '../Components/CreateGroup';

const Home = () => {
    return (
        
    <div>
    <HeaderProfile />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <GroupCard />
            <GroupCard />
            <GroupCard/>

            <GroupCard />
            <GroupCard />
            <GroupCard/>    
        </div>
        <CreateGroupModal />
    </div>
    );
};

export default Home;
