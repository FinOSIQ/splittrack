import axios from 'axios';
import { apiBase } from '../apiBase';

// Function to create a new group
export const createGroup = async (groupData) => {
  try {
  const url = `${apiBase('group')}/groups`;
    
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
  const url = `${apiBase('group')}/groupDetails/${groupId}`;
    
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

// Function to fetch group member balance summary
export const getGroupMemberBalanceSummary = async (groupId) => {
  try {
  const url = `${apiBase('group')}/groupMemberBalanceSummary/${groupId}`;
    
    console.log('Fetching group member balance summary with:', { 
      groupId, 
      url 
    });   
    
    const response = await axios.get(url, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      },
    });

    console.log('Group member balance summary response:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching group member balance summary:", error);
    console.error("Response data:", error.response?.data);
    console.error("Response status:", error.response?.status);
    
    if (error.response?.status === 401) {
      throw new Error('Unauthorized. Please login again.');
    } else if (error.response?.status === 404) {
      throw new Error('Group not found.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error(`Failed to fetch group member balance summary: ${error.message}`);
    }
  }
};

// Function to update group details (name and members)
export const updateGroup = async (groupId, updateData) => {
  try {
  const url = `${apiBase('group')}/groups/${groupId}`;
    
    console.log('Updating group with:', { 
      groupId,
      updateData, 
      url 
    });   
    
    // Make the PUT request with proper authentication
    const response = await axios.put(url, updateData, {
      withCredentials: true, // This will automatically include all cookies
      headers: {
        'Content-Type': 'application/json'
      },
    });

    console.log('Update group response:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error updating group:", error);
    console.error("Response data:", error.response?.data);
    console.error("Response status:", error.response?.status);
    
    // Handle specific error cases and return error object
    let errorMessage = 'Failed to update group';
    
    if (error.response?.status === 401) {
      errorMessage = 'Unauthorized. Please login again.';
    } else if (error.response?.status === 404) {
      errorMessage = 'Group not found.';
    } else if (error.response?.status === 400) {
      errorMessage = error.response?.data?.message || 'Invalid group data.';
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else {
      errorMessage = `Failed to update group: ${error.message}`;
    }
    
    return { 
      success: false, 
      error: errorMessage,
      status: error.response?.status 
    };
  }
};

// Function to remove a member from a group (or leave group if removing self)
export const removeMember = async (groupId, userId) => {
  try {
  const url = `${apiBase('group')}/removeMember`;
    
    // Add validation to ensure parameters are not undefined
    if (!groupId || !userId) {
      console.error('Missing required parameters:', { groupId, userId });
      return {
        success: false,
        error: `Missing required parameters: groupId=${groupId}, userId=${userId}`,
        status: 400
      };
    }
    
    const requestData = {
      groupId: groupId,
      userId: userId
    };
    
    console.log('Removing member with:', { 
      requestData, 
      url 
    });
    
    // Make the POST request (backend endpoint changed to POST)
    const response = await axios.post(url, requestData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      },
    });

    console.log('Remove member response:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error removing member:", error);
    console.error("Response data:", error.response?.data);
    console.error("Response status:", error.response?.status);
    
    // Handle specific error cases and return error object
    let errorMessage = 'Failed to remove member';
    
    if (error.response?.status === 401) {
      errorMessage = 'Unauthorized. Please login again.';
    } else if (error.response?.status === 404) {
      errorMessage = 'Group or member not found.';
    } else if (error.response?.status === 403) {
      errorMessage = 'You do not have permission to remove this member.';
    } else if (error.response?.status === 400) {
      errorMessage = error.response?.data?.message || 'Invalid request data.';
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else {
      errorMessage = `Failed to remove member: ${error.message}`;
    }
    
    return { 
      success: false, 
      error: errorMessage,
      status: error.response?.status 
    };
  }
};

// Function to delete a group (creator only)
export const deleteGroup = async (groupId) => {
  try {
  const url = `${apiBase('group')}/groups/${groupId}`;
    
    // Add validation to ensure groupId is provided
    if (!groupId) {
      console.error('Missing required parameter: groupId');
      return {
        success: false,
        error: 'Missing required parameter: groupId',
        status: 400
      };
    }
    
    console.log('Deleting group with:', { 
      groupId, 
      url 
    });
    
    // Make the DELETE request
    const response = await axios.delete(url, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      },
    });

    console.log('Delete group response:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error deleting group:", error);
    console.error("Response data:", error.response?.data);
    console.error("Response status:", error.response?.status);
    
    // Handle specific error cases and return error object
    let errorMessage = 'Failed to delete group';
    
    if (error.response?.status === 401) {
      errorMessage = 'Unauthorized. Please login again.';
    } else if (error.response?.status === 404) {
      errorMessage = 'Group not found.';
    } else if (error.response?.status === 403) {
      errorMessage = 'You do not have permission to delete this group. Only the creator can delete a group.';
    } else if (error.response?.status === 400) {
      errorMessage = error.response?.data?.message || 'Cannot delete group. Please check if there are active expenses.';
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else {
      errorMessage = `Failed to delete group: ${error.message}`;
    }
    
    return { 
      success: false, 
      error: errorMessage,
      status: error.response?.status 
    };
  }
};

