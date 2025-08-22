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

// Get frontend URL from config
configurable string frontendUrl = ?;

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
            allowOrigins: [frontendUrl], // Frontend URL from config
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

                    // Get current creator before deleting members
                    sql:ParameterizedQuery getCurrentCreatorQuery = `SELECT userUser_Id FROM usergroupmember WHERE groupGroup_Id = ${groupId} AND member_role = 'creator'`;
                    stream<record {| string userUser_Id; |}, error?> creatorStream = utils:Client->query(getCurrentCreatorQuery);
                    string? currentCreatorId = ();
                    
                    error? creatorError = creatorStream.forEach(function(record {| string userUser_Id; |} creator) {
                        currentCreatorId = creator.userUser_Id;
                    });
                    
                    if creatorError is error {
                        io:println("Error getting current creator: ", creatorError.toString());
                    }

                    // Delete all existing members except creator
                    sql:ParameterizedQuery deleteMembersQuery = `DELETE FROM usergroupmember WHERE groupGroup_Id = ${groupId} AND member_role != 'creator'`;
                  
                    _= check dbClient->executeNativeSQL(deleteMembersQuery);
                    

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
                            // Check if trying to change creator to a different user
                            if currentCreatorId is string && currentCreatorId != userId {
                                fail error("Cannot change creator to a different user", statusCode = http:STATUS_BAD_REQUEST);
                            }
                            // Skip inserting creator if it's the same user (already exists)
                            if currentCreatorId is string && currentCreatorId == userId {
                                continue;
                            }
                        }

                        if role != "member" && role != "creator" {
                            fail error("Role must be 'member' or 'creator', got '" + role + "'", statusCode = http:STATUS_BAD_REQUEST);
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

        // DELETE: Remove a group and its members (only if no expenses exist)
        resource function delete groups/[string groupId](http:Caller caller, http:Request req) returns error? {
            // First check if group exists
            sql:ParameterizedQuery checkGroupQuery = `SELECT group_Id, name FROM UserGroup WHERE group_Id = ${groupId} AND status = 1`;
            stream<record {| string group_Id; string name; |}, error?> groupStream = utils:Client->query(checkGroupQuery);
            
            boolean groupExists = false;
            string groupName = "";
            error? groupError = groupStream.forEach(function(record {| string group_Id; string name; |} group) {
                groupExists = true;
                groupName = group.name;
            });
            
            if groupError is error {
                return utils:sendErrorResponse(caller, http:STATUS_INTERNAL_SERVER_ERROR, "Failed to check group existence", groupError.toString());
            }
            
            if !groupExists {
                return utils:sendErrorResponse(caller, http:STATUS_NOT_FOUND, "Group not found", "Group with ID " + groupId + " does not exist");
            }

            // Check if group has any related expenses
            sql:ParameterizedQuery checkExpensesQuery = `SELECT COUNT(*) as expense_count FROM Expense WHERE usergroupGroup_Id = ${groupId} AND status = 1`;
            stream<record {| int expense_count; |}, error?> expenseStream = utils:Client->query(checkExpensesQuery);
            
            int expenseCount = 0;
            error? expenseError = expenseStream.forEach(function(record {| int expense_count; |} result) {
                expenseCount = result.expense_count;
            });
            
            if expenseError is error {
                return utils:sendErrorResponse(caller, http:STATUS_INTERNAL_SERVER_ERROR, "Failed to check group expenses", expenseError.toString());
            }
            
            // Prevent deletion if group has expenses
            if expenseCount > 0 {
                return utils:sendErrorResponse(
                    caller, 
                    http:STATUS_CONFLICT, 
                    "Cannot delete group with existing expenses", 
                    string `Group "${groupName}" has ${expenseCount} active expense(s). Please settle or remove all expenses before deleting the group.`
                );
            }

            // Extract user ID from cookie to verify permissions
            string? currentUserId = utils:getCookieValue(req, "user_id");
            if currentUserId == () {
                return utils:sendErrorResponse(caller, http:STATUS_BAD_REQUEST, "Invalid 'user_id' cookie", "Expected a valid 'user_id' cookie");
            }

            // Check if current user is the group creator
            sql:ParameterizedQuery checkCreatorQuery = `SELECT userUser_Id FROM UserGroupMember WHERE groupGroup_Id = ${groupId} AND member_role = 'creator' AND status = 1`;
            stream<record {| string userUser_Id; |}, error?> creatorStream = utils:Client->query(checkCreatorQuery);
            
            boolean isCreator = false;
            error? creatorError = creatorStream.forEach(function(record {| string userUser_Id; |} creator) {
                if creator.userUser_Id == currentUserId {
                    isCreator = true;
                }
            });
            
            if creatorError is error {
                return utils:sendErrorResponse(caller, http:STATUS_INTERNAL_SERVER_ERROR, "Failed to verify group creator", creatorError.toString());
            }
            
            if !isCreator {
                return utils:sendErrorResponse(caller, http:STATUS_FORBIDDEN, "Access denied", "Only the group creator can delete the group");
            }

            transaction {
                // Delete all group members first (due to foreign key constraints)
                sql:ParameterizedQuery deleteMembersQuery = `DELETE FROM UserGroupMember WHERE groupGroup_Id = ${groupId}`;
                sql:ExecutionResult deleteMembersResult = check dbClient->executeNativeSQL(deleteMembersQuery);
                io:println("Deleted group members: ", deleteMembersResult.affectedRowCount);

                // Delete the group using SQL (MariaDB compatible)
                sql:ParameterizedQuery deleteGroupQuery = `DELETE FROM UserGroup WHERE group_Id = ${groupId}`;
                sql:ExecutionResult deleteGroupResult = check dbClient->executeNativeSQL(deleteGroupQuery);
                io:println("Deleted group: ", deleteGroupResult.affectedRowCount);
                
                if deleteGroupResult.affectedRowCount == 0 {
                    fail error("Group deletion failed - no rows affected", statusCode = http:STATUS_INTERNAL_SERVER_ERROR);
                }

                check commit;
                
                http:Response res = new;
                res.statusCode = http:STATUS_OK; // 200 OK
                res.setJsonPayload({
                    "status": "success", 
                    "message": string `Group "${groupName}" deleted successfully`,
                    "groupId": groupId,
                    "deletedMembers": deleteMembersResult.affectedRowCount
                });
                check caller->respond(res);
                
            } on fail error e {
                // Transaction failed (rolled back automatically)
                int statusCode = e.detail().hasKey("statusCode")
                    ? check e.detail().get("statusCode").ensureType(int)
                    : http:STATUS_INTERNAL_SERVER_ERROR;
                return utils:sendErrorResponse(caller, statusCode, "Failed to delete group", e.message());
            }
        }

        // REMOVE MEMBER: Remove a specific member from a group
        resource function post removeMember(http:Caller caller, http:Request req) returns error? {
            json payload = check req.getJsonPayload();

            // Extract groupId and userId from request body
            json|error groupIdJson = payload.groupId;
            json|error userIdJson = payload.userId;

            if groupIdJson is error || groupIdJson is () {
                return utils:sendErrorResponse(caller, http:STATUS_BAD_REQUEST, "Missing 'groupId' field");
            }
            if userIdJson is error || userIdJson is () {
                return utils:sendErrorResponse(caller, http:STATUS_BAD_REQUEST, "Missing 'userId' field");
            }

            string groupId = groupIdJson.toString();
            string userId = userIdJson.toString();

            // Extract current user ID from cookie to verify permissions
            string? currentUserId = utils:getCookieValue(req, "user_id");
            if currentUserId == () {
                return utils:sendErrorResponse(caller, http:STATUS_BAD_REQUEST, "Invalid 'user_id' cookie", "Expected a valid 'user_id' cookie");
            }

            // First check if group exists
            sql:ParameterizedQuery checkGroupQuery = `SELECT group_Id, name FROM UserGroup WHERE group_Id = ${groupId} AND status = 1`;
            stream<record {| string group_Id; string name; |}, error?> groupStream = utils:Client->query(checkGroupQuery);
            
            boolean groupExists = false;
            string groupName = "";
            error? groupError = groupStream.forEach(function(record {| string group_Id; string name; |} group) {
                groupExists = true;
                groupName = group.name;
            });
            
            if groupError is error {
                return utils:sendErrorResponse(caller, http:STATUS_INTERNAL_SERVER_ERROR, "Failed to check group existence", groupError.toString());
            }
            
            if !groupExists {
                return utils:sendErrorResponse(caller, http:STATUS_NOT_FOUND, "Group not found", "Group with ID " + groupId + " does not exist");
            }

            // Check if current user is a member of the group
            sql:ParameterizedQuery checkMembershipQuery = `SELECT userUser_Id, member_role FROM UserGroupMember WHERE groupGroup_Id = ${groupId} AND userUser_Id = ${currentUserId} AND status = 1`;
            stream<record {| string userUser_Id; string member_role; |}, error?> membershipStream = utils:Client->query(checkMembershipQuery);
            
            boolean isMember = false;
            boolean isCurrentUserCreator = false;
            error? membershipError = membershipStream.forEach(function(record {| string userUser_Id; string member_role; |} member) {
                if member.userUser_Id == currentUserId {
                    isMember = true;
                    if member.member_role == "creator" {
                        isCurrentUserCreator = true;
                    }
                }
            });
            
            if membershipError is error {
                return utils:sendErrorResponse(caller, http:STATUS_INTERNAL_SERVER_ERROR, "Failed to verify group membership", membershipError.toString());
            }
            
            if !isMember {
                return utils:sendErrorResponse(caller, http:STATUS_FORBIDDEN, "Access denied", "You must be a member of this group to remove members");
            }

            // Check if user to be removed exists in the group
            sql:ParameterizedQuery checkMemberQuery = `SELECT group_member_Id, member_role, userUser_Id FROM UserGroupMember WHERE groupGroup_Id = ${groupId} AND userUser_Id = ${userId} AND status = 1`;
            stream<record {| string group_member_Id; string member_role; string userUser_Id; |}, error?> memberStream = utils:Client->query(checkMemberQuery);
            
            boolean memberExists = false;
            string memberRole = "";
            error? memberError = memberStream.forEach(function(record {| string group_member_Id; string member_role; string userUser_Id; |} member) {
                memberExists = true;
                memberRole = member.member_role;
            });
            
            if memberError is error {
                return utils:sendErrorResponse(caller, http:STATUS_INTERNAL_SERVER_ERROR, "Failed to check member existence", memberError.toString());
            }
            
            if !memberExists {
                return utils:sendErrorResponse(caller, http:STATUS_NOT_FOUND, "Member not found", "User with ID " + userId + " is not a member of this group");
            }

            // Prevent removal of group creator
            if memberRole == "creator" {
                return utils:sendErrorResponse(caller, http:STATUS_FORBIDDEN, "Cannot remove creator", "Group creator cannot be removed from the group");
            }

            // Prevent regular members from removing other members (only creator can remove others)
            if !isCurrentUserCreator && userId != currentUserId {
                return utils:sendErrorResponse(caller, http:STATUS_FORBIDDEN, "Insufficient permissions", "Only the group creator can remove other members. You can only remove yourself from the group");
            }

            // Get user details for response
            sql:ParameterizedQuery getUserQuery = `SELECT first_name, last_name FROM User WHERE user_Id = ${userId}`;
            stream<record {| string first_name; string last_name; |}, error?> userStream = utils:Client->query(getUserQuery);
            
            string userName = "Unknown User";
            error? userError = userStream.forEach(function(record {| string first_name; string last_name; |} user) {
                userName = user.first_name + " " + user.last_name;
            });
            
            if userError is error {
                io:println("Warning: Failed to get user name: ", userError.toString());
            }

            // Check if user has any pending expenses in the group
            sql:ParameterizedQuery checkExpensesQuery = `
                SELECT COUNT(*) as expense_count 
                FROM Expense e 
                JOIN ExpenseParticipant ep ON e.expense_Id = ep.expenseExpense_Id 
                WHERE e.usergroupGroup_Id = ${groupId} 
                AND ep.userUser_Id = ${userId} 
                AND e.status = 1 
                AND ep.status = 1
            `;
            stream<record {| int expense_count; |}, error?> expenseStream = utils:Client->query(checkExpensesQuery);
            
            int expenseCount = 0;
            error? expenseError = expenseStream.forEach(function(record {| int expense_count; |} result) {
                expenseCount = result.expense_count;
            });
            
            if expenseError is error {
                return utils:sendErrorResponse(caller, http:STATUS_INTERNAL_SERVER_ERROR, "Failed to check user expenses", expenseError.toString());
            }

            // Warn if user has expenses but allow removal (expenses will need to be handled separately)
            string warningMessage = "";
            if expenseCount > 0 {
                warningMessage = string ` Warning: User has ${expenseCount} active expense(s) in this group.`;
            }

            transaction {
                // Remove the member from the group
                sql:ParameterizedQuery removeMemberQuery = `DELETE FROM UserGroupMember WHERE groupGroup_Id = ${groupId} AND userUser_Id = ${userId}`;
                sql:ExecutionResult removeResult = check dbClient->executeNativeSQL(removeMemberQuery);
                io:println("Removed member: ", removeResult.affectedRowCount);
                
                if removeResult.affectedRowCount == 0 {
                    fail error("Member removal failed - no rows affected", statusCode = http:STATUS_INTERNAL_SERVER_ERROR);
                }

                check commit;
                
                http:Response res = new;
                res.statusCode = http:STATUS_OK; // 200 OK
                res.setJsonPayload({
                    "status": "success", 
                    "message": string `${userName} has been removed from group "${groupName}"${warningMessage}`,
                    "groupId": groupId,
                    "removedUserId": userId,
                    "removedUserName": userName,
                    "expenseCount": expenseCount
                });
                check caller->respond(res);
                
            } on fail error e {
                // Transaction failed (rolled back automatically)
                int statusCode = e.detail().hasKey("statusCode")
                    ? check e.detail().get("statusCode").ensureType(int)
                    : http:STATUS_INTERNAL_SERVER_ERROR;
                return utils:sendErrorResponse(caller, statusCode, "Failed to remove member", e.message());
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
                   
                    string role = part.participant_role;
                  

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

