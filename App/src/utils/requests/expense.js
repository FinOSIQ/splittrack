import axios from "axios";
import { apiBase } from "../apiBase";

// Function to fetch data with dynamic parameters using GET request and cancellation token
export const fetchSearchData = async (value, type, userId, cancelToken) => {
  try {

  const url = `${apiBase('search')}/search`;

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
  const url = `${apiBase('expense')}/expense`;

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
  const url = `${apiBase('expense')}/expense/session`;
    
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
  const url = `${apiBase('expense')}/session/${sessionId}`;
    
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
  const url = `${apiBase('expense')}/joinExpense`;
   
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
  const url = `${apiBase('expense')}/expense/${expenseId}`;
    
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


// Function to fetch recent activity
export const fetchRecentActivity = async () => {
  try {
  const url = `${apiBase('expense')}/recentActivity`;
    
    const response = await axios.get(url, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    
    if (error.response?.status === 401) {
      throw new Error('Unauthorized. Please login again.');
    } else if (error.response?.status === 404) {
      throw new Error('Recent activity not found.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error(`Failed to fetch recent activity: ${error.message}`);
    }
  }
};

// Function to fetch user expense summary (balance)
export const fetchUserExpenseSummary = async () => {
  try {
  const url = `${apiBase('expense')}/userExpenseSummary`;
    
    const response = await axios.get(url, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching user expense summary:", error);
    
    if (error.response?.status === 401) {
      throw new Error('Unauthorized. Please login again.');
    } else if (error.response?.status === 404) {
      throw new Error('User expense summary not found.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error(`Failed to fetch user expense summary: ${error.message}`);
    }
  }
};

// Function to fetch group expenses
export const fetchGroupExpenses = async () => {
  try {
  const url = `${apiBase('expense')}/groupExpenses`;
    
    const response = await axios.get(url, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching group expenses:", error);
    
    if (error.response?.status === 401) {
      throw new Error('Unauthorized. Please login again.');
    } else if (error.response?.status === 404) {
      throw new Error('Group expenses not found.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error(`Failed to fetch group expenses: ${error.message}`);
    }
  }
};

// Function to fetch non-group expenses
export const fetchNonGroupExpenses = async () => {
  try {
  const url = `${apiBase('expense')}/nonGroupExpenses`;
    
    console.log('Fetching non-group expenses from:', url);
    
    const response = await axios.get(url, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Non-group expenses response:', response.data);
    console.log('Number of expenses found:', response.data.expenses?.length || 0);
    
    // Log each expense for debugging
    if (response.data.expenses && response.data.expenses.length > 0) {
      response.data.expenses.forEach((expense, index) => {
        console.log(`Expense ${index + 1}:`, {
          expenseId: expense.expenseId,
          expenseName: expense.expenseName,
          netAmount: expense.netAmount,
          participantNames: expense.participantNames,
          transactionCount: expense.transactions?.length || 0,
          created_at: expense.created_at
        });
      });
    } else {
      console.log('No non-group expenses found');
    }
    
    return response.data;
  } catch (error) {
    console.error("Error fetching non-group expenses:", error);
    console.error("Response data:", error.response?.data);
    console.error("Response status:", error.response?.status);
    
    if (error.response?.status === 401) {
      throw new Error('Unauthorized. Please login again.');
    } else if (error.response?.status === 404) {
      throw new Error('Non-group expenses not found.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error(`Failed to fetch non-group expenses: ${error.message}`);
    }
  }
};

// Function to fetch non-group expense details by ID
export const getNonGroupExpenseById = async (expenseId) => {
  try {
  const url = `${apiBase('expense')}/nonGroupExpenseDetails/${expenseId}`;
    
    console.log('Fetching non-group expense with ID:', expenseId);
    
    const response = await axios.get(url, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Non-group expense response:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching non-group expense:", error);
    console.error("Response data:", error.response?.data);
    console.error("Response status:", error.response?.status);
    
    if (error.response?.status === 401) {
      throw new Error('Unauthorized. Please login again.');
    } else if (error.response?.status === 404) {
      throw new Error('Non-group expense not found.');
    } else if (error.response?.status === 403) {
      throw new Error('Access denied. You are not a participant in this expense.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error(`Failed to fetch non-group expense: ${error.message}`);
    }
  }
};