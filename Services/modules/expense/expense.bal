import splittrack_backend.db;
import splittrack_backend.interceptor as authInterceptor;
import splittrack_backend.utils;

import ballerina/http;
import ballerina/io;
import ballerina/log;
import ballerina/persist;
import ballerina/sql;
import ballerina/time;
import ballerina/uuid;

// Get frontend URL from config
configurable string frontendUrl = ?;

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
            allowOrigins: [frontendUrl], // Frontend URL from config
            allowMethods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
            allowHeaders: ["Content-Type", "Authorization"],
            allowCredentials: true,
            maxAge: 3600
        }
    }
    
    service object {

        resource function post expense(http:Caller caller, http:Request req) returns http:Created & readonly|error? {

            http:Response response = new;

            boolean|error isValid = authInterceptor:authenticate(req);
            io:println("isValid: ", isValid);
            if isValid is error || !isValid {
                response.statusCode = 401;
                response.setJsonPayload({"status": "error", "message": "Unauthorized: Invalid or expired token"});
                check caller->respond(response);
                return;
            }

            // Get JSON payload manually to handle optional fields
            json|error jsonPayload = req.getJsonPayload();
            if jsonPayload is error {
                response.statusCode = 400;
                response.setJsonPayload({"status": "error", "message": "Invalid JSON payload"});
                check caller->respond(response);
                return;
            }

            // Manually construct the ExpenseCreatePayload with proper handling of optional fields
            ExpenseCreatePayload payload;
            do {
                json expenseIdJson = check jsonPayload.expense_Id;
                json nameJson = check jsonPayload.name;
                json totalAmountJson = check jsonPayload.expense_total_amount;
                json groupIdJson = check jsonPayload.usergroupGroup_Id;
                json participantJson = check jsonPayload.participant;

                payload = {
                    expense_Id: expenseIdJson is () ? () : expenseIdJson.toString(),
                    name: nameJson.toString(),
                    expense_total_amount: <decimal>totalAmountJson,
                    usergroupGroup_Id: groupIdJson is () ? () : groupIdJson.toString(),
                    participant: check constructParticipants(<json[]>participantJson)
                };
            } on fail var e {
                response.statusCode = 400;
                response.setJsonPayload({"status": "error", "message": "Invalid payload structure: " + e.message()});
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
            sql:ParameterizedQuery insertQuery = `INSERT INTO expense (expense_Id, name, expense_total_amount, expense_owe_amount, usergroupGroup_Id,status) 
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
                time:Utc currentTime = time:utcNow();
                // Handle guest users - create user in database if participant role is guest
                string? actualUserId = participant.userUser_Id;
                if participant.participant_role == "guest" || participant.participant_role == GUEST {
                    if participant.firstName is string && participant.lastName is string {
                        string guestFirstName = <string>participant.firstName;
                        string guestLastName = <string>participant.lastName;

                        // Generate a unique user ID for the guest
                        string guestUserId;
                        while true {
                            guestUserId = uuid:createType4AsString();
                            db:User|persist:Error existingUser = dbClient->/users/[guestUserId];
                            if existingUser is persist:NotFoundError {
                                break; // Unique ID found
                            } else if existingUser is persist:Error {
                                log:printError("Database error checking guest user ID: " + existingUser.message());
                                response.statusCode = 500;
                                response.setJsonPayload({"status": "error", "message": "Database error checking guest user ID"});
                                check caller->respond(response);
                                return;
                            }
                        }

                        // Create guest user in database
                        db:User newGuestUser = {
                            user_Id: guestUserId,
                            email: null, // Default email for guest users
                            first_name: guestFirstName,
                            last_name: guestLastName,
                            birthdate: "1900-01-01", // Default birthdate for guest users
                            phone_number: null, // Default phone for guest users
                            currency_pref: "USD", // Default currency
                            status: 1,
                            created_at: currentTime,
                            updated_at: currentTime
                        };

                        string[]|error guestUserResult = dbClient->/users.post([newGuestUser]);
                        if guestUserResult is error {
                            log:printError("Database error creating guest user: " + guestUserResult.message());
                            response.statusCode = 500;
                            response.setJsonPayload({"status": "error", "message": "Failed to create guest user in database"});
                            check caller->respond(response);
                            return;
                        }

                        actualUserId = guestUserId;
                    } else {
                        log:printError("Guest participant missing firstName or lastName");
                        response.statusCode = 400;
                        response.setJsonPayload({"status": "error", "message": "Guest participants must have firstName and lastName"});
                        check caller->respond(response);
                        return;
                    }
                }

                // Ensure actualUserId is not null
                if actualUserId is () {
                    log:printError("Participant userUser_Id is null for non-guest participant");
                    response.statusCode = 400;
                    response.setJsonPayload({"status": "error", "message": "Non-guest participants must have a valid userUser_Id"});
                    check caller->respond(response);
                    return;
                }

                db:ExpenseParticipant newParticipant = {
                    participant_Id: participantId,
                    participant_role: actualUserId == creatorId ? "Creator" : participant.participant_role,
                    owning_amount: participant.owning_amount,
                    expenseExpense_Id: expenseId,
                    userUser_Id: actualUserId,
                    status: 1,
                    created_at: currentTime,
                    updated_at: currentTime

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

            // Explicitly fetch participants for this expense
            stream<db:ExpenseParticipant, persist:Error?> participantsStream = dbClient->/expenseparticipants(
                whereClause = sql:queryConcat(`expenseExpense_Id = ${expenseId}`)
            );
            db:ExpenseParticipant[]|persist:Error participantRecords = from var p in participantsStream
                select p;

            if participantRecords is persist:Error {
                log:printError("Database error fetching expense participants: " + participantRecords.message());
                return utils:sendErrorResponse(caller, http:STATUS_INTERNAL_SERVER_ERROR, "Failed to fetch expense participants");
            }

            // Enhanced participant data with user information
            json[] enhancedParticipants = [];

            foreach db:ExpenseParticipant participant in participantRecords {
                // Fetch user details for each participant
                db:UserWithRelations|error userDetails = dbClient->/users/[participant.userUser_Id]();

                map<json> participantData = {
                    "participant_Id": participant.participant_Id,
                    "participant_role": participant.participant_role,
                    "owning_amount": participant.owning_amount,
                    "expenseExpense_Id": participant.expenseExpense_Id,
                    "userUser_Id": participant.userUser_Id,
                    "status": participant.status,
                    "created_at": participant?.created_at ?: (),
                    "updated_at": participant?.updated_at ?: ()
                };

                // Add user information if available
                if userDetails is db:UserWithRelations {
                    participantData = {
                        "participant_Id": participant.participant_Id,
                        "participant_role": participant.participant_role,
                        "owning_amount": participant.owning_amount,
                        "expenseExpense_Id": participant.expenseExpense_Id,
                        "userUser_Id": participant.userUser_Id,
                        "status": participant.status,
                        "created_at": participant?.created_at ?: (),
                        "updated_at": participant?.updated_at ?: (),
                        "user": {
                            "user_Id": userDetails.user_Id,
                            "first_name": userDetails?.first_name ?: "",
                            "last_name": userDetails?.last_name ?: "",
                            "email": userDetails?.email ?: ""
                        }
                    };
                } else {
                    // If user details not found, still include basic structure
                    participantData = {
                        "participant_Id": participant.participant_Id,
                        "participant_role": participant.participant_role,
                        "owning_amount": participant.owning_amount,
                        "expenseExpense_Id": participant.expenseExpense_Id,
                        "userUser_Id": participant.userUser_Id,
                        "status": participant.status,
                        "created_at": participant?.created_at ?: (),
                        "updated_at": participant?.updated_at ?: (),
                        "user": {
                            "user_Id": participant.userUser_Id,
                            "first_name": "Unknown",
                            "last_name": "User",
                            "email": ""
                        }
                    };
                }

                enhancedParticipants.push(participantData);
            }

            // Build response data with enhanced participant information

            json expenseData = {
                "expense_Id": expenseDetails.expense_Id,
                "name": expenseDetails.name,
                "expense_total_amount": expenseDetails.expense_total_amount,
                "expense_owe_amount": expenseDetails.expense_owe_amount,
                "status": expenseDetails.status,
                "created_at": expenseDetails?.created_at ?: (),
                "updated_at": expenseDetails?.updated_at ?: (),
                "expenseParticipants": enhancedParticipants,
                "transactions": expenseDetails?.transactions ?: (),
                "usergroup": expenseDetails?.usergroup ?: ()
            };

            json payload = {
                "status": "success",
                "message": "Expense retrieved successfully",
                "data": expenseData
            };
            res.setJsonPayload(payload);
            res.statusCode = http:STATUS_OK;
            return caller->respond(res);
        }

        // get non-group expense by id
        resource function get nonGroupExpense/[string expenseId](http:Caller caller, http:Request req) returns error? {
            // Get user ID from cookie for validation
            string? userId = utils:getCookieValue(req, "user_id");
            if userId == () {
                return utils:sendErrorResponse(
                        caller,
                        http:STATUS_BAD_REQUEST,
                        "Invalid 'user_id' cookie",
                        "Expected a valid 'user_id' cookie"
                );
            }

            // Fetch expense details
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

            // Check if expense has a group (non-group expenses should have null usergroupGroup_Id)
            if expenseDetails?.usergroup is db:UserGroup {
                // This expense belongs to a group, check if user is a member
                db:UserGroup usergroup = <db:UserGroup>expenseDetails?.usergroup;
                string groupId = usergroup.group_Id;

                stream<db:UserGroupMember, persist:Error?> groupMembers = dbClient->/usergroupmembers(
                    whereClause = sql:queryConcat(`groupGroup_Id = ${groupId} AND userUser_Id = ${userId}`)
                );
                db:UserGroupMember[]|persist:Error groupMemberRecords = from var m in groupMembers
                    select m;

                if groupMemberRecords is persist:Error {
                    log:printError("Database error checking group membership: " + groupMemberRecords.message());
                    return utils:sendErrorResponse(caller, http:STATUS_INTERNAL_SERVER_ERROR, "Failed to check group membership");
                }

                // If user is a member of the group, this is not a non-group expense for them
                if groupMemberRecords.length() > 0 {
                    return utils:sendErrorResponse(
                            caller,
                            http:STATUS_BAD_REQUEST,
                            "Invalid expense type",
                            "This expense belongs to a group where you are a member"
                    );
                }
            }

            // Verify user is a participant in this expense
            stream<db:ExpenseParticipant, persist:Error?> userParticipationStream = dbClient->/expenseparticipants(
                whereClause = sql:queryConcat(`expenseExpense_Id = ${expenseId} AND userUser_Id = ${userId}`)
            );
            db:ExpenseParticipant[]|persist:Error userParticipationRecords = from var p in userParticipationStream
                select p;

            if userParticipationRecords is persist:Error {
                log:printError("Database error checking user participation: " + userParticipationRecords.message());
                return utils:sendErrorResponse(caller, http:STATUS_INTERNAL_SERVER_ERROR, "Failed to check user participation");
            }

            if userParticipationRecords.length() == 0 {
                return utils:sendErrorResponse(
                        caller,
                        http:STATUS_FORBIDDEN,
                        "Access denied",
                        "You are not a participant in this expense"
                );
            }

            http:Response res = new;

            // Explicitly fetch participants for this expense
            stream<db:ExpenseParticipant, persist:Error?> participantsStream = dbClient->/expenseparticipants(
                whereClause = sql:queryConcat(`expenseExpense_Id = ${expenseId}`)
            );
            db:ExpenseParticipant[]|persist:Error participantRecords = from var p in participantsStream
                select p;

            if participantRecords is persist:Error {
                log:printError("Database error fetching expense participants: " + participantRecords.message());
                return utils:sendErrorResponse(caller, http:STATUS_INTERNAL_SERVER_ERROR, "Failed to fetch expense participants");
            }

            // Enhanced participant data with user information
            json[] enhancedParticipants = [];

            foreach db:ExpenseParticipant participant in participantRecords {
                // Fetch user details for each participant
                db:UserWithRelations|error userDetails = dbClient->/users/[participant.userUser_Id]();

                map<json> participantData = {
                    "participant_Id": participant.participant_Id,
                    "participant_role": participant.participant_role,
                    "owning_amount": participant.owning_amount,
                    "expenseExpense_Id": participant.expenseExpense_Id,
                    "userUser_Id": participant.userUser_Id,
                    "status": participant.status,
                    "created_at": participant.created_at is time:Utc ? participant.created_at.toString() : "",
                    "updated_at": participant.updated_at is time:Utc ? participant.updated_at.toString() : ""
                };

                // Add user information if available
                if userDetails is db:UserWithRelations {
                    participantData["user"] = {
                        "user_Id": userDetails.user_Id,
                        "first_name": userDetails?.first_name ?: "",
                        "last_name": userDetails?.last_name ?: "",
                        "email": userDetails?.email ?: ""
                    };
                } else {
                    // If user details not found, still include basic structure
                    participantData["user"] = {
                        "user_Id": participant.userUser_Id,
                        "first_name": "Unknown",
                        "last_name": "User",
                        "email": ""
                    };
                }

                enhancedParticipants.push(participantData);
            }

            // Build response data with enhanced participant information
            json expenseData = {
                "expense_Id": expenseDetails.expense_Id,
                "name": expenseDetails.name,
                "expense_total_amount": expenseDetails.expense_total_amount,
                "expense_owe_amount": expenseDetails.expense_owe_amount,
                "status": expenseDetails.status,
                "created_at": expenseDetails?.created_at is time:Utc ? expenseDetails?.created_at.toString() : "",
                "updated_at": expenseDetails?.updated_at is time:Utc ? expenseDetails?.updated_at.toString() : "",
                "expenseParticipants": enhancedParticipants,
                "transactions": expenseDetails?.transactions ?: [],
                "usergroup": (), // Always null for non-group expenses
                "isNonGroupExpense": true // Flag to indicate this is a non-group expense
            };

            json payload = {
                "status": "success",
                "message": "Non-group expense retrieved successfully",
                "data": expenseData
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
                    created_at: group.created_at ?: time:utcNow(),
                    updated_at: group.updated_at ?: time:utcNow(),
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
        resource function get nonGroupExpenses(http:Caller caller, http:Request req) returns http:Ok & readonly|error? {
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

                // Step 3: Use pure SQL to fetch expense details, including timestamps and usergroupGroup_Id which can be NULL
                sql:ParameterizedQuery expenseQuery = `SELECT expense_Id, name, usergroupGroup_Id, created_at, updated_at FROM expense WHERE expense_Id = ${expenseId}`;

                // Execute query with proper stream type
                stream<record {|
                    string expense_Id;
                    string name;
                    string? usergroupGroup_Id;
                    time:Utc created_at;
                    time:Utc updated_at;
                |}, sql:Error?> expenseStream = utils:Client->query(expenseQuery);

                // Process the stream result
                var result = check expenseStream.next();
                check expenseStream.close(); // Important: Close the stream

                record {|
                    string expense_Id;
                    string name;
                    string? usergroupGroup_Id;
                    time:Utc created_at;
                    time:Utc updated_at;
                |}? expenseRecord = result is record {|record {|string expense_Id; string name; string? usergroupGroup_Id; time:Utc created_at; time:Utc updated_at;|} value;|} ? result.value : ();
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

                // Step 8.5: Get transactions for this expense
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
                        t.expenseExpense_Id = ${expenseId} AND t.status = 1
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
                |}, sql:Error?> transactionsStream = utils:Client->query(transactionsQuery);

                json[] expenseTransactions = [];
                error? txnErr = from var txn in transactionsStream
                    do {
                        expenseTransactions.push({
                            "transaction_Id": txn.transaction_Id,
                            "payed_amount": txn.payed_amount,
                            "payee_IdUser_Id": txn.payee_IdUser_Id,
                            "payee_name": txn.first_name + " " + txn.last_name,
                            "status": txn.status,
                            "created_at": txn.created_at,
                            "updated_at": txn.updated_at
                        });
                    };
                check transactionsStream.close(); // Important: Close the stream

                if txnErr is error {
                    log:printError("Database error fetching transactions for expense " + expenseId + ": " + txnErr.message());
                    response.statusCode = 500;
                    response.setJsonPayload({"status": "error", "message": "Failed to fetch expense transactions"});
                    check caller->respond(response);
                    return;
                }

                // Step 10: Add the expense summary
                summaries.push({
                    expenseId: expenseId,
                    expenseName: expenseRecord.name,
                    participantNames: participantNames,
                    netAmount: netAmount,
                    created_at: expenseRecord.created_at,
                    updated_at: expenseRecord.updated_at,
                    transactions: expenseTransactions
                });
            }

            // Step 11: Send the response
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
            sql:ParameterizedQuery userQuery = `SELECT first_name, last_name FROM user WHERE user_Id = ${userId}`;
            stream<record {|string first_name; string last_name;|}, sql:Error?> userStream = utils:Client->query(userQuery);
            record {|string first_name; string last_name;|}? userRecord = ();
            error? uErr = from var u in userStream
                do {
                    userRecord = u;
                };
            check userStream.close(); // Important: Close the stream
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
            sql:ParameterizedQuery participantQuery = `SELECT expenseExpense_Id FROM expenseparticipant WHERE userUser_Id = ${userId}`;
            stream<record {|string expenseExpense_Id;|}, sql:Error?> participantStream = utils:Client->query(participantQuery);

            string[] expenseIds = [];
            error? e = from var p in participantStream
                do {
                    expenseIds.push(p.expenseExpense_Id);
                };
            check participantStream.close(); // Important: Close the stream
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
                sql:ParameterizedQuery allParticipantsQuery = `SELECT userUser_Id, participant_role, owning_amount FROM expenseparticipant WHERE expenseExpense_Id = ${expenseId}`;
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
                check allParticipantsStream.close(); // Important: Close the stream
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

            db:UserGroupMember[] groupMembers = groupMembersResult;

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

            db:Expense[] expenses = expensesResult;

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

                db:ExpenseParticipant[] participants = participantsResult;

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

        // Create  session for expense
        resource function post expense/session() returns ExpenseSession|http:BadRequest|http:InternalServerError {
            ExpenseSession|error session = createExpenseSession();
            if session is error {
                log:printError("Failed to create session", session);
                return http:INTERNAL_SERVER_ERROR;
            }
            return session;
        }

        // return session data by ID
        resource function get joinExpense/[string sessionId](http:Caller caller) returns error? {
            ExpenseSession|error session = getExpenseSession(sessionId);
            if session is error {
                return utils:sendErrorResponse(caller, http:STATUS_NOT_FOUND, "Session not found", "Session with ID " + sessionId + " does not exist or has expired");
            }

            // Return JSON response
            http:Response res = new;
            json payload = {
                "sessionId": sessionId,
                "guestUsers": session.guestUsers,
                "isValid": session.status == "active"
            };

            res.setJsonPayload(payload);
            res.statusCode = http:STATUS_OK;
            return caller->respond(res);
        }

        // Add guest to session via API
        resource function post joinExpense(http:Caller caller, @http:Payload GuestJoinRequest request) returns error? {
            GuestUser|error result = addGuestToSession(request.sessionId, request.firstName, request.lastName);
            if result is error {
                return utils:sendErrorResponse(caller, http:STATUS_BAD_REQUEST, "Failed to add guest", result.toString());
            }

            // Get updated session to return current guest list
            any|error cachedValue = sessionCache.get(request.sessionId);
            if cachedValue is error {
                return utils:sendErrorResponse(caller, http:STATUS_INTERNAL_SERVER_ERROR, "Session error", cachedValue.toString());
            }

            ExpenseSession session;
            if cachedValue is ExpenseSession {
                session = cachedValue;
            } else {
                return utils:sendErrorResponse(caller, http:STATUS_INTERNAL_SERVER_ERROR, "Invalid session data");
            }

            http:Response res = new;
            json payload = {
                "message": "Guest added successfully",
                "guestUser": {
                    "firstName": result.firstName,
                    "lastName": result.lastName
                },
                "totalGuests": session.guestUsers.length(),
                "allGuests": session.guestUsers
            };

            res.setJsonPayload(payload);
            res.statusCode = http:STATUS_CREATED;
            return caller->respond(res);
        }

        // Delete session by ID
        resource function delete session/[string sessionId](http:Caller caller) returns error? {
            // Check if session exists first
            any|error cachedValue = sessionCache.get(sessionId);
            if cachedValue is error {
                return utils:sendErrorResponse(caller, http:STATUS_NOT_FOUND, "Session not found", "Session with ID " + sessionId + " does not exist");
            }

            ExpenseSession session;
            if cachedValue is ExpenseSession {
                session = cachedValue;
            } else {
                return utils:sendErrorResponse(caller, http:STATUS_INTERNAL_SERVER_ERROR, "Invalid session data");
            }

            // Check if session is already closed/inactive
            if session.status == "closed" || session.status == "inactive" {
                return utils:sendErrorResponse(caller, http:STATUS_BAD_REQUEST, "Session already closed", "Session with ID " + sessionId + " is already closed or inactive");
            }

            // Remove session from cache (permanent deletion)
            error? removeResult = sessionCache.invalidate(sessionId);
            if removeResult is error {
                log:printError("Failed to delete session", removeResult);
                return utils:sendErrorResponse(caller, http:STATUS_INTERNAL_SERVER_ERROR, "Failed to delete session", removeResult.toString());
            }

            // Return success response
            http:Response res = new;
            json payload = {
                "message": "Session deleted successfully",
                "sessionId": sessionId,
                "deletedAt": time:utcNow()
            };

            res.setJsonPayload(payload);
            res.statusCode = http:STATUS_OK;
            return caller->respond(res);
        }

        // recent activity endpoint
       resource function get recentActivity(http:Caller caller, http:Request req) returns error? {
            http:Response response = new;

            // Get user ID from cookie
            string? userId = utils:getCookieValue(req, "user_id");
            if userId == () {
                response.statusCode = 400;
                response.setJsonPayload({
                    "status": "error",
                    "message": "User ID not found in request"
                });
                check caller->respond(response);
                return;
            }

            json[] activities = [];

            // Get recent expenses (last 30 days)
            sql:ParameterizedQuery expenseQuery = `
        SELECT 
            ep.expenseExpense_Id,
            ep.participant_role,
            ep.owning_amount,
            ep.created_at,
            e.name as expense_name,
            e.expense_total_amount,
            e.usergroupGroup_Id
    FROM expenseparticipant ep
    JOIN expense e ON ep.expenseExpense_Id = e.expense_Id
        WHERE ep.userUser_Id = ${userId}
        AND ep.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        ORDER BY ep.created_at DESC
        LIMIT 10
    `;

            stream<record {}, persist:Error?> expenseStream = dbClient->queryNativeSQL(expenseQuery);

            error? expenseErr = from record {} row in expenseStream
                do {
                    string expenseId = <string>row["expenseExpense_Id"];
                    string participantRole = <string>row["participant_role"];
                    decimal owingAmount = <decimal>row["owning_amount"];
                    string expenseName = <string>row["expense_name"];
                    decimal totalAmount = <decimal>row["expense_total_amount"];

                    // Handle nullable group ID
                    string? groupId = ();
                    if row.hasKey("usergroupGroup_Id") && row["usergroupGroup_Id"] !is () {
                        groupId = <string>row["usergroupGroup_Id"];
                    }

                    string description = "";

                    if participantRole == "Creator" || participantRole == "creator" {
                        // User created the expense - implement scenarios 1, 2, 3

                        // Get all participants count
                        sql:ParameterizedQuery participantCountQuery = `
                    SELECT COUNT(*) as total_participants
                    FROM expenseparticipant 
                    WHERE expenseExpense_Id = ${expenseId}
                `;

                        stream<record {}, persist:Error?> countStream = dbClient->queryNativeSQL(participantCountQuery);
                        int totalParticipants = 1; // default

                        check from record {} countRow in countStream
                            do {
                                totalParticipants = <int>countRow["total_participants"];
                            };

                        if groupId is string {
                            // Get group name
                            sql:ParameterizedQuery groupQuery = `SELECT name FROM usergroup WHERE group_Id = ${groupId}`;
                            stream<record {}, persist:Error?> groupStream = dbClient->queryNativeSQL(groupQuery);

                            string groupName = "Unknown Group";
                            check from record {} groupRow in groupStream
                                do {
                                    groupName = <string>groupRow["name"];
                                };

                            // Check if there are non-group participants
                            sql:ParameterizedQuery nonGroupQuery = `
                        SELECT COUNT(*) as non_group_count
                        FROM expenseparticipant ep
                        LEFT JOIN usergroupmember ugm ON ep.userUser_Id = ugm.userUser_Id AND ugm.groupGroup_Id = ${groupId}
                        WHERE ep.expenseExpense_Id = ${expenseId} 
                        AND ep.userUser_Id != ${userId}
                        AND ugm.userUser_Id IS NULL
                    `;

                            stream<record {}, persist:Error?> nonGroupStream = dbClient->queryNativeSQL(nonGroupQuery);
                            int nonGroupCount = 0;

                            check from record {} ngRow in nonGroupStream
                                do {
                                    nonGroupCount = <int>ngRow["non_group_count"];
                                };

                            int groupMemberCount = totalParticipants - nonGroupCount;

                            if nonGroupCount > 0 {
                                // Scenario 2: Group + non-group users
                                description = string `You created ${expenseName} for LKR ${totalAmount} with ${groupMemberCount} people from ${groupName} and ${nonGroupCount} others`;
                            } else {
                                // Scenario 1: Group expense only  
                                description = string `You created ${expenseName} for LKR ${totalAmount} with ${totalParticipants} people in ${groupName}`;
                            }
                        } else {
                            // Scenario 3: Just users, no group
                            description = string `You created ${expenseName} for LKR ${totalAmount} with ${totalParticipants} people`;
                        }

                    } else {
                        // Scenario 4: Someone added you - get creator name
                        sql:ParameterizedQuery creatorQuery = `
                    SELECT u.first_name
                    FROM expenseparticipant ep
                    JOIN user u ON ep.userUser_Id = u.user_Id
                    WHERE ep.expenseExpense_Id = ${expenseId}
                    AND (ep.participant_role = 'Creator' OR ep.participant_role = 'creator')
                `;

                        stream<record {}, persist:Error?> creatorStream = dbClient->queryNativeSQL(creatorQuery);
                        string creatorName = "Someone";

                        check from record {} creatorRow in creatorStream
                            do {
                                creatorName = <string>creatorRow["first_name"];
                            };

                        description = string `You were added to ${expenseName} by ${creatorName} - you owe LKR ${owingAmount}`;
                    }

                    json activity = {
                        "activityType": "expense",
                        "id": expenseId,
                        "timestamp": <string>row["created_at"],
                        "description": description
                    };

                    activities.push(activity);
                };

            if expenseErr is error {
                log:printError("Error processing expenses: " + expenseErr.message());
                response.statusCode = 500;
                response.setJsonPayload({"status": "error", "message": "Failed to fetch expense activities"});
                check caller->respond(response);
                return;
            }

            // CORRECTED TRANSACTION LOGIC
            sql:ParameterizedQuery transactionQuery = `
        SELECT 
            t.transaction_Id,
            t.payed_amount,
            t.created_at,
            t.payee_idUser_Id,
            t.expenseExpense_Id,
            e.name as expense_name,
            payer.first_name as payer_name,
            creator.first_name as creator_name,
            creator.user_Id as creator_id
    FROM transaction t
    JOIN expense e ON t.expenseExpense_Id = e.expense_Id
    JOIN user payer ON t.payee_idUser_Id = payer.user_Id
    JOIN expenseparticipant ep_creator ON e.expense_Id = ep_creator.expenseExpense_Id 
        AND (ep_creator.participant_role = 'Creator' OR ep_creator.participant_role = 'creator')
    JOIN user creator ON ep_creator.userUser_Id = creator.user_Id
        WHERE (t.payee_idUser_Id = ${userId} OR ep_creator.userUser_Id = ${userId})
        AND t.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        ORDER BY t.created_at DESC
        LIMIT 10
    `;

            stream<record {}, persist:Error?> transactionStream = dbClient->queryNativeSQL(transactionQuery);

            error? transactionErr = from record {} row in transactionStream
                do {
                    string transactionId = <string>row["transaction_Id"];
                    decimal payedAmount = <decimal>row["payed_amount"];
                    string expenseName = <string>row["expense_name"];
                    string payerName = <string>row["payer_name"];
                    string creatorName = <string>row["creator_name"];
                    string payerId = <string>row["payee_idUser_Id"];
                    string creatorId = <string>row["creator_id"];

                    string description = "";

                    if payerId == userId {
                        // Scenario 5: You made the payment (you are the payer)
                        description = string `You paid ${creatorName} LKR ${payedAmount} for ${expenseName}`;
                    } else if creatorId == userId {
                        // Scenario 6: Someone paid you (you are the creator who received payment)
                        description = string `${payerName} paid you LKR ${payedAmount} for ${expenseName}`;
                    }

                    // Only add if description was set (user is involved in this transaction)
                    if description != "" {
                        json activity = {
                            "activityType": "transaction",
                            "id": transactionId,
                            "timestamp": <string>row["created_at"],
                            "description": description
                        };

                        activities.push(activity);
                    }
                };

            if transactionErr is error {
                log:printError("Error processing transactions: " + transactionErr.message());
                response.statusCode = 500;
                response.setJsonPayload({"status": "error", "message": "Failed to fetch transaction activities"});
                check caller->respond(response);
                return;
            }

            // Send response
            response.statusCode = 200;
            response.setJsonPayload({
                "status": "success",
                "totalActivities": activities.length(),
                "activities": activities
            });
            check caller->respond(response);
            return;
        }
        // Dedicated API for non-group expense details
        resource function get nonGroupExpenseDetails/[string expenseId](http:Caller caller, http:Request req) returns error? {
            http:Response res = new;

            // First check if this expense exists and get basic info
            sql:ParameterizedQuery expenseCheckQuery = `
        SELECT expense_Id, name, expense_total_amount, expense_owe_amount, status, 
               created_at, updated_at, usergroupGroup_Id
    FROM expense 
        WHERE expense_Id = ${expenseId}
    `;

            stream<record {}, persist:Error?> expenseStream = dbClient->queryNativeSQL(expenseCheckQuery);
            record {}? expenseRecord = ();

            error? expenseErr = from record {} row in expenseStream
                do {
                    expenseRecord = row;
                };

            if expenseErr is error {
                log:printError("Database error fetching expense: " + expenseErr.message());
                return utils:sendErrorResponse(caller, http:STATUS_INTERNAL_SERVER_ERROR, "Failed to fetch expense");
            }

            if expenseRecord is () {
                return utils:sendErrorResponse(caller, http:STATUS_NOT_FOUND, "Expense not found", "Expense with ID " + expenseId + " does not exist");
            }

            // Check if it's a non-group expense (usergroupGroup_Id should be null or empty)
            anydata groupIdValue = expenseRecord["usergroupGroup_Id"];
            if groupIdValue is string && groupIdValue.trim() != "" {
                return utils:sendErrorResponse(caller, http:STATUS_BAD_REQUEST, "Invalid expense type", "This expense belongs to a group. Use the regular expense endpoint.");
            }

            // Fetch participants with user details in one query
            sql:ParameterizedQuery participantsQuery = `
        SELECT ep.participant_Id, ep.participant_role, ep.owning_amount, 
               ep.expenseExpense_Id, ep.userUser_Id, ep.status, 
               ep.created_at as p_created_at, ep.updated_at as p_updated_at,
               u.user_Id, u.first_name, u.last_name, u.email
    FROM expenseparticipant ep
    JOIN user u ON ep.userUser_Id = u.user_Id
        WHERE ep.expenseExpense_Id = ${expenseId}
    `;

            stream<record {}, persist:Error?> participantsStream = dbClient->queryNativeSQL(participantsQuery);
            json[] enhancedParticipants = [];

            error? participantsErr = from record {} row in participantsStream
                do {
                    enhancedParticipants.push({
                        "participant_Id": <string>row["participant_Id"],
                        "participant_role": <string>row["participant_role"],
                        "owning_amount": <decimal>row["owning_amount"],
                        "expenseExpense_Id": <string>row["expenseExpense_Id"],
                        "userUser_Id": <string>row["userUser_Id"],
                        "status": <int>row["status"],
                        "created_at": <string>row["p_created_at"],
                        "updated_at": <string>row["p_updated_at"],
                        "user": {
                            "user_Id": <string>row["user_Id"],
                            "first_name": <string>row["first_name"],
                            "last_name": <string>row["last_name"],
                            "email": <string>row["email"]
                        }
                    });
                };

            if participantsErr is error {
                log:printError("Database error fetching participants: " + participantsErr.message());
                return utils:sendErrorResponse(caller, http:STATUS_INTERNAL_SERVER_ERROR, "Failed to fetch participants");
            }

            // Fetch transactions for this expense
            sql:ParameterizedQuery transactionsQuery = `
        SELECT transaction_Id, payed_amount, payee_idUser_Id, status, 
               created_at, updated_at
    FROM transaction 
        WHERE expenseExpense_Id = ${expenseId}
    `;

            stream<record {}, persist:Error?> transactionsStream = dbClient->queryNativeSQL(transactionsQuery);
            json[] transactionsData = [];

            error? transactionsErr = from record {} row in transactionsStream
                do {
                    transactionsData.push({
                        "transaction_Id": <string>row["transaction_Id"],
                        "payed_amount": <decimal>row["payed_amount"],
                        "expenseExpense_Id": expenseId,
                        "payee_idUser_Id": <string>row["payee_idUser_Id"],
                        "status": <int>row["status"],
                        "created_at": <string>row["created_at"],
                        "updated_at": <string>row["updated_at"]
                    });
                };

            if transactionsErr is error {
                log:printError("Database error fetching transactions: " + transactionsErr.message());
            }

            // Build response data for non-group expense
            json expenseData = {
                "expense_Id": <string>expenseRecord["expense_Id"],
                "name": <string>expenseRecord["name"],
                "expense_total_amount": <decimal>expenseRecord["expense_total_amount"],
                "expense_owe_amount": <decimal>expenseRecord["expense_owe_amount"],
                "status": <int>expenseRecord["status"],
                "created_at": <string>expenseRecord["created_at"],
                "updated_at": <string>expenseRecord["updated_at"],
                "expenseParticipants": enhancedParticipants,
                "transactions": transactionsData,
                "usergroup": null,
                "isGroupExpense": false
            };

            json payload = {
                "status": "success",
                "message": "Non-group expense retrieved successfully",
                "data": expenseData
            };

            res.setJsonPayload(payload);
            res.statusCode = http:STATUS_OK;
            return caller->respond(res);
        }

    };
}

// Helper function to construct ParticipantPayload array from JSON with optional fields
function constructParticipants(json[] participantJsonArray) returns ParticipantPayload[]|error {
    ParticipantPayload[] participants = [];

    foreach json participantJson in participantJsonArray {
        json roleJson = check participantJson.participant_role;
        json amountJson = check participantJson.owning_amount;
        json userIdJson = check participantJson.userUser_Id;

        // Get optional fields
        json|error firstNameResult = participantJson.firstName;
        json|error lastNameResult = participantJson.lastName;

        string? firstName = ();
        string? lastName = ();

        if firstNameResult is json && firstNameResult !is () {
            firstName = firstNameResult.toString();
        }

        if lastNameResult is json && lastNameResult !is () {
            lastName = lastNameResult.toString();
        }

        ParticipantPayload participant = {
            participant_role: <ParticipantRole>roleJson,
            owning_amount: <decimal>amountJson,
            userUser_Id: userIdJson is () ? () : userIdJson.toString(),
            firstName: firstName,
            lastName: lastName
        };

        participants.push(participant);
    }

    return participants;
}

