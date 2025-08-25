import axios from 'axios';

// Function to fetch friend expense details by friend ID
export const getFriendExpense = async (friendId) => {
  try {
  const url = `${apiBase('friend')}/friendExpense/${friendId}`;
    
    console.log('Fetching friend expense with:', { 
      friendId, 
      url 
    });   
    // Make the GET request with proper authentication
    const response = await axios.get(url, {
      withCredentials: true, // This will automatically include all cookies
      headers: {
        'Content-Type': 'application/json'
      },
    });

    console.log('Friend expense response:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching friend expense:", error);
    console.error("Response data:", error.response?.data);
    console.error("Response status:", error.response?.status);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      throw new Error('Unauthorized. Please login again.');
    } else if (error.response?.status === 403) {
      throw new Error('Not friends with this user.');
    } else if (error.response?.status === 404) {
      throw new Error('Friend not found.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error(`Failed to fetch friend expense: ${error.message}`);
    }
  }
};

// Function to fetch list of friends for a user
export const getFriends = async (userId) => {
  try {
  const url = `${apiBase('friend')}/friends/${userId}`;
    
    console.log('Fetching friends list with:', { 
      userId, 
      url 
    });   
    
    const response = await axios.get(url, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      },
    });

    console.log('Friends list response:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching friends list:", error);
    console.error("Response data:", error.response?.data);
    console.error("Response status:", error.response?.status);
    
    if (error.response?.status === 401) {
      throw new Error('Unauthorized. Please login again.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error(`Failed to fetch friends list: ${error.message}`);
    }
  }
};

// Function to send a friend request
export const sendFriendRequest = async (sendUserId, receiveUserId) => {
  try {
  const url = `${apiBase('friend')}/friendrequests/send`;
    
    const requestData = {
      send_user_idUser_Id: sendUserId,
      receive_user_Id: receiveUserId
    };
    
    console.log('Sending friend request with:', requestData);
    
    const response = await axios.post(url, requestData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      },
    });

    console.log('Friend request response:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending friend request:", error);
    console.error("Response data:", error.response?.data);
    console.error("Response status:", error.response?.status);
    
    if (error.response?.status === 401) {
      throw new Error('Unauthorized. Please login again.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error(`Failed to send friend request: ${error.message}`);
    }
  }
};

// Function to get friend requests for a user
export const getFriendRequests = async (userId) => {
  try {
  const url = `${apiBase('friend')}/friendrequests/${userId}`;
    
    console.log('Fetching friend requests with:', { 
      userId, 
      url 
    });   
    
    const response = await axios.get(url, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      },
    });

    console.log('Friend requests response:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    console.error("Response data:", error.response?.data);
    console.error("Response status:", error.response?.status);
    
    if (error.response?.status === 401) {
      throw new Error('Unauthorized. Please login again.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error(`Failed to fetch friend requests: ${error.message}`);
    }
  }
};

// Function to accept or decline a friend request
export const respondToFriendRequest = async (requestId, status) => {
  try {
  const url = `${apiBase('friend')}/friendRequests/${requestId}`;
    
    const requestData = {
      status: status // "accepted" or "declined"
    };
    
    console.log('Responding to friend request with:', { requestId, status });
    
    const response = await axios.put(url, requestData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      },
    });

    console.log('Friend request response:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error responding to friend request:", error);
    console.error("Response data:", error.response?.data);
    console.error("Response status:", error.response?.status);
    
    if (error.response?.status === 401) {
      throw new Error('Unauthorized. Please login again.');
    } else if (error.response?.status === 404) {
      throw new Error('Friend request not found.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error(`Failed to respond to friend request: ${error.message}`);
    }
  }
};
