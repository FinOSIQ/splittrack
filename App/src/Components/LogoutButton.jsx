import { useNavigate } from "react-router-dom";
import logoutImg from "../images/logout.png";
import { useAuthContext } from "@asgardeo/auth-react";
import { useUserData } from "../hooks/useUserData";
import { logoutUser } from "../utils/requests/User";
import { toast } from "sonner";

const LogoutButton = () => {
    const navigate = useNavigate();
    const { state, signIn, signOut, getAccessToken } = useAuthContext();
    const { clearUser } = useUserData();

    const handleLogout = async () => {
        try {
            // Call backend logout API to clear server-side cookies
            const logoutResponse = await logoutUser();

            if (logoutResponse.success) {
                console.log('Server logout successful:', logoutResponse.message);
                // Clear user data from context
                clearUser();

                // Sign out from Asgardeo
                signOut();

               
            } else {
                console.error('Server logout failed:', logoutResponse.error);
                toast.error('Logout failed. Please try again.');
            }
        } catch (error) {
            console.error('Error during server logout:', error);
            // Continue with client logout even if server logout fails
        }


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