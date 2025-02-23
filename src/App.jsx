import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'
import HeaderProfile from './Components/HeaderProfile'
import ProfileView from './Views/ProfileView'

import CreateGroupModal from './Components/CreateGroup'
import GroupCard from './Components/GroupCard'
import Home from './Views/Home'
import GroupView from './Views/GroupView'


function App() {

  return (
    
      <div className='w-screen mx-0 px-0'>
        
        <Router>  
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<ProfileView />} />
            <Route path="/group" element={<GroupView />} />
          </Routes>
        </Router>
      </div>
    
  )
}

export default App
