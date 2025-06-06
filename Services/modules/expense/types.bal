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
    MEMBER = "member"
}

public type ParticipantPayload record {|
    ParticipantRole participant_role;
    decimal owning_amount;
    string userUser_Id;
|};

// Response type for your specific need
type GroupSummary record {|
    string groupId;
    string groupName;
    string[] participantNames;
    decimal netAmount; // Positive if user owes, negative if group owes user
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
