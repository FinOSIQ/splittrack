import axios from 'axios';

// Function to fetch group details by ID
export const getGroupDetails = async (groupId) => {
  try {
    const url = `${import.meta.env.VITE_API_URL}/api_group/v1/groupDetails/${groupId}`;
    
    console.log('Fetching group details with:', { 
      groupId, 
      url 
    });   
    // Make the GET request with proper authentication
    const response = await axios.get(url, {
      withCredentials: true, // This will automatically include all cookies
      headers: {
        'Content-Type': 'application/json'
      },
    });

    console.log('Group details response:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching group details:", error);
    console.error("Response data:", error.response?.data);
    console.error("Response status:", error.response?.status);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      throw new Error('Unauthorized. Please login again.');
    } else if (error.response?.status === 404) {
      throw new Error('Group not found.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error(`Failed to fetch group details: ${error.message}`);
    }
  }
};

