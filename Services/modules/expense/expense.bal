import splittrack_backend.db;
import splittrack_backend.interceptor as authInterceptor;
import splittrack_backend.utils;

import ballerina/http;
import ballerina/log;
import ballerina/persist;
import ballerina/sql;
import ballerina/uuid;
import ballerina/io;

final db:Client dbClient = check new ();

public function hello(string? name) returns string {
    if name !is () {
        return string `Hello, ${name}`;
    }
    return "Hello, World!";
}

// New Expense Service
# Description.
# + return - return value description
public function getExpenseService() returns http:Service {
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


        resource function post expense(http:Caller caller, http:Request req, @http:Payload ExpenseCreatePayload payload) returns http:Created & readonly|error? {


            http:Response response = new;

            boolean|error isValid = authInterceptor:authenticate(req);
            io:println("isValid: ", isValid);
            if isValid is error || !isValid {
                response.statusCode = 401;
                response.setJsonPayload({"status": "error", "message": "Unauthorized: Invalid or expired token"});
                check caller->respond(response);
                return;
            }

            string? creatorId = utils:getCookieValue(req, "user_id");
            if creatorId == () {
                return utils:sendErrorResponse(
                        caller,
                        http:STATUS_BAD_REQUEST,
                        "Invalid 'user_id' cookie",
                        "Expected a valid 'user_id' cookie" 
                );
            }

            // Calculate the owe_amount by finding the creator's amount and subtracting from total
            decimal calculatedOweAmount = payload.expense_total_amount;
            decimal creatorOwningAmount = 0;

            // Find the creator's owning amount from participants
            foreach ParticipantPayload participant in payload.participant {
                if participant.userUser_Id == creatorId {
                    creatorOwningAmount = participant.owning_amount;
                    break;
                }
            }

            // Calculate what others owe to the creator (total minus creator's share)
            calculatedOweAmount -= creatorOwningAmount;

            string? payloadUsergroupId = payload.usergroupGroup_Id;
            if payloadUsergroupId is string && payloadUsergroupId.trim() != "" {
                db:UserGroup|persist:Error group = dbClient->/usergroups/[payloadUsergroupId];
                if group is persist:NotFoundError {
                    response.statusCode = 404;
                    response.setJsonPayload({"status": "error", "message": "User group not found"});
                    check caller->respond(response);
                    return;
                } else if group is persist:Error {
                    log:printError("Database error checking user group: " + group.message());
                    response.statusCode = 500;
                    response.setJsonPayload({"status": "error", "message": "Database error checking user group"});
                    check caller->respond(response);
                    return;
                }
            }

            string expenseId;
            string? payloadExpenseId = payload.expense_Id;
            if payloadExpenseId is string && payloadExpenseId.trim() != "" {
                expenseId = payloadExpenseId;
            } else {
                while true {
                    expenseId = uuid:createType4AsString();
                    db:Expense|persist:Error existingExpense = dbClient->/expenses/[expenseId];
                    if existingExpense is persist:NotFoundError {
                        break; // Unique ID found
                    } else if existingExpense is persist:Error {
                        log:printError("Database error checking expense ID: " + existingExpense.message());
                        response.statusCode = 500;
                        response.setJsonPayload({"status": "error", "message": "Database error checking expense ID"});
                        check caller->respond(response);
                        return;
                    }
                }
            }

            string? usergroupId = payloadUsergroupId == "" ? null : payload.usergroupGroup_Id;
            // Use the calculated owe_amount instead of the one from payload
            sql:ParameterizedQuery insertQuery = `INSERT INTO Expense (expense_Id, name, expense_total_amount, expense_owe_amount, usergroupGroup_Id,status) 
                              VALUES (${expenseId}, ${payload.name}, ${payload.expense_total_amount}, ${calculatedOweAmount}, ${usergroupId}, 1)`;
            persist:Error|sql:ExecutionResult expenseResult = dbClient->executeNativeSQL(insertQuery);
            if expenseResult is persist:Error {
                log:printError("Database error creating expense: " + expenseResult.message());
                response.statusCode = 500;
                response.setJsonPayload({"status": "error", "message": "Failed to create expense in database"});
                check caller->respond(response);
                return;
            }

            foreach ParticipantPayload participant in payload.participant {
                string participantId;
                while true {
                    participantId = uuid:createType4AsString();
                    db:ExpenseParticipant|persist:Error existingParticipant = dbClient->/expenseparticipants/[participantId];
                    if existingParticipant is persist:NotFoundError {
                        break; // Unique ID found
                    } else if existingParticipant is persist:Error {
                        log:printError("Database error checking participant ID: " + existingParticipant.message());
                        response.statusCode = 500;
                        response.setJsonPayload({"status": "error", "message": "Database error checking participant ID"});
                        check caller->respond(response);
                        return;
                    }
                }

                db:ExpenseParticipant newParticipant = {
                    participant_Id: participantId,
                    participant_role: participant.userUser_Id == creatorId ? "Creator" : participant.participant_role,
                    owning_amount: participant.owning_amount,
                    expenseExpense_Id: expenseId,
                    userUser_Id: participant.userUser_Id,
                    status: 1
                };

                string[]|error participantResult = dbClient->/expenseparticipants.post([newParticipant]);
                if participantResult is error {
                    log:printError("Database error creating participant: " + participantResult.message());
                    response.statusCode = 500;
                    response.setJsonPayload({"status": "error", "message": "Failed to create expense participant in database"});
                    check caller->respond(response);
                    return;
                }
            }

            response.statusCode = http:STATUS_CREATED;
            response.setJsonPayload({
                "status": "success",
                "message": "Expense created successfully" + (payload.participant.length() > 0 ? " with participants" : ""),
                "expenseId": expenseId,
                "oweAmount": calculatedOweAmount // Include the calculated amount in the response
            });
            check caller->respond(response);
            return;
        }

        // delete expense
        resource function delete expense/[string expenseId](http:Caller caller, http:Request req) returns error? {
            http:Response response = new;

            // boolean|error isValid = authInterceptor:authenticate(req);
            // if isValid is error || !isValid {
            //     response.statusCode = 401;
            //     response.setJsonPayload({"status": "error", "message": "Unauthorized: Invalid or expired token"});
            //     check caller->respond(response);
            //     return;
            // }

            transaction {
                // Directly delete expense
                db:Expense|persist:Error deleteResult = dbClient->/expenses/[expenseId].delete();

                if deleteResult is persist:NotFoundError {
                    fail error("Expense with ID " + expenseId + " does not exist", statusCode = http:STATUS_NOT_FOUND);
                } else if deleteResult is persist:Error {
                    fail error(deleteResult.message(), statusCode = http:STATUS_INTERNAL_SERVER_ERROR);
                }

                response.statusCode = http:STATUS_OK;
                response.setJsonPayload({"status": "success", "expenseId": expenseId});
                check caller->respond(response);
                check commit;
            } on fail error e {
                // Transaction failed (rolled back automatically)
                int statusCode = e.detail().hasKey("statusCode")
                    ? check e.detail().get("statusCode").ensureType(int)
                    : http:STATUS_INTERNAL_SERVER_ERROR;
                return utils:sendErrorResponse(caller, statusCode, "Failed to delete expense", e.message());
            }
        }

        // get expense by id
        resource function get expense/[string expenseId](http:Caller caller, http:Request req) returns error? {
            db:ExpenseWithRelations|error expenseDetails = dbClient->/expenses/[expenseId]();
            if expenseDetails is error {
                // Check if the error is a "not found" error
                if expenseDetails is persist:NotFoundError {
                    _ = check utils:sendErrorResponse(caller, http:STATUS_NOT_FOUND, "Expense not found", "Expense with ID " + expenseId + " does not exist");
                    return;
                }
                // Other database errors
                return utils:sendErrorResponse(caller, http:STATUS_INTERNAL_SERVER_ERROR, expenseDetails.toString());
            }
            http:Response res = new;
            json payload = {
                "expense": expenseDetails
            };
            res.setJsonPayload(payload);
            res.statusCode = http:STATUS_OK;
            return caller->respond(res);
        }

        // update expense
        resource function put expenses/[string expenseId](http:Caller caller, http:Request req) returns error?|http:Response {
            json payload = check req.getJsonPayload();

            // Validate and extract name (optional)
            json|error nameJson = payload.name;
            string? name = ();
            if nameJson is json && nameJson !is () {
                name = nameJson.toString();
            }

            // Validate and extract expense_actual_amount (optional)
            json|error actualAmountJson = payload.expense_actual_amount;
            decimal? expense_actual_amount = ();
            if actualAmountJson is json && actualAmountJson !is () {
                decimal|error amount = decimal:fromString(actualAmountJson.toString());
                if amount is error {
                    return utils:sendErrorResponse(caller, http:STATUS_BAD_REQUEST, "Invalid 'expense_actual_amount' field", "Expected a valid decimal value");
                }
                expense_actual_amount = amount;
            }

            // Check if at least one field is provided
            if name is () && expense_actual_amount is () {
                return utils:sendErrorResponse(caller, http:STATUS_BAD_REQUEST, "No valid fields provided", "At least one of 'name' or 'expense_actual_amount' must be provided");
            }

            // Check if expense exists
            db:ExpenseWithRelations|error expenseCheck = dbClient->/expenses/[expenseId]();
            if expenseCheck is error {
                if expenseCheck is persist:NotFoundError {
                    return utils:sendErrorResponse(caller, http:STATUS_NOT_FOUND, "Expense not found", "Expense with ID " + expenseId + " does not exist");
                }
                return utils:sendErrorResponse(caller, http:STATUS_INTERNAL_SERVER_ERROR, expenseCheck.toString());
            }

            transaction {
                // Update expense fields if provided
                db:ExpenseUpdate expenseUpdate = {};
                if name is string {
                    expenseUpdate.name = name;
                }
                if expense_actual_amount is decimal {
                    expenseUpdate.expense_owe_amount = expense_actual_amount;
                }

                _ = check dbClient->/expenses/[expenseId].put(expenseUpdate);

                check commit;
            } on fail error e {
                return utils:sendErrorResponse(caller, http:STATUS_INTERNAL_SERVER_ERROR, "Failed to update expense", e.message());
            }

            // Fetch updated expense details for response
            db:ExpenseWithRelations|error updatedExpense = dbClient->/expenses/[expenseId]();
            if updatedExpense is error {
                return utils:sendErrorResponse(caller, http:STATUS_INTERNAL_SERVER_ERROR, updatedExpense.toString());
            }

            http:Response res = new;
            res.statusCode = http:STATUS_OK; // 200
            res.setJsonPayload({"expense": updatedExpense});
            return res;
        }


        resource function get groupExpenses(http:Caller caller, http:Request req) returns http:Ok & readonly|error? {

            http:Response response = new;

            string? userId = utils:getCookieValue(req, "user_id");
            if userId == () {
                return utils:sendErrorResponse(
                        caller,
                        http:STATUS_BAD_REQUEST,
                        "Invalid 'user_id' cookie",
                        "Expected a valid 'user_id' cookie"
                );
            }

            // Authenticate the request
            // boolean|error isValid = authInterceptor:authenticate(req);
            // if isValid is error || !isValid {
            //     response.statusCode = 401;
            //     response.setJsonPayload({"status": "error", "message": "Unauthorized: Invalid or expired token"});
            //     check caller->respond(response);
            //     return;
            // }

            // Fetch groups where the user is a member
            stream<db:UserGroupMember, persist:Error?> groupMembers = dbClient->/usergroupmembers(
                whereClause = sql:queryConcat(`userUser_Id = ${userId}`)
            );
            db:UserGroupMember[]|persist:Error memberRecords = from var member in groupMembers
                select member;

            if memberRecords is persist:Error {
                log:printError("Database error fetching user groups: " + memberRecords.message());
                response.statusCode = 500;
                response.setJsonPayload({"status": "error", "message": "Failed to fetch user groups"});
                check caller->respond(response);
                return;
            }

            if memberRecords.length() == 0 {
                response.statusCode = 200;
                response.setJsonPayload({"status": "success", "message": "No groups found", "groups": []});
                check caller->respond(response);
                return;
            }

            GroupSummary[] summaries = [];
            foreach db:UserGroupMember member in memberRecords {
                string groupId = member.groupGroup_Id;

                // Fetch group details
                db:UserGroup|persist:Error group = dbClient->/usergroups/[groupId];
                if group is persist:Error {
                    log:printError("Database error fetching group: " + group.message());
                    response.statusCode = 500;
                    response.setJsonPayload({"status": "error", "message": "Failed to fetch group details"});
                    check caller->respond(response);
                    return;
                }

                // Fetch all members of the group
                stream<db:UserGroupMember, persist:Error?> allMembers = dbClient->/usergroupmembers(
                    whereClause = sql:queryConcat(`groupGroup_Id = ${groupId}`)
                );
                db:UserGroupMember[]|persist:Error groupMemberRecords = from var m in allMembers
                    select m;

                if groupMemberRecords is persist:Error {
                    log:printError("Database error fetching group members: " + groupMemberRecords.message());
                    response.statusCode = 500;
                    response.setJsonPayload({"status": "error", "message": "Failed to fetch group members"});
                    check caller->respond(response);
                    return;
                }

                // Fetch participant names excluding the requesting user
                string[] participantNames = [];
                foreach db:UserGroupMember gm in groupMemberRecords {
                    if gm.userUser_Id != userId {
                        db:User|persist:Error user = dbClient->/users/[gm.userUser_Id];
                        if user is db:User {
                            participantNames.push(user.first_name + " " + user.last_name);
                        } else {
                            log:printError("Database error fetching user: " + user.message());
                            response.statusCode = 500;
                            response.setJsonPayload({"status": "error", "message": "Failed to fetch user details"});
                            check caller->respond(response);
                            return;
                        }
                    }
                }

                // Fetch all expenses for the group
                stream<db:Expense, persist:Error?> expenses = dbClient->/expenses(
                    whereClause = sql:queryConcat(`usergroupGroup_Id = ${groupId}`)
                );
                db:Expense[]|persist:Error expenseRecords = from var exp in expenses
                    select exp;

                if expenseRecords is persist:Error {
                    log:printError("Database error fetching expenses: " + expenseRecords.message());
                    response.statusCode = 500;
                    response.setJsonPayload({"status": "error", "message": "Failed to fetch expenses"});
                    check caller->respond(response);
                    return;
                }

                // Calculate net amount
                decimal userOwes = 0d;
                decimal othersOwe = 0d;

                foreach db:Expense exp in expenseRecords {
                    // Fetch participants for this expense
                    stream<db:ExpenseParticipant, persist:Error?> participants = dbClient->/expenseparticipants(
                        whereClause = sql:queryConcat(`expenseExpense_Id = ${exp.expense_Id}`)
                    );
                    db:ExpenseParticipant[]|persist:Error participantRecords = from var p in participants
                        select p;

                    if participantRecords is persist:Error {
                        log:printError("Database error fetching participants: " + participantRecords.message());
                        response.statusCode = 500;
                        response.setJsonPayload({"status": "error", "message": "Failed to fetch participants"});
                        check caller->respond(response);
                        return;
                    }

                    // Check if user is the creator of this expense via participant_role
                    boolean isCreator = false;
                    foreach db:ExpenseParticipant participant in participantRecords {
                        if participant.userUser_Id == userId && participant.participant_role == "creator" {
                            isCreator = true;
                            break;
                        }
                    }

                    // Calculate based on roles
                    foreach db:ExpenseParticipant participant in participantRecords {
                        if participant.userUser_Id == userId && participant.participant_role != "creator" {
                            // User is a non-creator participant, add their share to what they owe
                            userOwes += participant.owning_amount;
                        } else if isCreator && participant.userUser_Id != userId {
                            // User is the creator, add others' shares to what they are owed
                            othersOwe += participant.owning_amount;
                        }
                    }
                }

                // Net amount: what others owe to user minus what user owes
                decimal netAmount = othersOwe - userOwes;

               summaries.push({
                    groupId: groupId,
                    groupName: group.name,
                    participantNames: participantNames,
                    netAmount: netAmount
   });
            }

            response.statusCode = 200;
            response.setJsonPayload({
                "status": "success",
                "message": "Group summaries retrieved successfully",
                "groups": summaries
            });
            check caller->respond(response);
            return;
        }

        resource function get groupExpensesTwo(http:Caller caller, http:Request req, @http:Query string? userId) returns http:Ok & readonly|error? {
            http:Response response = new;

            // Authenticate the request
            // boolean|error isValid = authInterceptor:authenticate(req);
            // if isValid is error || !isValid {
            //     response.statusCode = 401;
            //     response.setJsonPayload({"status": "error", "message": "Unauthorized: Invalid or expired token"});
            //     check caller->respond(response);
            //     return;
            // }

            // Check if userId is provided
            if userId is () {
                response.statusCode = 400;
                response.setJsonPayload({"status": "error", "message": "Missing userId query parameter"});
                check caller->respond(response);
                return;
            }
            string actualUserId = userId;

            // Fetch groups where the user is a member
            stream<db:UserGroupMember, persist:Error?> groupMembers = dbClient->/usergroupmembers(
                whereClause = sql:queryConcat(`userUser_Id = ${actualUserId}`)
            );
            db:UserGroupMember[]|persist:Error memberRecords = from var member in groupMembers
                select member;

            if memberRecords is persist:Error {
                log:printError("Database error fetching user groups: " + memberRecords.message());
                response.statusCode = 500;
                response.setJsonPayload({"status": "error", "message": "Failed to fetch user groups"});
                check caller->respond(response);
                return;
            }

            if memberRecords.length() == 0 {
                response.statusCode = 200;
                response.setJsonPayload({"status": "success", "message": "No groups found", "groups": []});
                check caller->respond(response);
                return;
            }

            GroupSummaryTwo[] summaries = [];
            foreach db:UserGroupMember member in memberRecords {
                string groupId = member.groupGroup_Id;

                // Fetch group details
                db:UserGroup|persist:Error group = dbClient->/usergroups/[groupId];
                if group is persist:Error {
                    log:printError("Database error fetching group: " + group.message());
                    response.statusCode = 500;
                    response.setJsonPayload({"status": "error", "message": "Failed to fetch group details"});
                    check caller->respond(response);
                    return;
                }

                // Fetch all members of the group
                stream<db:UserGroupMember, persist:Error?> allMembers = dbClient->/usergroupmembers(
                    whereClause = sql:queryConcat(`groupGroup_Id = ${groupId}`)
                );
                db:UserGroupMember[]|persist:Error groupMemberRecords = from var m in allMembers
                    select m;

                if groupMemberRecords is persist:Error {
                    log:printError("Database error fetching group members: " + groupMemberRecords.message());
                    response.statusCode = 500;
                    response.setJsonPayload({"status": "error", "message": "Failed to fetch group members"});
                    check caller->respond(response);
                    return;
                }

                // Create a map of group member user IDs for quick lookup
                map<boolean> groupMemberMap = {};
                foreach db:UserGroupMember gm in groupMemberRecords {
                    groupMemberMap[gm.userUser_Id] = true;
                }

                // Fetch participant names excluding the requesting user
                string[] participantNames = [];
                foreach db:UserGroupMember gm in groupMemberRecords {
                    if gm.userUser_Id != actualUserId {
                        db:User|persist:Error user = dbClient->/users/[gm.userUser_Id];
                        if user is db:User {
                            participantNames.push(user.first_name + " " + user.last_name);
                        } else {
                            log:printError("Database error fetching user: " + user.message());
                            response.statusCode = 500;
                            response.setJsonPayload({"status": "error", "message": "Failed to fetch user details"});
                            check caller->respond(response);
                            return;
                        }
                    }
                }

                // Fetch all expenses for the group
                stream<db:Expense, persist:Error?> expenses = dbClient->/expenses(
                    whereClause = sql:queryConcat(`usergroupGroup_Id = ${groupId}`)
                );
                db:Expense[]|persist:Error expenseRecords = from var exp in expenses
                    select exp;

                if expenseRecords is persist:Error {
                    log:printError("Database error fetching expenses: " + expenseRecords.message());
                    response.statusCode = 500;
                    response.setJsonPayload({"status": "error", "message": "Failed to fetch expenses"});
                    check caller->respond(response);
                    return;
                }

                // Initialize variables for net amount calculations
                decimal userOwes = 0d;
                decimal othersOweFromGroupMembers = 0d;
                decimal othersOweFromNonGroupMembers = 0d;

                foreach db:Expense exp in expenseRecords {
                    // Fetch participants for this expense
                    stream<db:ExpenseParticipant, persist:Error?> participants = dbClient->/expenseparticipants(
                        whereClause = sql:queryConcat(`expenseExpense_Id = ${exp.expense_Id}`)
                    );
                    db:ExpenseParticipant[]|persist:Error participantRecords = from var p in participants
                        select p;

                    if participantRecords is persist:Error {
                        log:printError("Database error fetching participants: " + participantRecords.message());
                        response.statusCode = 500;
                        response.setJsonPayload({"status": "error", "message": "Failed to fetch participants"});
                        check caller->respond(response);
                        return;
                    }

                    // Determine if the user is the creator
                    boolean isCreator = false;
                    foreach db:ExpenseParticipant participant in participantRecords {
                        if participant.userUser_Id == actualUserId && participant.participant_role == "creator" {
                            isCreator = true;
                            break;
                        }
                    }

                    // Calculate amounts based on roles
                    foreach db:ExpenseParticipant participant in participantRecords {
                        if participant.userUser_Id == actualUserId && participant.participant_role != "creator" {
                            // User owes this amount to the creator (a group member)
                            userOwes += participant.owning_amount;
                        } else if isCreator && participant.userUser_Id != actualUserId {
                            // User is owed this amount by others, split by group membership
                            if groupMemberMap.hasKey(participant.userUser_Id) {
                                othersOweFromGroupMembers += participant.owning_amount;
                            } else {
                                othersOweFromNonGroupMembers += participant.owning_amount;
                            }
                        }
                    }
                }

                // Calculate net amounts
                decimal netAmountFromGroupMembers = othersOweFromGroupMembers - userOwes;
                decimal netAmountFromNonGroupMembers = othersOweFromNonGroupMembers;

                // Add to summaries
                summaries.push({
                    groupName: group.name,
                    participantNames: participantNames,
                    netAmountFromGroupMembers: netAmountFromGroupMembers,
                    netAmountFromNonGroupMembers: netAmountFromNonGroupMembers
                });
            }

            // Send successful response
            response.statusCode = 200;
            response.setJsonPayload({
                "status": "success",
                "message": "Group summaries retrieved successfully",
                "groups": summaries
            });
            check caller->respond(response);
            return;
        }

        // get non group expenses for certain user id
        resource function get nonGroupExpenses(http:Caller caller, http:Request req, @http:Query string userId) returns http:Ok & readonly|error? {
            http:Response response = new;
            final db:Client dbClient = check new (); // Assuming db:Client is your persist client

            // Step 1: Fetch all ExpenseParticipant records where the user is involved
            stream<db:ExpenseParticipant, persist:Error?> userParticipants = dbClient->/expenseparticipants(
                whereClause = sql:queryConcat(`userUser_Id = ${userId}`)
            );
            db:ExpenseParticipant[]|persist:Error participantRecords = from var p in userParticipants
                select p;

            if participantRecords is persist:Error {
                log:printError("Database error fetching user participants: " + participantRecords.message());
                response.statusCode = 500;
                response.setJsonPayload({"status": "error", "message": "Failed to fetch user participants"});
                check caller->respond(response);
                return;
            }

            if participantRecords.length() == 0 {
                response.statusCode = 200;
                response.setJsonPayload({"status": "success", "message": "No expenses found", "expenses": []});
                check caller->respond(response);
                return;
            }

            // Step 2: Process each expense to build summaries
            ExpenseSummary[] summaries = [];
            foreach db:ExpenseParticipant participant in participantRecords {
                string expenseId = participant.expenseExpense_Id;

                // Step 3: Use pure SQL to fetch expense details, including usergroupGroup_Id which can be NULL
                sql:ParameterizedQuery expenseQuery = `SELECT expense_Id, name, usergroupGroup_Id FROM Expense WHERE expense_Id = ${expenseId}`;

                // Execute query with proper stream type
                stream<record {|
                    string expense_Id;
                    string name;
                    string? usergroupGroup_Id;
                |}, sql:Error?> expenseStream = utils:Client->query(expenseQuery);

                // Process the stream result
                var result = check expenseStream.next();
                record {|
                    string expense_Id;
                    string name;
                    string? usergroupGroup_Id;
                |}? expenseRecord = result is record {|record {|string expense_Id; string name; string? usergroupGroup_Id;|} value;|} ? result.value : ();
                if expenseRecord is () {
                    log:printWarn("Expense " + expenseId + " not found, skipping");
                    continue;
                }

                string? groupId = expenseRecord.usergroupGroup_Id;

                // Step 4: Check group membership if the expense is attached to a group
                if groupId is string {
                    stream<db:UserGroupMember, persist:Error?> groupMembers = dbClient->/usergroupmembers(
                        whereClause = sql:queryConcat(`groupGroup_Id = ${groupId} AND userUser_Id = ${userId}`)
                    );
                    db:UserGroupMember[]|persist:Error groupMemberRecords = from var m in groupMembers
                        select m;

                    if groupMemberRecords is persist:Error {
                        log:printError("Database error checking group membership: " + groupMemberRecords.message());
                        response.statusCode = 500;
                        response.setJsonPayload({"status": "error", "message": "Failed to check group membership"});
                        check caller->respond(response);
                        return;
                    }

                    // If user is a member of the group, skip this expense
                    if groupMemberRecords.length() > 0 {
                        continue;
                    }
                }
                // If groupId is null, proceed (expense has no group), or if groupId exists and user is not a member, proceed

                // Step 5: Fetch all participants of the expense
                stream<db:ExpenseParticipant, persist:Error?> allParticipants = dbClient->/expenseparticipants(
                    whereClause = sql:queryConcat(`expenseExpense_Id = ${expenseId}`)
                );
                db:ExpenseParticipant[]|persist:Error allParticipantRecords = from var p in allParticipants
                    select p;

                if allParticipantRecords is persist:Error {
                    log:printError("Database error fetching expense participants: " + allParticipantRecords.message());
                    response.statusCode = 500;
                    response.setJsonPayload({"status": "error", "message": "Failed to fetch expense participants"});
                    check caller->respond(response);
                    return;
                }

                // Step 6: Determine if the user is the creator and get their owning amount
                boolean isCreator = false;
                decimal userOwningAmount = 0d;
                foreach db:ExpenseParticipant p in allParticipantRecords {
                    if p.userUser_Id == userId {
                        if p.participant_role == "creator" {
                            isCreator = true;
                        }
                        userOwningAmount = p.owning_amount;
                    }
                }

                // Step 7: Calculate net amount
                decimal netAmount = 0d;
                if isCreator {
                    // User is the creator: sum what others owe
                    foreach db:ExpenseParticipant p in allParticipantRecords {
                        if p.userUser_Id != userId {
                            netAmount += p.owning_amount;
                        }
                    }
                } else {
                    // User is a participant: they owe their own amount (negative)
                    netAmount = -userOwningAmount;
                }

                // Step 8: Get participant names excluding the user
                string[] participantNames = [];
                foreach db:ExpenseParticipant p in allParticipantRecords {
                    if p.userUser_Id != userId {
                        db:User|persist:Error user = dbClient->/users/[p.userUser_Id];
                        if user is db:User {
                            participantNames.push(user.first_name + " " + user.last_name);
                        } else {
                            log:printError("Database error fetching user: " + user.message());
                            response.statusCode = 500;
                            response.setJsonPayload({"status": "error", "message": "Failed to fetch user details"});
                            check caller->respond(response);
                            return;
                        }
                    }
                }

                // Step 9: Add the expense summary
                summaries.push({
                    expenseName: expenseRecord.name,
                    participantNames: participantNames,
                    netAmount: netAmount
                });
            }

            // Step 10: Send the response
            response.statusCode = 200;
            response.setJsonPayload({
                "status": "success",
                "message": "Expense summaries retrieved successfully",
                "expenses": summaries
            });
            check caller->respond(response);
            return;
        }

        // get owe summary in home
        resource function get userExpenseSummary(http:Caller caller, http:Request req) returns http:Ok & readonly|error? {
            http:Response response = new;

            // Validate userId
            string? userId = utils:getCookieValue(req, "user_id");
            if userId == () {
                return utils:sendErrorResponse(
                        caller,
                        http:STATUS_BAD_REQUEST,
                        "Invalid 'user_id' cookie",
                        "Expected a valid 'user_id' cookie"
                );
            }

            // Fetch user's name
            sql:ParameterizedQuery userQuery = `SELECT first_name, last_name FROM User WHERE user_Id = ${userId}`;
            stream<record {|string first_name; string last_name;|}, sql:Error?> userStream = utils:Client->query(userQuery);
            record {|string first_name; string last_name;|}? userRecord = ();
            error? uErr = from var u in userStream
                do {
                    userRecord = u;
                };
            if uErr is error {
                log:printError("Database error fetching user: " + uErr.message());
                response.statusCode = 500;
                response.setJsonPayload({"status": "error", "message": "Failed to fetch user details"});
                check caller->respond(response);
                return;
            }
            if userRecord is () {
                response.statusCode = 404;
                response.setJsonPayload({"status": "error", "message": "User not found"});
                check caller->respond(response);
                return;
            }
            string userName = userRecord.first_name + " " + userRecord.last_name;

            // Fetch all expenses where the user is a participant
            sql:ParameterizedQuery participantQuery = `SELECT expenseExpense_Id FROM ExpenseParticipant WHERE userUser_Id = ${userId}`;
            stream<record {|string expenseExpense_Id;|}, sql:Error?> participantStream = utils:Client->query(participantQuery);

            string[] expenseIds = [];
            error? e = from var p in participantStream
                do {
                    expenseIds.push(p.expenseExpense_Id);
                };
            if e is error {
                log:printError("Database error fetching participant records: " + e.message());
                response.statusCode = 500;
                response.setJsonPayload({"status": "error", "message": "Failed to fetch user expenses"});
                check caller->respond(response);
                return;
            }

            if expenseIds.length() == 0 {
                response.statusCode = 200;
                response.setJsonPayload({
                    "status": "success",
                    "message": "No expenses found",
                    "summary": {"userName": userName, "netAmount": 0.0}
                });
                check caller->respond(response);
                return;
            }

            // Calculate net amount across all expenses
            decimal netAmount = 0d;
            foreach string expenseId in expenseIds {
                // Fetch all participants for this expense
                sql:ParameterizedQuery allParticipantsQuery = `SELECT userUser_Id, participant_role, owning_amount FROM ExpenseParticipant WHERE expenseExpense_Id = ${expenseId}`;
                stream<record {|
                    string userUser_Id;
                    string participant_role;
                    decimal owning_amount;
                |}, sql:Error?> allParticipantsStream = utils:Client->query(allParticipantsQuery);

                record {|
                    string userUser_Id;
                    string participant_role;
                    decimal owning_amount;
                |}[] allParticipantRecords = [];
                error? pErr = from var p in allParticipantsStream
                    do {
                        allParticipantRecords.push(p);
                    };
                if pErr is error {
                    log:printError("Database error fetching participants for expense " + expenseId + ": " + pErr.message());
                    response.statusCode = 500;
                    response.setJsonPayload({"status": "error", "message": "Failed to fetch expense participants"});
                    check caller->respond(response);
                    return;
                }

                // Determine if user is creator and calculate amounts
                boolean isCreator = false;
                decimal userOwningAmount = 0d;
                foreach var p in allParticipantRecords {
                    if p.userUser_Id == userId {
                        if p.participant_role == "creator" {
                            isCreator = true;
                        }
                        userOwningAmount = p.owning_amount;
                    }
                }

                if isCreator {
                    // User is creator: sum what others owe
                    foreach var p in allParticipantRecords {
                        if p.userUser_Id != userId {
                            netAmount += p.owning_amount;
                        }
                    }
                } else {
                    // User is participant: subtract what they owe
                    netAmount -= userOwningAmount;
                }
            }

            // Send response
            response.statusCode = 200;
            response.setJsonPayload({
                "status": "success",
                "message": "User expense summary retrieved successfully",
                "summary": {
                    "userName": userName,
                    "netAmount": netAmount
                }
            });
            check caller->respond(response);
            return;
        }

        // get group balances
        resource function get groupMemberBalances/[string groupId](http:Caller caller, http:Request req) returns error? {
            http:Response response = new;

            // First, fetch the group to make sure it exists
            db:UserGroupWithRelations|persist:Error groupResult = dbClient->/usergroups/[groupId];
            if groupResult is persist:NotFoundError {
                response.statusCode = http:STATUS_NOT_FOUND;
                response.setJsonPayload({"status": "error", "message": "Group not found"});
                check caller->respond(response);
                return;
            } else if groupResult is persist:Error {
                log:printError("Database error fetching group: " + groupResult.message());
                response.statusCode = http:STATUS_INTERNAL_SERVER_ERROR;
                response.setJsonPayload({"status": "error", "message": "Database error"});
                check caller->respond(response);
                return;
            }

            // Explicitly check type and extract group name
            string groupName = "";
            if groupResult is db:UserGroupWithRelations {
                groupName = groupResult.name ?: "";
            }

            // Fetch all members of the group
            stream<db:UserGroupMember, persist:Error?> groupMembersStream = dbClient->/usergroupmembers(
                whereClause = sql:queryConcat(`groupGroup_Id = ${groupId}`)
            );
            db:UserGroupMember[]|persist:Error groupMembersResult = from var member in groupMembersStream
                select member;

            if groupMembersResult is persist:Error {
                log:printError("Database error fetching group members: " + groupMembersResult.message());
                response.statusCode = http:STATUS_INTERNAL_SERVER_ERROR;
                response.setJsonPayload({"status": "error", "message": "Failed to fetch group members"});
                check caller->respond(response);
                return;
            }

            // Explicit type check
            db:UserGroupMember[] groupMembers = [];
            if groupMembersResult is db:UserGroupMember[] {
                groupMembers = groupMembersResult;
            }

            // Create a map to track which users are group members
            map<boolean> groupMemberMap = {};
            foreach db:UserGroupMember member in groupMembers {
                groupMemberMap[member.userUser_Id] = true;
            }

            // Fetch all expenses for the group
            stream<db:Expense, persist:Error?> expensesStream = dbClient->/expenses(
                whereClause = sql:queryConcat(`usergroupGroup_Id = ${groupId}`)
            );
            db:Expense[]|persist:Error expensesResult = from var expense in expensesStream
                select expense;

            if expensesResult is persist:Error {
                log:printError("Database error fetching expenses: " + expensesResult.message());
                response.statusCode = http:STATUS_INTERNAL_SERVER_ERROR;
                response.setJsonPayload({"status": "error", "message": "Failed to fetch expenses"});
                check caller->respond(response);
                return;
            }

            // Explicit type check
            db:Expense[] expenses = [];
            if expensesResult is db:Expense[] {
                expenses = expensesResult;
            }

            // Map to track balances (positive = owed to user, negative = user owes)
            map<decimal> balanceMap = {};

            // Track all users involved (including non-members)
            map<boolean> allUsersMap = {};

            // Process each expense
            foreach db:Expense expense in expenses {
                // Fetch participants for this expense
                stream<db:ExpenseParticipant, persist:Error?> participantsStream = dbClient->/expenseparticipants(
                    whereClause = sql:queryConcat(`expenseExpense_Id = ${expense.expense_Id}`)
                );
                db:ExpenseParticipant[]|persist:Error participantsResult = from var participant in participantsStream
                    select participant;

                if participantsResult is persist:Error {
                    log:printError("Database error fetching participants: " + participantsResult.message());
                    response.statusCode = http:STATUS_INTERNAL_SERVER_ERROR;
                    response.setJsonPayload({"status": "error", "message": "Failed to fetch expense participants"});
                    check caller->respond(response);
                    return;
                }

                // Explicit type check
                db:ExpenseParticipant[] participants = [];
                if participantsResult is db:ExpenseParticipant[] {
                    participants = participantsResult;
                }

                // Find the creator user ID
                string? creatorUserId = ();
                foreach db:ExpenseParticipant participant in participants {
                    // Add all participants to the all users map
                    allUsersMap[participant.userUser_Id] = true;

                    // Track the creator
                    if participant.participant_role == "creator" {
                        creatorUserId = participant.userUser_Id;
                    }
                }

                // Process the expense balances
                if creatorUserId is string {
                    foreach db:ExpenseParticipant participant in participants {
                        if participant.userUser_Id != creatorUserId {
                            // Participant owes creator
                            decimal currentOwes = balanceMap.hasKey(participant.userUser_Id) ?
                                balanceMap.get(participant.userUser_Id) : 0d;
                            balanceMap[participant.userUser_Id] = currentOwes - participant.owning_amount;

                            // Creator is owed by participant
                            decimal currentOwed = balanceMap.hasKey(creatorUserId) ?
                                balanceMap.get(creatorUserId) : 0d;
                            balanceMap[creatorUserId] = currentOwed + participant.owning_amount;
                        }
                    }
                }
            }

            // Prepare the response
            GroupMemberBalance[] memberBalances = [];

            // Process all users (members and non-members)
            foreach string userId in allUsersMap.keys() {
                // Get user details
                db:UserWithRelations|persist:Error userResult = dbClient->/users/[userId];

                if userResult is db:UserWithRelations {
                    decimal oweAmount = balanceMap.hasKey(userId) ? balanceMap.get(userId) : 0d;
                    boolean isMember = groupMemberMap.hasKey(userId);

                    string? firstName = userResult.first_name;
                    string? lastName = userResult.last_name;
                    string fullName = (firstName ?: "") + " " + (lastName ?: "");

                    memberBalances.push({
                        name: fullName,
                        owe_amount: oweAmount,
                        isMember: isMember ? "yes" : "no"
                    });
                } else {
                    log:printError("Could not fetch user " + userId);
                }
            }

            // Create the response
            json responsePayload = {
                "status": "success",
                "groupName": groupName,
                "members": memberBalances
            };

            response.setJsonPayload(responsePayload);
            check caller->respond(response);
            return;
        }

    };
}
