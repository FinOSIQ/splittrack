
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, SecureRoute, useAuthContext } from "@asgardeo/auth-react";
import './App.css'
import ProfileView from './Views/ProfileView'
import Login from './Views/Login'
import Home from './Views/Home'
import ExpenseView from './Views/ExpenseView';
import AllFriends from './Views/AllFriends';
import OCRscanner from './Components/OCRscanner';
import FriendView from './Views/FriendView';
import GroupView from './Views/GroupView';
import { authConfig } from "./authConfig"; // Import Asgardeo configuration
import PaidView from './Views/PaidView';
import SettleUp from './Views/SettleUpView';
import AuthView from './Views/AuthView';
import GuestEnrollment from './Views/GuestEnroll';
import { Toaster } from 'sonner';
import { UserProvider } from './contexts/UserContext'; // Import UserProvider

function ProtectedRoute() {
  const { state } = useAuthContext();
  return state.isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
}


function App() {

  return (
    <AuthProvider config={authConfig}>
      <UserProvider>
        <div className='w-screen mx-0 px-0'>

        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<ProfileView />} />
            <Route path="/paid" element={<PaidView />} />
            <Route path="/authenticate" element={<AuthView />} />
            <Route path="/group/:groupId" element={<GroupView />} />


            {/* protected routes */}
            {/* <Route element={<ProtectedRoute />}>
                <Route path="/expense" element={<ExpenseView />} />
            </Route> */}


            <Route path="/expense" element={<ExpenseView />} />
            <Route path="/expense/:expenseId" element={<ExpenseView />} />
            <Route path="/allfriends" element={<AllFriends />} />
            <Route path="/ocr" element={<OCRscanner />} />
            <Route path="/friend/:friendId" element={<FriendView />} />
             <Route path="/guest/:sessionId" element={<GuestEnrollment />} />
            <Route path="/settleup" element={<SettleUp />} />



          </Routes>
        </Router>
        <Toaster
          richColors={true}
          position="top-center"
        />
        </div>
      </UserProvider>
    </AuthProvider>
  )
}

export default App
