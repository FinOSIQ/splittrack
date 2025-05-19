import ballerina/persist as _;

public type User record {|
    readonly string user_Id;
    string email;
    string first_name;
    string last_name;
    string phone_number;
    string birthdate;
    string currency_pref;
    FriendRequest[] friendRequests;
    UserGroupMember[] groupMembers;
    ExpenseParticipant[] expenseParticipants;
    Transaction[] transactions;
    Friend[] friends;
	Friend[] friend;
    int status
|};

public type FriendRequest record {|
    readonly string friendReq_ID;
    User send_user_Id;
    string receive_user_Id;
    string status;
|};

public type Friend record {|
    readonly string friend_Id;
    User user_Id_1;
    User user_Id_2;
    int status
|};

public type UserGroup record {|
    readonly string group_Id;
    string name;
    UserGroupMember[] groupMembers;
    Expense[] expenses;
    int status
|};

public type UserGroupMember record {|
    readonly string group_member_Id;
    string member_role;
    UserGroup group;
    User user;
    int status
|};

public type Expense record {|
    readonly string expense_Id;
    string name;
    decimal expense_total_amount;
    decimal expense_owe_amount;
    ExpenseParticipant[] expenseParticipants;
    Transaction[] transactions;
	UserGroup usergroup;
    int status
|};

public type ExpenseParticipant record {|
    readonly string participant_Id;
    string participant_role;
    decimal owning_amount;
    Expense expense;
    User user;
    int status
|};

public type Transaction record {|
    readonly string transaction_Id;
    decimal payed_amount;
	Expense expense;
	User payee_Id;
    int status
|};


public type BankAccount record {|
    readonly string account_Id;
    string account_no;
    string bank;
    string branch;
    Card[] cards;
    int status
|};

public type Card record {|
    readonly string card_Id;
    string card_no;
    string card_name;
    string card_expiry;
    string card_cv;
    BankAccount bankAccount;
    int status
|};