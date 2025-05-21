import axios from 'axios';

// Function to fetch group details by ID
const fetchGroupDetails = async (groupId) => {
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

export {
  fetchGroupDetails
};