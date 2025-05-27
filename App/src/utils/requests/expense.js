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
    
     console.log(response);
    return response.data;
   
      
  } catch (error) {
    console.error("Error creating expense:", error); // Handle errors
    return null;
  }
};


