// AUTO-GENERATED FILE. DO NOT MODIFY.

// This file is an auto-generated file by Ballerina persistence layer for model.
// It should not be modified by hand.

import ballerina/time;

public type User record {|
    readonly string user_Id;
    string? email;
    string first_name;
    string last_name;
    string? phone_number;
    string? birthdate;
    string? currency_pref;

    int status;
    time:Utc? created_at;
    time:Utc? updated_at;
|};

public type UserOptionalized record {|
    string user_Id?;
    string? email?;
    string first_name?;
    string last_name?;
    string? phone_number?;
    string? birthdate?;
    string? currency_pref?;
    int status?;
    time:Utc? created_at?;
    time:Utc? updated_at?;
|};

public type UserWithRelations record {|
    *UserOptionalized;
    FriendRequestOptionalized[] friendRequests?;
    UserGroupMemberOptionalized[] groupMembers?;
    ExpenseParticipantOptionalized[] expenseParticipants?;
    TransactionOptionalized[] transactions?;
    FriendOptionalized[] friends?;
    FriendOptionalized[] friend?;
|};

public type UserTargetType typedesc<UserWithRelations>;

public type UserInsert User;

public type UserUpdate record {|
    string? email?;
    string first_name?;
    string last_name?;
    string? phone_number?;
    string? birthdate?;
    string? currency_pref?;
    int status?;
    time:Utc? created_at?;
    time:Utc? updated_at?;
|};

public type FriendRequest record {|
    readonly string friendReq_ID;
    string send_user_idUser_Id;
    string receive_user_Id;
    string status;
    time:Utc? created_at;
    time:Utc? updated_at;
|};

public type FriendRequestOptionalized record {|
    string friendReq_ID?;
    string send_user_idUser_Id?;
    string receive_user_Id?;
    string status?;
    time:Utc? created_at?;
    time:Utc? updated_at?;
|};

public type FriendRequestWithRelations record {|
    *FriendRequestOptionalized;
    UserOptionalized send_user_Id?;
|};

public type FriendRequestTargetType typedesc<FriendRequestWithRelations>;

public type FriendRequestInsert FriendRequest;

public type FriendRequestUpdate record {|
    string send_user_idUser_Id?;
    string receive_user_Id?;
    string status?;
    time:Utc? created_at?;
    time:Utc? updated_at?;
|};

public type Friend record {|
    readonly string friend_Id;
    string user_id_1User_Id;
    string user_id_2User_Id;
    int status;
    time:Utc? created_at;
    time:Utc? updated_at;
|};

public type FriendOptionalized record {|
    string friend_Id?;
    string user_id_1User_Id?;
    string user_id_2User_Id?;
    int status?;
    time:Utc? created_at?;
    time:Utc? updated_at?;
|};

public type FriendWithRelations record {|
    *FriendOptionalized;
    UserOptionalized user_Id_1?;
    UserOptionalized user_Id_2?;
|};

public type FriendTargetType typedesc<FriendWithRelations>;

public type FriendInsert Friend;

public type FriendUpdate record {|
    string user_id_1User_Id?;
    string user_id_2User_Id?;
    int status?;
    time:Utc? created_at?;
    time:Utc? updated_at?;
|};

public type UserGroup record {|
    readonly string group_Id;
    string name;

    int status;
    time:Utc? created_at;
    time:Utc? updated_at;
|};

public type UserGroupOptionalized record {|
    string group_Id?;
    string name?;
    int status?;
    time:Utc? created_at?;
    time:Utc? updated_at?;
|};

public type UserGroupWithRelations record {|
    *UserGroupOptionalized;
    UserGroupMemberOptionalized[] groupMembers?;
    ExpenseOptionalized[] expenses?;
|};

public type UserGroupTargetType typedesc<UserGroupWithRelations>;

public type UserGroupInsert UserGroup;

public type UserGroupUpdate record {|
    string name?;
    int status?;
    time:Utc? created_at?;
    time:Utc? updated_at?;
|};

public type UserGroupMember record {|
    readonly string group_member_Id;
    string member_role;
    string groupGroup_Id;
    string userUser_Id;
    int status;
    time:Utc? created_at;
    time:Utc? updated_at;
|};

public type UserGroupMemberOptionalized record {|
    string group_member_Id?;
    string member_role?;
    string groupGroup_Id?;
    string userUser_Id?;
    int status?;
    time:Utc? created_at?;
    time:Utc? updated_at?;
|};

public type UserGroupMemberWithRelations record {|
    *UserGroupMemberOptionalized;
    UserGroupOptionalized 'group?;
    UserOptionalized user?;
|};

public type UserGroupMemberTargetType typedesc<UserGroupMemberWithRelations>;

public type UserGroupMemberInsert UserGroupMember;

public type UserGroupMemberUpdate record {|
    string member_role?;
    string groupGroup_Id?;
    string userUser_Id?;
    int status?;
    time:Utc? created_at?;
    time:Utc? updated_at?;
|};

public type Expense record {|
    readonly string expense_Id;
    string name;
    decimal expense_total_amount;
    decimal expense_owe_amount;

    string usergroupGroup_Id;
    int status;
    time:Utc? created_at;
    time:Utc? updated_at;
|};

public type ExpenseOptionalized record {|
    string expense_Id?;
    string name?;
    decimal expense_total_amount?;
    decimal expense_owe_amount?;
    string usergroupGroup_Id?;
    int status?;
    time:Utc? created_at?;
    time:Utc? updated_at?;
|};

