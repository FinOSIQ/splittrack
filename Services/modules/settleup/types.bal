// Response types for settle up APIs

// Response for users who owe money to the current user
public type OwesToMeResponse record {|
    string userId;
    string userName;
    string email;
    decimal totalOwingAmount;
|};

// Response for users to whom the current user owes money
public type IOweResponse record {|
    string userId;
    string userName;
    string email;
    decimal totalOwingAmount;
|};

// Response for detailed individual expenses with a specific creator
public type ExpenseDetailResponse record {|
    string expenseId;
    string expenseName;
    decimal expenseTotalAmount;
    decimal userOwingAmount;
    string creatorName;
|};

// Response for detailed individual expenses where current user is creator and specific member owes money
public type OwesToMeDetailResponse record {|
    string expenseId;
    string expenseName;
    decimal expenseTotalAmount;
    decimal memberOwingAmount;
    string memberName;
|};

// Payload for settle up API
public type SettleUpPayload record {|
    PaymentItem[] payments;
|};

// Individual payment item in settle up request
public type PaymentItem record {|
    string expenseId;
    decimal paymentAmount;
|};

// Result for each payment processed
public type SettleUpResult record {|
    string expenseId;
    decimal paymentAmount;
    decimal previousOwingAmount;
    decimal newOwingAmount;
    boolean isFullyPaid;
|};
