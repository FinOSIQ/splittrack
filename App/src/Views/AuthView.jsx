import React,{useEffect} from 'react';
import { useAuthContext } from "@asgardeo/auth-react"; 
import fetchUserData from '../utils/requests/authenticate';

export default function AuthView () {

    const { state, signIn, signOut, getAccessToken, } = useAuthContext();

    useEffect(() => {
        if (state.isAuthenticated) {
            const fetchAccessToken = async () => {
                try {
                    const accessToken = await getAccessToken();
                    console.log("Access Token: ", accessToken);
                    
                    const res = await fetchUserData(accessToken);
                    
                    if (res.status === 200) {
                        window.location.href = "/home";
                    } else {
                        console.log(error);
                        
                    }
                } catch (error) {
                    console.log(error);
                    
                }
            };
            fetchAccessToken();
        }
    }, [state.isAuthenticated]);


  return (
    <div className="flex items-center justify-center h-screen w-screen bg-white">
      <div className="relative w-40 h-40">
        {/* Arc segments */}
        {[...Array(4)].map((_, index) => (
          <div 
            key={index}
            className="absolute w-full h-full"
            style={{
              transform: `rotate(${index * 90}deg)`
            }}
          >
            <div 
              className="absolute h-16 w-4 bg-gray-800 rounded-full origin-bottom"
              style={{
                left: 'calc(50% - 2px)',
                top: '0',
                transformOrigin: 'center bottom',
                animation: `loadSegment 2s infinite ease-in-out ${index * 0.2}s`
              }}
            />
          </div>
        ))}
        

      </div>

      <style jsx>{`
        @keyframes loadSegment {
          0%, 100% { 
            transform: scaleY(0.3);
            opacity: 0.3;
          }
          40%, 60% { 
            transform: scaleY(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

