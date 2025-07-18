import ballerina/time;

// request payloads
public type ExpenseCreatePayload record {|
    string? expense_Id;
    string name;
    decimal expense_total_amount;       
    string? usergroupGroup_Id;
    ParticipantPayload[] participant;
|};

public enum ParticipantRole {
    CREATOR = "creator",
    MEMBER = "member",
    GUEST = "guest"
}

public type ParticipantPayload record {|
    ParticipantRole participant_role;
    decimal owning_amount;
    string? userUser_Id;
    string? firstName;
    string? lastName;
|};

// Response type for your specific need
type GroupSummary record {|
    string groupId;
    string groupName;
    string[] participantNames;
    decimal netAmount; // Positive if user owes, negative if group owes user
    time:Utc created_at;
    time:Utc updated_at;
|};


// Payload type for the request (just userId for now)
type UserIdPayload record {|
    string userId;
|};

type GroupSummaryTwo record {|
    string groupName;
    string[] participantNames;
    decimal netAmountFromGroupMembers;
    decimal netAmountFromNonGroupMembers;
|};

type ExpenseSummary record {|
    string expenseName;
    string[] participantNames;
    decimal netAmount;
    time:Utc created_at;
    time:Utc updated_at;
|};

type UserExpenseSummary record {|
    string userName;
    decimal netAmount;
|};

// Group Member Balance type definition
type GroupMemberBalance record {|
    string name;
    decimal owe_amount;
    string isMember;
|};


public type GuestUser record {|
    string firstName;
    string lastName;
|};

public type ExpenseSession record {|
    string sessionId;
    string status;
    time:Utc createdAt; 
    time:Utc expiresAt;
    GuestUser[] guestUsers;  // ✅ Embedded guest users array with structured data
|};

type ExpenseJoinInfo record {
    string sessionId;
    string expenseTitle;
    string createdBy;
    boolean isValid;
};


type GuestJoinRequest record {|
    string firstName;
    string lastName;
    string sessionId;
|};