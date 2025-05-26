import axios from 'axios';

// Function to fetch group details by ID
export const fetchGroupDetails = async (groupId) => {
  try {
    const response = await axios.get(
      `http://localhost:9090/api_group/v1/groups/${groupId}`
    );
    return response.data.group || {};
  } catch (err) {
    console.error('Error fetching group details:', 
      err.response ? err.response.data : err.message);
    throw new Error(err.message || 'Failed to fetch group details');
  }
};


export const getGroupDetails = async (groupId) => {
  try {
    const url = `${import.meta.env.VITE_API_URL}/api_group/v1/groupDetails/${groupId}`;
    
    // Make the GET request
    const response = await axios.get(url, {
      withCredentials: true, // Include credentials in the request
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching group details:", error);
    return null;
  }
};
