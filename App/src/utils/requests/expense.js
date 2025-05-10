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
      cancelToken: cancelToken // Pass the cancel token here
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
