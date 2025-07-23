import axios from 'axios';

// Function to create a new group
export const createGroup = async (groupData) => {
  try {
    const url = `${import.meta.env.VITE_API_URL}/api_group/v1/groups`;
    
    console.log('Creating group with:', { 
      groupData, 
      url 
    });   
    
    // Make the POST request with proper authentication
    const response = await axios.post(url, groupData, {
      withCredentials: true, // This will automatically include all cookies
      headers: {
        'Content-Type': 'application/json'
      },
    });

    console.log('Create group response:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error creating group:", error);
    console.error("Response data:", error.response?.data);
    console.error("Response status:", error.response?.status);
    
    // Handle specific error cases and return error object
    let errorMessage = 'Failed to create group';
    
    if (error.response?.status === 401) {
      errorMessage = 'Unauthorized. Please login again.';
    } else if (error.response?.status === 400) {
      errorMessage = error.response?.data?.message || 'Invalid group data.';
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else {
      errorMessage = `Failed to create group: ${error.message}`;
    }
    
    return { 
      success: false, 
      error: errorMessage,
      status: error.response?.status 
    };
  }
};

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

