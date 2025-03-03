import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'
import HeaderProfile from './Components/HeaderProfile'
import ProfileView from './Views/ProfileView'

import CreateGroupModal from './Components/CreateGroup'
import GroupCard from './Components/GroupCard'
import Home from './Views/Home'
import GroupView from './Views/GroupView'
import AllFriends from './Views/AllFriends';


function App() {

  return (
 <div className='w-screen mx-0 px-0'>
        
        <Router>  
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<ProfileView />} />
            <Route path="/group" element={<GroupView />} />
            <Route path="/friends" element={<AllFriends/>} />
          </Routes>
        </Router>
      </div>
  )
}

export default App
