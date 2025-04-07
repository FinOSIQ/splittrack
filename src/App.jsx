import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'
import HeaderProfile from './Components/HeaderProfile'
import ProfileView from './Views/ProfileView'
import CreateGroupModal from './Components/CreateGroup'
import GroupCard from './Components/GroupCard'
import Home from './Views/Home'
import GroupView from './Views/GroupView'
import ExpenseView from './Views/ExpenseView';
import AllFriends from './Views/AllFriends';
import OCRscanner from './Components/OCRscanner';
import FriendView from './Views/FriendView';



function App() {

  return (
 <div className='w-screen mx-0 px-0'>
        
        <Router>  
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<ProfileView />} />
            <Route path="/group" element={<GroupView />} />
            <Route path="/expense" element={<ExpenseView />} />
             <Route path="/allfriends" element={<AllFriends/>} />
             <Route path="/ocr" element={<OCRscanner/>} />
             <Route path="/friend" element={<FriendView/>}  />
          </Routes>
        </Router>
      </div>
  )
}

export default App
