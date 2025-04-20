import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, SecureRoute, useAuthContext } from "@asgardeo/auth-react";
import './App.css'
import HeaderProfile from './Components/HeaderProfile'
import ProfileView from './Views/ProfileView'
import Login from './Views/Login'
import CreateGroupModal from './Components/CreateGroup'
import GroupCard from './Components/GroupCard'
import Home from './Views/Home'
import ExpenseView from './Views/ExpenseView';
import AllFriends from './Views/AllFriends';
import OCRscanner from './Components/OCRscanner';
import FriendView from './Views/FriendView';

import { authConfig } from "./authConfig"; // Import Asgardeo configuration
import PaidView from './Views/PaidView';

function ProtectedRoute() {
  const { state } = useAuthContext();
  return state.isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
}


function App() {

  return (
    <AuthProvider config={authConfig}>
      <div className='w-screen mx-0 px-0'>

        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<ProfileView />} />
            <Route path="/paid" element={<PaidView />} />

              {/* <Route path="/group" element={<GroupView />} /> */}

              {/* protected routes */}
            <Route element={<ProtectedRoute />}>
                <Route path="/expense" element={<ExpenseView />} />
            </Route>


            <Route path="/expense" element={<ExpenseView />} />
             <Route path="/allfriends" element={<AllFriends/>} />
             <Route path="/ocr" element={<OCRscanner/>} />
             <Route path="/friend" element={<FriendView/>}  />

          </Routes>
        </Router>
      </div>
    </AuthProvider>
  )
}

export default App
