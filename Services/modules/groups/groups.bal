import splittrack_backend.db as db;
import splittrack_backend.utils;

import ballerina/http;
import ballerina/io;
// import ballerina/io;

import ballerina/persist;
import ballerina/sql;
import ballerina/time;
import ballerina/uuid;

// import ballerina/io; 
// import ballerina/sql;

type GroupResponse record {|
    json|error group?;
    json|error members?;
|};

// Type definition for the response
public type GroupMemberBalanceSummary record {|
    string userId;
    string name;
    string email;
    decimal amount; // Positive = they owe you, Negative = you owe them, Zero = even/no transactions
|};

final db:Client dbClient = check new ();

// HTTP Service for Group CRUD Operations
public function getGroupService() returns http:Service {

    return @http:ServiceConfig {
        cors: {
            allowOrigins: ["http://localhost:5173"], // Your frontend origin
            allowMethods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
            allowHeaders: ["Content-Type", "Authorization"],
            allowCredentials: true,
            maxAge: 3600
        }
    }
    service object {

        // CREATE: Add a new group with optional initial members
        resource function post groups(http:Caller caller, http:Request req) returns error? {

            json payload = check req.getJsonPayload();

            json|error nameJson = payload.name;
            if nameJson is error || nameJson is () {
                return utils:sendErrorResponse(caller, http:STATUS_BAD_REQUEST, "Missing 'name' field");
            }
            string name = nameJson.toString();

            json?|error members = payload.members is json ? payload.members : ();
            if members is error || !(members is json[]) {
                return utils:sendErrorResponse(caller, http:STATUS_BAD_REQUEST, "Invalid 'members' field", "Expected an array of members");
            }

            // Insert group
            string group_Id = uuid:createType4AsString();
            time:Utc currentTime = time:utcNow();
            db:UserGroupInsert[] group = [
                {
                    group_Id: group_Id,
                    name: name,
                    status: 1,
                    created_at: currentTime,
                    updated_at: currentTime
                }
            ];
            transaction {
                _ = check dbClient->/usergroups.post(group);

                // Insert members if provided
                db:UserGroupMemberInsert[] memberResults = [];

                boolean hasCreator = false;
                foreach json member in members {
                    json|error userIdJson = member.userId;
                    json|error roleJson = member.role;

                    if userIdJson is error || userIdJson is () {
                        fail error("Missing or invalid 'userId' in member", statusCode = http:STATUS_BAD_REQUEST);

                    }
                    if roleJson is error || roleJson is () {
                        fail error("Missing or invalid 'role' in member", statusCode = http:STATUS_BAD_REQUEST);
                    }

                    string userId = userIdJson.toString();
                    string role = roleJson.toString();
                    string groupMemberId = uuid:createType4AsString();

                    if role != "creator" && role != "member" {
                        fail error("Role must be 'creator' or 'member', got '" + role + "'", statusCode = http:STATUS_BAD_REQUEST);
                    }

                    if role == "creator" {
                        if hasCreator {
                            fail error("Multiple 'creator' roles are not allowed", statusCode = http:STATUS_BAD_REQUEST);
                        }
                        hasCreator = true;
                    }

                    memberResults.push({
                        group_member_Id: groupMemberId,
                        userUser_Id: userId,
                        member_role: role,
                        groupGroup_Id: group_Id,
                        status: 1,
                        created_at: currentTime,
                        updated_at: currentTime
                    });
                }

                if memberResults.length() > 0 {
                    _ = check dbClient->/usergroupmembers.post(memberResults);
                }
                check commit;

            } on fail error e {
                // Transaction failed (rolled back automatically)
                int statusCode = e.detail().hasKey("statusCode")
                    ? check e.detail().get("statusCode").ensureType(int)
                    : http:STATUS_INTERNAL_SERVER_ERROR;
                return utils:sendErrorResponse(caller, statusCode, "Failed to update group", e.message());

            }

            http:Response res = new;
            res.statusCode = http:STATUS_CREATED; // 201
            res.setJsonPayload(group);
            check caller->respond(res);

        }

        // READ: Get group details and its members
        resource function get groups/[string groupId](http:Caller caller, http:Request req) returns error? {

            db:UserGroupWithRelations|error groupDetails = dbClient->/usergroups/[groupId]();
            if groupDetails is error {
                // Check if the error is a "not found" error
                if groupDetails is persist:NotFoundError {
                    _ = check utils:sendErrorResponse(caller, http:STATUS_NOT_FOUND, "Group not found", "Group with ID " + groupId + " does not exist");
                    return;
                }
                // Other database errors
                return utils:sendErrorResponse(caller, http:STATUS_INTERNAL_SERVER_ERROR, groupDetails.toString());
            }
            http:Response res = new;
            json payload = {
                "group": groupDetails
            };
            res.setJsonPayload(payload);
            res.statusCode = http:STATUS_OK;
            return caller->respond(res);

        }

        resource function put groups/[string groupId](http:Caller caller, http:Request req) returns error?|http:Response {
            json payload = check req.getJsonPayload();

            // Validate and extract name (optional)
            json|error nameJson = payload.name;
            string? name = ();
            if nameJson is error || nameJson is () {
                return utils:sendErrorResponse(caller, http:STATUS_BAD_REQUEST, "Invalid or missing 'name' field");
            }
            name = nameJson.toString();

            // Validate and extract members (optional)
            json?|error membersJson = payload.members;
            json[]? members = ();
            if membersJson is error || (membersJson !is () && membersJson !is json[]) {
                return utils:sendErrorResponse(caller, http:STATUS_BAD_REQUEST, "Invalid 'members' field", "Expected an array of members");
            } else if membersJson is json[] {
                members = membersJson;
            }

            // Check if group exists
            db:UserGroupWithRelations|error groupCheck = dbClient->/usergroups/[groupId]();
            if groupCheck is error {
                if groupCheck is persist:NotFoundError {
                    return utils:sendErrorResponse(caller, http:STATUS_NOT_FOUND, "Group not found", "Group with ID " + groupId + " does not exist");
                }
                return utils:sendErrorResponse(caller, http:STATUS_INTERNAL_SERVER_ERROR, groupCheck.toString());
            }

            transaction {
                // Update group name if provided
                if name is string {
                    db:UserGroupUpdate groupUpdate = {name: name};
                    _ = check dbClient->/usergroups/[groupId].put(groupUpdate);
                }

                // Update members using delete and replace if provided
                if members is json[] {

                    // Delete all existing members

                    // io:println("Deleting all members for groupId: ", groupId);
                    sql:ParameterizedQuery deleteMembersQuery = `DELETE FROM usergroupmember WHERE groupGroup_Id = ${groupId} AND member_role != 'creator'`;
                    io:println("Delete members query: ", deleteMembersQuery);
                    sql:ExecutionResult deleteResult = check dbClient->executeNativeSQL(deleteMembersQuery);
                    io:println("Deleted rows: ", deleteResult.affectedRowCount);

                    // Insert new members
                    time:Utc memberCurrentTime = time:utcNow();
                    db:UserGroupMemberInsert[] toInsert = [];
                    foreach json member in members {
                        json|error userIdJson = member.userId;
                        json|error roleJson = member.role;

                        if userIdJson is error || userIdJson is () {
                            fail error("Missing or invalid 'userId' in member", statusCode = http:STATUS_BAD_REQUEST);
                        }
                        if roleJson is error || roleJson is () {
                            fail error("Missing or invalid 'role' in member", statusCode = http:STATUS_BAD_REQUEST);
                        }

                        string userId = userIdJson.toString();
                        string role = roleJson.toString();
                        string groupMemberId = uuid:createType4AsString();

                        if role === "creator" {
                            fail error("Cannot alter creator role", statusCode = http:STATUS_BAD_REQUEST);
                        }

                        if role != "member" {
                            fail error("Role must be 'member', got '" + role + "'", statusCode = http:STATUS_BAD_REQUEST);
                        }

                        toInsert.push({
                            group_member_Id: groupMemberId,
                            userUser_Id: userId,
                            member_role: role,
                            groupGroup_Id: groupId,
                            status: 1,
                            created_at: memberCurrentTime,
                            updated_at: memberCurrentTime
                        });
                    }

                    if toInsert.length() > 0 {
                        _ = check dbClient->/usergroupmembers.post(toInsert);
                    }
                }

                check commit;
            } on fail error e {
                int statusCode = e.detail().hasKey("statusCode")
                    ? check e.detail().get("statusCode").ensureType(int)
                    : http:STATUS_INTERNAL_SERVER_ERROR;
                return utils:sendErrorResponse(caller, statusCode, "Failed to update group", e.message());
            }

            // Fetch updated group details for response
            db:UserGroupWithRelations|error updatedGroup = dbClient->/usergroups/[groupId]();
            if updatedGroup is error {
                return utils:sendErrorResponse(caller, http:STATUS_INTERNAL_SERVER_ERROR, updatedGroup.toString());
            }

            http:Response res = new;
            res.statusCode = http:STATUS_OK; // 200
            res.setJsonPayload({"group": updatedGroup});
            return res;
        }

        // // DELETE: Remove a group and its members
        resource function delete groups/[string groupId](http:Caller caller, http:Request req) returns error? {
            transaction {
                // Delete members first (due to foreign key constraints)
                sql:ParameterizedQuery deleteMembersQuery = `DELETE FROM usergroupmember WHERE groupGroup_Id = ${groupId}`;
                _ = check dbClient->executeNativeSQL(deleteMembersQuery);

                // Delete group

                // TODO: doesn't work with maria DB - discus standard alterative
                db:UserGroup|persist:Error deleteResult = dbClient->/usergroups/[groupId].delete();

                if deleteResult is persist:NotFoundError {
                    fail error("Group with ID " + groupId + " does not exist", statusCode = http:STATUS_NOT_FOUND);
                } else if deleteResult is persist:Error {
                    fail error(deleteResult.message(), statusCode = http:STATUS_INTERNAL_SERVER_ERROR);
                }

                http:Response res = new;
                res.statusCode = http:STATUS_OK; // 200 OK
                res.setJsonPayload({"status": "success", "groupId": groupId});
                check caller->respond(res);
                check commit;
            } on fail error e {
                // Transaction failed (rolled back automatically)
                int statusCode = e.detail().hasKey("statusCode")
                    ? check e.detail().get("statusCode").ensureType(int)
                    : http:STATUS_INTERNAL_SERVER_ERROR;
                return utils:sendErrorResponse(caller, statusCode, "Failed to delete group", e.message());
            }
        }

        resource function get groupDetails/[string groupId](http:Caller caller, http:Request req) returns error? {
            // Extract user ID from cookie for role determination
            string? currentUserId = utils:getCookieValue(req, "user_id");
            if currentUserId == () {
                return utils:sendErrorResponse(
                        caller,
                        http:STATUS_BAD_REQUEST,
                        "Invalid 'user_id' cookie",
                        "Expected a valid 'user_id' cookie"
                );
            }

            // First check if group exists
            db:UserGroup|error groupBase = dbClient->/usergroups/[groupId];
            if groupBase is error {
                if groupBase is persist:NotFoundError {
                    return utils:sendErrorResponse(
                            caller,
                            http:STATUS_NOT_FOUND,
                            "Group not found",
                            "Group with ID " + groupId + " does not exist"
                    );
                }
                return utils:sendErrorResponse(
                        caller,
                        http:STATUS_INTERNAL_SERVER_ERROR,
                        groupBase.toString()
                );
            }

            // Get group members - ensure participants array is initialized 
            json[] participants = [];

            sql:ParameterizedQuery membersQuery = `
        SELECT 
            ugm.group_member_Id, 
            ugm.member_role,
            ugm.userUser_Id,
            u.first_name,
            u.last_name
        FROM 
            UserGroupMember ugm
        JOIN 
            User u ON ugm.userUser_Id = u.user_Id
        WHERE 
            ugm.groupGroup_Id = ${groupId} AND ugm.status = 1
    `;

            stream<record {|
                string group_member_Id;
                string member_role;
                string userUser_Id;
                string first_name;
                string last_name;
            |}, error?> membersStream = utils:Client->query(membersQuery);

            // Use forEach instead of query expression to avoid null pointer
            error? e1 = membersStream.forEach(function(record {|
                        string group_member_Id;
                        string member_role;
                        string userUser_Id;
                        string first_name;
                        string last_name;
                    |} member) {
                participants.push({
                    "group_member_Id": member.group_member_Id,
                    "member_role": member.member_role,
                    "userUser_Id": member.userUser_Id,
                    "first_name": member.first_name,
                    "last_name": member.last_name
                });
            });

            if e1 is error {
                io:println("Error in expensesStream.forEach: ", e1.toString());
            }

            // Get expenses - ensure expenses array is initialized
            json[] expenses = [];

            sql:ParameterizedQuery expensesQuery = `
        SELECT 
            e.expense_Id,
            e.name,
            e.expense_total_amount,
            e.expense_owe_amount,
            e.usergroupGroup_Id,
            e.status,
            e.created_at,
            e.updated_at
        FROM 
            Expense e
        WHERE 
            e.usergroupGroup_Id = ${groupId} AND e.status = 1
    `;

            stream<record {|
                string expense_Id;
                string name;
                decimal expense_total_amount;
                decimal expense_owe_amount;
                string usergroupGroup_Id;
                int status;
                time:Utc? created_at;
                time:Utc? updated_at;
            |}, error?> expensesStream = utils:Client->query(expensesQuery);

            // Use forEach instead of query expression to avoid null pointer
            error? e2 = expensesStream.forEach(function(record {|
                        string expense_Id;
                        string name;
                        decimal expense_total_amount;
                        decimal expense_owe_amount;
                        string usergroupGroup_Id;
                        int status;
                        time:Utc? created_at;
                        time:Utc? updated_at;
                    |} expense) {
                // For each expense, get participants - ensure expParticipants array is initialized
                json[] expParticipants = [];

                sql:ParameterizedQuery participantsQuery = `
            SELECT 
                ep.participant_Id,
                ep.participant_role,
                ep.owning_amount,
                ep.userUser_Id
            FROM 
                ExpenseParticipant ep
            WHERE 
                ep.expenseExpense_Id = ${expense.expense_Id} AND ep.status = 1
        `;

                stream<record {|
                    string participant_Id;
                    string participant_role;
                    decimal owning_amount;
                    string userUser_Id;
                |}, error?> expParticipantsStream = utils:Client->query(participantsQuery);

                // Use forEach instead of query expression to avoid null pointer
                error? e3 = expParticipantsStream.forEach(function(record {|
                            string participant_Id;
                            string participant_role;
                            decimal owning_amount;
                            string userUser_Id;
                        |} part) {
                    // Check if this participant is the current user
                    string role = part.participant_role;
                    if (part.userUser_Id == currentUserId) {
                        role = "self"; // Mark the current user
                    }

                    expParticipants.push({
                        "participant_role": role,
                        "owning_amount": part.owning_amount,
                        "userUser_Id": part.userUser_Id
                    });
                });
                if e3 is error {
                    io:println("Error in expParticipantsStream.forEach: ", e3.toString());
                }

                // Get transactions for this expense
                json[] expenseTransactions = [];

                sql:ParameterizedQuery transactionsQuery = `
            SELECT 
                t.transaction_Id,
                t.payed_amount,
                t.payee_IdUser_Id,
                t.status,
                t.created_at,
                t.updated_at,
                u.first_name,
                u.last_name
            FROM 
                Transaction t
            JOIN 
                User u ON t.payee_IdUser_Id = u.user_Id
            WHERE 
                t.expenseExpense_Id = ${expense.expense_Id} AND t.status = 1
        `;

                stream<record {|
                    string transaction_Id;
                    decimal payed_amount;
                    string payee_IdUser_Id;
                    int status;
                    time:Utc? created_at;
                    time:Utc? updated_at;
                    string first_name;
                    string last_name;
                |}, error?> transactionsStream = utils:Client->query(transactionsQuery);

                // Use forEach instead of query expression to avoid null pointer
                error? e4 = transactionsStream.forEach(function(record {|
                            string transaction_Id;
                            decimal payed_amount;
                            string payee_IdUser_Id;
                            int status;
                            time:Utc? created_at;
                            time:Utc? updated_at;
                            string first_name;
                            string last_name;
                        |} txn) {

                    expenseTransactions.push({
                        "transaction_Id": txn.transaction_Id,
                        "payed_amount": txn.payed_amount,
                        "payee_IdUser_Id": txn.payee_IdUser_Id,
                        "payee_name": txn.first_name + " " + txn.last_name,
                        "status": txn.status,
                        "created_at": txn.created_at,
                        "updated_at": txn.updated_at
                    });
                });
                if e4 is error {
                    io:println("Error in transactionsStream.forEach: ", e4.toString());
                }

                expenses.push({
                    "expense_Id": expense.expense_Id,
                    "name": expense.name,
                    "expense_total_amount": expense.expense_total_amount,
                    "expense_owe_amount": expense.expense_owe_amount,
                    "usergroupGroup_Id": expense.usergroupGroup_Id,
                    "status": expense.status,
                    "created_at": expense.created_at,
                    "updated_at": expense.updated_at,
                    "participant": expParticipants,
                    "transactions": expenseTransactions
                });
            });
            if e2 is error {
                io:println("Error in expensesStream.forEach: ", e2.toString());
            }

            // Format the final response to match the required structure
            json responseDetails = {
                "group_Id": groupId,
                "name": groupBase.name,
                "status": groupBase.status,
                "created_at": groupBase.created_at,
                "updated_at": groupBase.updated_at,
                "groupMembers": participants,
                "expenses": expenses
            };

            json response = {
                "group": responseDetails
            };

            http:Response res = new;
            res.setJsonPayload(response);
            res.statusCode = http:STATUS_OK;
            return caller->respond(res);
        }

        resource function get groupBalance/[string groupId](http:Caller caller, http:Request req) returns error? {
            // Extract user ID from cookie
            string? currentUserId = utils:getCookieValue(req, "user_id");
            if currentUserId == () {
                return utils:sendErrorResponse(
                        caller,
                        http:STATUS_BAD_REQUEST,
                        "Invalid 'user_id' cookie",
                        "Expected a valid 'user_id' cookie"
                );
            }

            // First check if group exists
            db:UserGroup|error groupBase = dbClient->/usergroups/[groupId];
            if groupBase is error {
                if groupBase is persist:NotFoundError {
                    return utils:sendErrorResponse(
                            caller,
                            http:STATUS_NOT_FOUND,
                            "Group not found",
                            "Group with ID " + groupId + " does not exist"
                    );
                }
                return utils:sendErrorResponse(
                        caller,
                        http:STATUS_INTERNAL_SERVER_ERROR,
                        groupBase.toString()
                );
            }

            // Find all expenses where the current user is the creator (positive amounts)
            sql:ParameterizedQuery positiveQuery = `
        SELECT 
            e.expense_Id,
            e.name,
            e.expense_owe_amount
        FROM 
            Expense e
        JOIN 
            ExpenseParticipant ep ON e.expense_Id = ep.expenseExpense_Id
        WHERE 
            e.usergroupGroup_Id = ${groupId}
            AND ep.userUser_Id = ${currentUserId}
            AND ep.participant_role = 'Creator'
            AND e.status = 1
            AND ep.status = 1
    `;

            stream<record {|
                string expense_Id;
                string name;
                decimal expense_owe_amount;
            |}, error?> positiveStream = utils:Client->query(positiveQuery);

            decimal totalPositive = 0;
            json[] positiveExpenses = [];

            error? e1 = positiveStream.forEach(function(record {|
                        string expense_Id;
                        string name;
                        decimal expense_owe_amount;
                    |} expense) {
                totalPositive += expense.expense_owe_amount;
                positiveExpenses.push({
                    "expense_Id": expense.expense_Id,
                    "name": expense.name,
                    "amount": expense.expense_owe_amount
                });
            });

            if e1 is error {
                io:println("Error in expParticipantsStream.forEach: ", e1.toString());
            }

            // Find all expenses where the current user is a member (negative amounts)
            sql:ParameterizedQuery negativeQuery = `
        SELECT 
            e.expense_Id,
            e.name,
            ep.owning_amount
        FROM 
            Expense e
        JOIN 
            ExpenseParticipant ep ON e.expense_Id = ep.expenseExpense_Id
        WHERE 
            e.usergroupGroup_Id = ${groupId}
            AND ep.userUser_Id = ${currentUserId}
            AND ep.participant_role != 'Creator'
            AND e.status = 1
            AND ep.status = 1
    `;

            stream<record {|
                string expense_Id;
                string name;
                decimal owning_amount;
            |}, error?> negativeStream = utils:Client->query(negativeQuery);

            decimal totalNegative = 0;
            json[] negativeExpenses = [];

            error? e2 = negativeStream.forEach(function(record {|
                        string expense_Id;
                        string name;
                        decimal owning_amount;
                    |} expense) {
                // Take the negative of the owning amount since this is what the user owes
                decimal negativeAmount = -1 * expense.owning_amount;
                totalNegative += negativeAmount;
                negativeExpenses.push({
                    "expense_Id": expense.expense_Id,
                    "name": expense.name,
                    "amount": negativeAmount
                });
            });

            if e2 is error {
                io:println("Error in expParticipantsStream.forEach: ", e2.toString());
            }

            // Calculate the total balance
            decimal totalBalance = totalPositive + totalNegative;

            // Create the response
            json response = {
                "group_Id": groupId,
                "group_name": groupBase.name,
                "user_Id": currentUserId,
                "total_balance": totalBalance,
                "total_positive": totalPositive,
                "total_negative": totalNegative,
                "positive_expenses": positiveExpenses,
                "negative_expenses": negativeExpenses
            };

            http:Response res = new;
            res.setJsonPayload(response);
            res.statusCode = http:STATUS_OK;
            return caller->respond(res);
        }

        // API endpoint to get group member balance summary for the current user
        resource function get groupMemberBalanceSummary/[string groupId](http:Caller caller, http:Request req) returns error? {
            http:Response response = new;

            // Get current user ID from cookie
            string? currentUserId = utils:getCookieValue(req, "user_id");
            if currentUserId == () {
                return utils:sendErrorResponse(
                        caller,
                        http:STATUS_BAD_REQUEST,
                        "Invalid 'user_id' cookie",
                        "Expected a valid 'user_id' cookie"
                );
            }

            // Verify the group exists and user is a member
            db:UserGroupWithRelations|persist:Error groupResult = dbClient->/usergroups/[groupId];
            if groupResult is persist:NotFoundError {
                response.statusCode = http:STATUS_NOT_FOUND;
                response.setJsonPayload({"status": "error", "message": "Group not found"});
                check caller->respond(response);
                return;
            } else if groupResult is persist:Error {
                response.statusCode = http:STATUS_INTERNAL_SERVER_ERROR;
                response.setJsonPayload({"status": "error", "message": "Database error"});
                check caller->respond(response);
                return;
            }

            // Verify current user is a member of this group
            stream<db:UserGroupMember, persist:Error?> userMembershipStream = dbClient->/usergroupmembers(
                whereClause = sql:queryConcat(`groupGroup_Id = ${groupId} AND userUser_Id = ${currentUserId}`)
            );
            db:UserGroupMember[]|persist:Error userMembership = from var member in userMembershipStream
                select member;

            if userMembership is persist:Error {
                response.statusCode = http:STATUS_INTERNAL_SERVER_ERROR;
                response.setJsonPayload({"status": "error", "message": "Failed to verify membership"});
                check caller->respond(response);
                return;
            }

            if userMembership.length() == 0 {
                response.statusCode = http:STATUS_FORBIDDEN;
                response.setJsonPayload({"status": "error", "message": "User is not a member of this group"});
                check caller->respond(response);
                return;
            }

            // Get all group members
            stream<db:UserGroupMember, persist:Error?> groupMembersStream = dbClient->/usergroupmembers(
                whereClause = sql:queryConcat(`groupGroup_Id = ${groupId}`)
            );
            db:UserGroupMember[]|persist:Error groupMembersResult = from var member in groupMembersStream
                select member;

            if groupMembersResult is persist:Error {
                response.statusCode = http:STATUS_INTERNAL_SERVER_ERROR;
                response.setJsonPayload({"status": "error", "message": "Failed to fetch group members"});
                check caller->respond(response);
                return;
            }

            db:UserGroupMember[] groupMembers = groupMembersResult;

            // Get all expenses for this group
            stream<db:Expense, persist:Error?> expensesStream = dbClient->/expenses(
                whereClause = sql:queryConcat(`usergroupGroup_Id = ${groupId}`)
            );
            db:Expense[]|persist:Error expensesResult = from var expense in expensesStream
                select expense;

            if expensesResult is persist:Error {
                response.statusCode = http:STATUS_INTERNAL_SERVER_ERROR;
                response.setJsonPayload({"status": "error", "message": "Failed to fetch expenses"});
                check caller->respond(response);
                return;
            }

            db:Expense[] expenses = expensesResult;

            // Calculate balances between current user and each other member
            map<decimal> memberBalances = {};

            foreach db:Expense expense in expenses {
                // Get all participants for this expense
                stream<db:ExpenseParticipant, persist:Error?> participantsStream = dbClient->/expenseparticipants(
                    whereClause = sql:queryConcat(`expenseExpense_Id = ${expense.expense_Id}`)
                );
                db:ExpenseParticipant[]|persist:Error participantsResult = from var participant in participantsStream
                    select participant;

                if participantsResult is persist:Error {
                    response.statusCode = http:STATUS_INTERNAL_SERVER_ERROR;
                    response.setJsonPayload({"status": "error", "message": "Failed to fetch expense participants"});
                    check caller->respond(response);
                    return;
                }

                db:ExpenseParticipant[] participants = participantsResult;

                // Find creator and current user's participation
                string? creatorId = ();
                db:ExpenseParticipant? currentUserParticipation = ();

                foreach db:ExpenseParticipant participant in participants {
                    if participant.participant_role == "creator" || participant.participant_role == "Creator" {
                        creatorId = participant.userUser_Id;
                    }
                    if participant.userUser_Id == currentUserId {
                        currentUserParticipation = participant;
                    }
                }

                // Skip if current user is not part of this expense
                if currentUserParticipation is () {
                    continue;
                }

                if creatorId is string {
                    if creatorId == currentUserId {
                        // Current user is the creator - others owe them
                        foreach db:ExpenseParticipant participant in participants {
                            if participant.userUser_Id != currentUserId {
                                string otherUserId = participant.userUser_Id;
                                decimal currentBalance = memberBalances.hasKey(otherUserId) ?
                                    memberBalances.get(otherUserId) : 0d;
                                memberBalances[otherUserId] = currentBalance + participant.owning_amount;
                            }
                        }
                    } else {
                        // Someone else is the creator - current user owes them
                        decimal currentBalance = memberBalances.hasKey(creatorId) ?
                            memberBalances.get(creatorId) : 0d;
                        memberBalances[creatorId] = currentBalance - currentUserParticipation.owning_amount;
                    }
                }
            }

            // Build response with member details - Include ALL group members
            GroupMemberBalanceSummary[] memberSummaries = [];

            foreach db:UserGroupMember member in groupMembers {
                if member.userUser_Id != currentUserId {
                    // Get user details
                    db:UserWithRelations|persist:Error userResult = dbClient->/users/[member.userUser_Id];

                    if userResult is db:UserWithRelations {
                        // Get balance for this member (0 if no transactions exist)
                        decimal balance = memberBalances.hasKey(member.userUser_Id) ?
                            memberBalances.get(member.userUser_Id) : 0d;

                        string firstName = userResult.first_name ?: "";
                        string lastName = userResult.last_name ?: "";
                        string email = userResult?.email ?: "";

                        memberSummaries.push({
                            userId: member.userUser_Id,
                            name: firstName + " " + lastName,
                            email: email,
                            amount: balance // Will be 0 if no expenses involve this member
                        });
                    } else {
                        // Still include the member even if user details fetch fails
                        memberSummaries.push({
                            userId: member.userUser_Id,
                            name: "Unknown User",
                            email: "",
                            amount: memberBalances.hasKey(member.userUser_Id) ?
                                memberBalances.get(member.userUser_Id) : 0d
                        });
                    }
                }
            }

            // Create response
            json responsePayload = {
                "status": "success",
                "message": "Group member balance summary retrieved successfully",
                "groupId": groupId,
                "groupName": (groupResult is db:UserGroupWithRelations) ? (groupResult.name ?: "") : "",
                "members": memberSummaries
            };

            response.setJsonPayload(responsePayload);
            response.statusCode = http:STATUS_OK;
            check caller->respond(response);
            return;
        }

    };
}

