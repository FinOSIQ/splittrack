import React from 'react';
import { useEffect } from 'react';
import { useAuthContext } from "@asgardeo/auth-react"; // Import Asgardeo authentication hook


const SplitTrackScreen = () => {

    const { state, signIn, signOut, getAccessToken } = useAuthContext();

    useEffect(() => {
        if (state.isAuthenticated) {
            const accessToken = getAccessToken();

            console.log(accessToken);

        }
    }, [state.isAuthenticated]);

    return (

        <div className="min-h-screen flex flex-col lg:flex-row bg-white overflow-hidden">
            <div className="hidden lg:block lg:w-1/2 h-screen bg-slate-100"></div>

            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center py-10 px-4 lg:px-0 min-h-screen lg:min-h-0">
                <div className="mb-8">
                    <img
                        src="/SplitTrack Logo.svg"
                        alt="SplitTrack Logo"
                        className="h-30 w-auto"
                    />
                </div>

                <p className="text-gray-600 text-xl lg:text-2xl font-['Inter'] text-left max-w-lg lg:max-w-xl mb-10 w-full lg:w-auto">
                    Welcome to Split Track! Effortlessly split and manage bills with your friends, and settle payments seamlessly, all in one app. Log in or register to simplify your finances and stay connected!
                </p>

                {/* Buttons */}
                <div className="flex flex-col gap-4 w-full max-w-xs">
                    <button onClick={() => { signIn() }} className="bg-slate-900 text-white text-2xl font-medium font-['Poppins'] py-4 rounded-xl hover:bg-slate-800 transition">
                        Log In
                    </button>
                    <button onClick={() => { signIn() }} className="bg-slate-100 text-slate-900 text-2xl font-medium font-['Poppins'] py-4 rounded-xl hover:bg-slate-200 transition">
                        Register
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SplitTrackScreen;