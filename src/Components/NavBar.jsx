import React from 'react';
import { Link } from 'react-router-dom';

// Import images correctly if they are inside the src folder
import settleImg from '../images/settle.png';
import cgroupImg from '../images/cgroup.png';
import addExpenseImg from '../images/addexpense.png';
import addImg from '../images/add.png';
import activityImg from '../images/activity.png';

const Navbar = () => {
  return (
    <div className="fixed w-20 h-full top-0 bg-[#f1f2f9] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] border">
      <nav className="w-full flex-shrink-0 bg-[#F1F2F9] flex flex-col items-center py-4">
        <Link to="/settle" className="w-7 h-7 relative overflow-hidden top-[160px]">
          <img src={settleImg} alt="Settle" />
        </Link>
        <Link to="/cgroup" className="w-7 h-7 relative overflow-hidden top-[224px]">
          <img src={cgroupImg} alt="Cgroup" />
        </Link>
        <Link to="/addexpense" className="w-7 h-7 relative overflow-hidden top-[288px]">
          <img src={addExpenseImg} alt="Add Expense" />
        </Link>
        <Link to="/add" className="w-7 h-7 relative overflow-hidden top-[352px]">
          <img src={addImg} alt="Add" />
        </Link>
        <Link to="/activity" className="w-7 h-7 relative overflow-hidden top-[416px]">
          <img src={activityImg} alt="Activity" />
        </Link>
      </nav>
    </div>
  );
};

export default Navbar;
