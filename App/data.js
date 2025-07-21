// src/data/data.js

// Function to generate avatar based on first letter of name
export const generateAvatar = (name) => {
  const firstLetter = name.charAt(0).toUpperCase();
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  const colorIndex = firstLetter.charCodeAt(0) % colors.length;
  
  return {
    letter: firstLetter,
    backgroundColor: colors[colorIndex],
    textColor: '#FFFFFF'
  };
};

// ─── Friends you owe (To pay) - Based on IOweResponse ───
export const friendsToPay = [
  {
    userId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    userName: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    totalOwingAmount: 53.45,
    avatar: generateAvatar("Sarah Johnson")
  },
  {
    userId: "b2c3d4e5-f6g7-8901-bcde-f23456789012", 
    userName: "Mike Rodriguez",
    email: "mike.rodriguez@email.com",
    totalOwingAmount: 21.35,
    avatar: generateAvatar("Mike Rodriguez")
  }
];

// ─── Friends who owe you (To be paid) - Based on OwesToMeResponse ───
export const friendsToBePaid = [
  {
    userId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    userName: "Sarah Johnson", 
    email: "sarah.johnson@email.com",
    totalOwingAmount: 161.87,
    avatar: generateAvatar("Sarah Johnson")
  },
  {
    userId: "c3d4e5f6-g7h8-9012-cdef-345678901234",
    userName: "Emma Thompson",
    email: "emma.thompson@email.com", 
    totalOwingAmount: 161.87,
    avatar: generateAvatar("Emma Thompson")
  },
  {
    userId: "b2c3d4e5-f6g7-8901-bcde-f23456789012",
    userName: "Mike Rodriguez",
    email: "mike.rodriguez@email.com",
    totalOwingAmount: 120.00,
    avatar: generateAvatar("Mike Rodriguez")
  }
];

// ─── Sample expense details for when clicking on a friend ───
// Based on ExpenseDetailResponse structure
export const sampleExpenseDetails = {
  "a1b2c3d4-e5f6-7890-abcd-ef1234567890": [
    {
      expenseId: "exp002-bfb1-96b4-groceries-trip123",
      expenseName: "Groceries for Weekend Trip", 
      expenseTotalAmount: 156.80,
      userOwingAmount: 39.20,
      creatorName: "Sarah Johnson",
      dateMonth: "Jun",
      dateDay: "20"
    },
    {
      expenseId: "exp005-bfb1-96b4-coffee-morning123",
      expenseName: "Morning Coffee Run",
      expenseTotalAmount: 28.75,
      userOwingAmount: 14.25, 
      creatorName: "Sarah Johnson",
      dateMonth: "Jul",
      dateDay: "16"
    }
  ],
  "b2c3d4e5-f6g7-8901-bcde-f23456789012": [
    {
      expenseId: "exp003-bfb1-96b4-gas-money-trip123",
      expenseName: "Gas Money for Road Trip",
      expenseTotalAmount: 85.40,
      userOwingAmount: 21.35,
      creatorName: "Mike Rodriguez", 
      dateMonth: "Jun",
      dateDay: "18"
    }
  ]
};

// For "To be paid" detailed expenses (when others owe you)
export const sampleOwesToMeDetails = {
  "a1b2c3d4-e5f6-7890-abcd-ef1234567890": [
    {
      expenseId: "exp001-bfb1-96b4-hotel-booking123",
      expenseName: "Mountain Resort Hotel - Weekend Trip",
      expenseTotalAmount: 480.00,
      memberOwingAmount: 120.00,
      memberName: "Sarah Johnson",
      dateMonth: "Jun", 
      dateDay: "15"
    },
    {
      expenseId: "exp004-bfb1-96b4-italian-dinner123",
      expenseName: "Tonys Italian Restaurant",
      expenseTotalAmount: 125.60,
      memberOwingAmount: 41.87,
      memberName: "Sarah Johnson",
      dateMonth: "Jul",
      dateDay: "12"
    }
  ],
  "c3d4e5f6-g7h8-9012-cdef-345678901234": [
    {
      expenseId: "exp001-bfb1-96b4-hotel-booking123", 
      expenseName: "Mountain Resort Hotel - Weekend Trip",
      expenseTotalAmount: 480.00,
      memberOwingAmount: 120.00,
      memberName: "Emma Thompson",
      dateMonth: "Jun",
      dateDay: "15"
    },
    {
      expenseId: "exp004-bfb1-96b4-italian-dinner123",
      expenseName: "Tonys Italian Restaurant", 
      expenseTotalAmount: 125.60,
      memberOwingAmount: 41.87,
      memberName: "Emma Thompson",
      dateMonth: "Jul",
      dateDay: "12"
    }
  ],
  "b2c3d4e5-f6g7-8901-bcde-f23456789012": [
    {
      expenseId: "exp001-bfb1-96b4-hotel-booking123",
      expenseName: "Mountain Resort Hotel - Weekend Trip",
      expenseTotalAmount: 480.00, 
      memberOwingAmount: 120.00,
      memberName: "Mike Rodriguez",
      dateMonth: "Jun",
      dateDay: "15"
    }
  ]
};