public type ExpenseWithRelations record {|
    *ExpenseOptionalized;
    ExpenseParticipantOptionalized[] expenseParticipants?;
    TransactionOptionalized[] transactions?;
    GuestUserOptionalized[] guestUsers?;
    UserGroupOptionalized usergroup?;
|};

public type ExpenseTargetType typedesc<ExpenseWithRelations>;

public type ExpenseInsert Expense;

public type ExpenseUpdate record {|
    string name?;
    decimal expense_total_amount?;
    decimal expense_owe_amount?;
    string usergroupGroup_Id?;
    int status?;
    time:Utc? created_at?;
    time:Utc? updated_at?;
|};

public type ExpenseParticipant record {|
    readonly string participant_Id;
    string participant_role;
    decimal owning_amount;
    string expenseExpense_Id;
    string userUser_Id;
    int status;
    time:Utc? created_at;
    time:Utc? updated_at;
|};

public type ExpenseParticipantOptionalized record {|
    string participant_Id?;
    string participant_role?;
    decimal owning_amount?;
    string expenseExpense_Id?;
    string userUser_Id?;
    int status?;
    time:Utc? created_at?;
    time:Utc? updated_at?;
|};

public type ExpenseParticipantWithRelations record {|
    *ExpenseParticipantOptionalized;
    ExpenseOptionalized expense?;
    UserOptionalized user?;
|};

public type ExpenseParticipantTargetType typedesc<ExpenseParticipantWithRelations>;

public type ExpenseParticipantInsert ExpenseParticipant;

public type ExpenseParticipantUpdate record {|
    string participant_role?;
    decimal owning_amount?;
    string expenseExpense_Id?;
    string userUser_Id?;
    int status?;
    time:Utc? created_at?;
    time:Utc? updated_at?;
|};

public type Transaction record {|
    readonly string transaction_Id;
    decimal payed_amount;
    string expenseExpense_Id;
    string payee_idUser_Id;
    int status;
    time:Utc? created_at;
    time:Utc? updated_at;
|};

public type TransactionOptionalized record {|
    string transaction_Id?;
    decimal payed_amount?;
    string expenseExpense_Id?;
    string payee_idUser_Id?;
    int status?;
    time:Utc? created_at?;
    time:Utc? updated_at?;
|};

public type TransactionWithRelations record {|
    *TransactionOptionalized;
    ExpenseOptionalized expense?;
    UserOptionalized payee_Id?;
|};

public type TransactionTargetType typedesc<TransactionWithRelations>;

public type TransactionInsert Transaction;

public type TransactionUpdate record {|
    decimal payed_amount?;
    string expenseExpense_Id?;
    string payee_idUser_Id?;
    int status?;
    time:Utc? created_at?;
    time:Utc? updated_at?;
|};

public type BankAccount record {|
    readonly string account_Id;
    string account_no;
    string bank;
    string branch;

    int status;
    time:Utc? created_at;
    time:Utc? updated_at;
|};

public type BankAccountOptionalized record {|
    string account_Id?;
    string account_no?;
    string bank?;
    string branch?;
    int status?;
    time:Utc? created_at?;
    time:Utc? updated_at?;
|};

public type BankAccountWithRelations record {|
    *BankAccountOptionalized;
    CardOptionalized[] cards?;
|};

public type BankAccountTargetType typedesc<BankAccountWithRelations>;

public type BankAccountInsert BankAccount;

public type BankAccountUpdate record {|
    string account_no?;
    string bank?;
    string branch?;
    int status?;
    time:Utc? created_at?;
    time:Utc? updated_at?;
|};

public type Card record {|
    readonly string card_Id;
    string card_no;
    string card_name;
    string card_expiry;
    string card_cv;
    string bankaccountAccount_Id;
    int status;
    time:Utc? created_at;
    time:Utc? updated_at;
|};

public type CardOptionalized record {|
    string card_Id?;
    string card_no?;
    string card_name?;
    string card_expiry?;
    string card_cv?;
    string bankaccountAccount_Id?;
    int status?;
    time:Utc? created_at?;
    time:Utc? updated_at?;
|};

public type CardWithRelations record {|
    *CardOptionalized;
    BankAccountOptionalized bankAccount?;
|};

public type CardTargetType typedesc<CardWithRelations>;

public type CardInsert Card;

public type CardUpdate record {|
    string card_no?;
    string card_name?;
    string card_expiry?;
    string card_cv?;
    string bankaccountAccount_Id?;
    int status?;
    time:Utc? created_at?;
    time:Utc? updated_at?;
|};

public type GuestUser record {|
    readonly string guest_user_id;
    string guest_name;
    string expenseExpense_Id;
    decimal owning_amount;
    int status;
|};

public type GuestUserOptionalized record {|
    string guest_user_id?;
    string guest_name?;
    string expenseExpense_Id?;
    decimal owning_amount?;
    int status?;
|};

public type GuestUserWithRelations record {|
    *GuestUserOptionalized;
    ExpenseOptionalized expense?;
|};

public type GuestUserTargetType typedesc<GuestUserWithRelations>;

public type GuestUserInsert GuestUser;

public type GuestUserUpdate record {|
    string guest_name?;
    string expenseExpense_Id?;
    decimal owning_amount?;
    int status?;
|};

