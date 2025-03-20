import React from 'react';
import { Link } from 'react-router-dom';


import settleImg from '../images/settle.png';
import cgroupImg from '../images/cgroup.png';
import addExpenseImg from '../images/addexpense.png';
import addImg from '../images/add.png';
import activityImg from '../images/activity.png';

const Navbar = () => {
  return (
    <div className="fixed w-20 h-full top-0 bg-[#f1f2f9] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] border">
      <nav className="w-full flex-shrink-0 bg-[#F1F2F9] flex flex-col items-center py-4">
        <Link to="/settle" className="w-8 h-8 relative overflow-hidden top-[120px]">
          <img src={settleImg} alt="Settle" />
        </Link>
        <Link to="/cgroup" className="w-8 h-8 relative overflow-hidden top-[194px]">
          <img src={cgroupImg} alt="Cgroup" />
        </Link>

        {/* White Circle  */}
        <div className="absolute left-8 top-[335px] w-[85px] h-[100px] bg-white rounded-full"></div>

        {/* Blue Circle */}
        <Link
          to="/addexpense"
          className="absolute left-[45px] top-[343px] w-[70px] h-[80px] bg-[#040b2b] text-white flex items-center justify-center rounded-full shadow-md border-2 border-white"
        >
          <img src={addExpenseImg} alt="Add Expense" className="w-7 h-7 filter invert" />

        </Link>

        <Link to="/add" className="w-8 h-8 relative overflow-hidden top-[434px]">
          <img src={addImg} alt="Add" />
        </Link>
        <Link to="/activity" className="w-8 h-8 relative overflow-hidden top-[508px]">
          <img src={activityImg} alt="Activity" />
        </Link>
      </nav>
    </div>
  );
};

export default Navbar;
