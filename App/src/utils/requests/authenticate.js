
import axios from 'axios';

const fetchUserData = async (token) => {
  try {
    // Make the API request with headers directly in axios
    const response = await axios.post(
        'http://localhost:9090/api_user/v1/user',
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
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response:', error.response.status, error.response.data);
      throw new Error(`API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      throw new Error('No response received from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request error:', error.message);
      throw new Error(`Request failed: ${error.message}`);
    }
  }
};

export default fetchUserData;

