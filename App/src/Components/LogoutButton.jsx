import { useNavigate } from "react-router-dom";
import logoutImg from "../images/logout.png"; 
import { useAuthContext } from "@asgardeo/auth-react";
import { useUserData } from "../hooks/useUserData";

const LogoutButton = () => {
    const navigate = useNavigate();
    const { state, signIn, signOut, getAccessToken } = useAuthContext();
    const { clearUser } = useUserData();

    const handleLogout = () => {
        // Clear user data from context
        clearUser();
        
        // Remove any local storage items
        localStorage.removeItem("authToken"); 
        
        // Sign out from Asgardeo
        signOut();
        
        // Navigate to login page
        navigate("/"); 
    };

    return (
        <button 
            onClick={handleLogout} 
            className="w-full h-full flex justify-center items-center p-2 transition-all duration-300 ease-in-out hover:bg-gray-200 rounded-lg"
        >
            <img
                src={logoutImg}
                alt="Logout"
                className="w-6 h-6 md:w-7 md:h-7"
            />
        </button>
    );
};

export default LogoutButton;