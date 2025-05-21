import { useNavigate } from "react-router-dom";
import logoutImg from "../images/logout.png"; 
import { useAuthContext } from "@asgardeo/auth-react"; // Import Asgardeo authentication hook


const LogoutButton = () => {
    const { state, signIn, signOut, getAccessToken } = useAuthContext();

    const navigate = useNavigate();

    // const handleLogout = () => {
        
    //     localStorage.removeItem("authToken"); 
    //     navigate("/login"); 
    // };

    return (
        <button 
            onClick={() => signIn()} 

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
