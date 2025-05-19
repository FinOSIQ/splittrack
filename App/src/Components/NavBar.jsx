import React from 'react';
import { Link } from 'react-router-dom';
import LogoutButton from "./LogoutButton";

import settleImg from '../images/settle.png';
import cgroupImg from '../images/cgroup.png';
import addExpenseImg from '../images/addexpense.png';
import addImg from '../images/add.png';
import activityImg from '../images/activity.png';
import AddExpensePopup from './AddExpensePopup';

const NavBar = () => {
  return (
    <>
      
      
      <div className="fixed top-0 h-screen w-14 bg-[#f1f2f9] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] border-r flex flex-col py-4 ">

        <div className="grid grid-rows-7 flex-grow items-center justify-items-center">
          <div></div>

          <Link to="/settle" className="w-7 h-7 mr-7">
            <img src={settleImg} alt="Settle" />
          </Link>

          <Link to="/cgroup" className="w-7 h-7 mr-7">
            <img src={cgroupImg} alt="Cgroup" />
          </Link>

          <div>
            <AddExpensePopup />
            
          </div>

          <Link to="/add" className="w-7 h-7 mr-7">
            <img src={addImg} alt="Add" />
          </Link>

          <Link to="/activity" className="w-7 h-7 mr-9">
            <img src={activityImg} alt="Activity" />
          </Link>

          <div></div>
        </div>

        <div className="mt-auto mb-4 flex justify-center ml-4">
          <LogoutButton />
        </div>
      </div>
      
    </>
  );
};

export default NavBar;
