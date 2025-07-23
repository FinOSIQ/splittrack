import React from 'react';
import { Link } from 'react-router-dom';
import LogoutButton from "./LogoutButton";

import settleImg from '../images/settle.png';
import cgroupImg from '../images/cgroup.png';
import addExpenseImg from '../images/addexpense.png';
import addImg from '../images/add.png';

import AddExpensePopup from './AddExpensePopup';
import CreateGroupModal from "./CreateGroup";

const NavBar = () => {
  return (
    <>
      {/* Wrapper div with group class to enable group-hover */}
      <div className="group">
        <div
          className="fixed top-0 h-screen bg-[#f1f2f9] group-hover:bg-blue-50 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] border-r flex flex-col py-4
            w-14 hover:w-60 transition-width duration-300 ease-in-out overflow-visible"
        >
          <div
  className="grid grid-rows-7 flex-grow items-center justify-start px-3 relative whitespace-nowrap pt-16"
  style={{ rowGap: '1px' }} // custom smaller gap
>

            <Link to="/settleup" className="flex items-center gap-4 ">
              <img src={settleImg} alt="Settle" className="w-7 h-7" />
              <span className="ml-4 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[#040b2b] font-medium">
                Settle Up
              </span>
            </Link>

            <div className="flex items-center gap-4 group cursor-pointer">
              <CreateGroupModal />

              <span className="ml-4 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[#040b2b] font-medium">
                Create Group
              </span>

            </div>


            {/* Add Expense button with half-outside circle */}
            <div
              className="relative w-full group flex items-center"
              style={{ marginTop: '0.75rem', marginBottom: '0.75rem', minHeight: '70px' }}
            >
              {/* Remove absolute positioning and negative left margin */}
              <AddExpensePopup />

              <span
                className="ml-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[#040b2b] font-medium select-none"
              >
              
              </span>
            </div>


            <Link to="/allfriends" className="flex items-center gap-4">
              <img src={addImg} alt="Add" className="w-7 h-7" />
              <span className="ml-4 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[#040b2b] font-medium">
                Friends
              </span>
            </Link>



            {/* Logout as the last grid row item */}
            <div className="flex items-center gap-4 cursor-pointer">
              <div className="w-10 h-7  flex items-center justify-center -ml-1">
                <LogoutButton />
              </div>
              <span className="ml-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[#040b2b] font-medium">
                Logout
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NavBar;