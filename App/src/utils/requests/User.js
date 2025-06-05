
import axios from 'axios';

export const postUserData = async (token) => {
  try {
    // Make the API request with headers directly in axios
    const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api_user/v1/user`,
        {},
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            withCredentials: true 
        }
    );
    
    // Return the response data
    return response;
  } catch (error) {
    // Handle any errors
    if (error.response) {
      console.error('Error response:', error.response.status, error.response.data);
      throw new Error(`API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      throw new Error('No response received from server');
    } else {
      console.error('Request error:', error.message);
      throw new Error(`Request failed: ${error.message}`);
    }
  }
};


export const fetchUserData = async () => {
  try {
    const url = `${import.meta.env.VITE_API_URL}/api_user/v1/user_byid`;

    // Make the GET request
    const response = await axios.get(url, {
      withCredentials: true, // Include credentials (cookies) in the request
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response;

  } catch (error) {
    console.error("Error fetching user data:", error);
    return error;
  }
};



export const updateUserData = async (userData) => {
  try {
    const url = `${import.meta.env.VITE_API_URL}/api_user/v1/user`;

    // Make the PUT request
    const response = await axios.put(url, userData, {
      withCredentials: true, 
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response;

  } catch (error) {
    console.error("Error updating user data:", error);
    return error;
  }
};