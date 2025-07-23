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
      return error
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      return error;
    } else {
      console.error('Request error:', error.message);
      return error;
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

// Function to fetch user data using cookie authentication
export const fetchUserByCookie = async () => {
  try {
    const url = `${import.meta.env.VITE_API_URL}/api_user/v1/user_byCookie`;

    // Make the GET request with credentials
    const response = await axios.get(url, {
      withCredentials: true, // Include cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Check if the response indicates success
    if (response.data.status === 'success') {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } else {
      return {
        success: false,
        error: response.data.message || 'Failed to fetch user data',
        data: null
      };
    }

  } catch (error) {
    console.error("Error fetching user data by cookie:", error);
    
    // Return a structured error response
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch user data',
      data: null
    };
  }
};

// Function to logout user and clear server-side cookies
export const logoutUser = async () => {
  try {
    const url = `${import.meta.env.VITE_API_URL}/api_user/v1/logout`;

    // Make the POST request to logout endpoint
    const response = await axios.post(url, {}, {
      withCredentials: true, // Include cookies to be cleared
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Check if the response indicates success
    if (response.data.status === 'success') {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Logged out successfully'
      };
    } else {
      return {
        success: false,
        error: response.data.message || 'Failed to logout',
        data: null
      };
    }

  } catch (error) {
    console.error("Error during logout:", error);
    
    // Return a structured error response
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to logout',
      data: null
    };
  }
};