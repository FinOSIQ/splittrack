import axios from 'axios';

// Function to fetch group details by ID
const fetchGroupDetails = async (groupId) => {
  try {
    console.log(`Fetching group details for ID: ${groupId}`);
    const response = await axios.get(
      `http://localhost:9090/api_group/v1/groupDetails/${groupId}`
    );
    
    console.log('Group details API response:', response.data);
    return response.data.group || {};
  } catch (err) {
    console.error('Error fetching group details:', 
      err.response ? err.response.data : err.message);
    throw new Error(err.message || 'Failed to fetch group details');
  }
};

export {
  fetchGroupDetails
};