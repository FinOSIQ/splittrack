import axios from "axios";

// Function to fetch data with dynamic parameters using GET request and cancellation token
export const fetchSearchData = async (value, type, userId, cancelToken) => {
  try {

    const url = `${import.meta.env.VITE_API_URL}/api_search/v1/search`;

    // Make the API request with the cancel token
    const response = await axios.get(url, {
      params: {
        value: value,
        type: type,
        userId: userId
      },
      cancelToken: cancelToken, // Pass the cancel token here
      withCredentials: true, // Include credentials in the request
    });

    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log("Request canceled:", error.message); // Handle cancellation error
    } else {
      console.error("Error fetching search data:", error); // Handle other errors
    }
    return [];
  }
};



// Function to create expense with POST request
export const createExpense = async (expenseData) => {
  try {
    const url = `${import.meta.env.VITE_API_URL}/api_expense/v1/expense`; // Test URL - adjust as needed

    // Make the POST request
    const response = await axios.post(url, expenseData, {
      withCredentials: true, // Include credentials in the request
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response;


  } catch (error) {
    console.error("Error creating expense:", error); // Handle errors
    return error;
  }
};

export const createSession = async () => {
  try {
    const url = `${import.meta.env.VITE_API_URL}/api_expense/v1/expense/session`;
    
    const response = await axios.post(url, null, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response;
  } catch (error) {
    console.error("Error creating session:", error);
    return error;
  }
};


export const deleteSession = async (sessionId) => {
  try {
    const url = `${import.meta.env.VITE_API_URL}/api_expense/v1/session/${sessionId}`;
    
    const response = await axios.delete(url, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response;
  } catch (error) {
    console.error("Error deleting session:", error);
    return error;
  }
};


export const joinExpense = async (guestData) => {
 try {
   const url = `${import.meta.env.VITE_API_URL}/api_expense/v1/joinExpense`;
   
   const response = await axios.post(url, guestData, {
     withCredentials: true,
     headers: {
       'Content-Type': 'application/json'
     }
   });
   
   return response;
 } catch (error) {
   console.error("Error joining expense:", error);
   return error;
 }
};

// Function to fetch expense details by ID
export const getExpenseById = async (expenseId) => {
  try {
    const url = `${import.meta.env.VITE_API_URL}/api_expense/v1/expense/${expenseId}`;
    
    console.log('Fetching expense with ID:', expenseId);
    
    const response = await axios.get(url, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Expense response:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching expense:", error);
    console.error("Response data:", error.response?.data);
    console.error("Response status:", error.response?.status);
    
    if (error.response?.status === 401) {
      throw new Error('Unauthorized. Please login again.');
    } else if (error.response?.status === 404) {
      throw new Error('Expense not found.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error(`Failed to fetch expense: ${error.message}`);
    }
  }
};






