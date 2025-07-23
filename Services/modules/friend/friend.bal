import splittrack_backend.db as db;

import ballerina/http;
import ballerina/log;
import ballerina/sql;
import ballerina/uuid;

final db:Client dbClient = check new;

type FriendRequestOptionalized record {

};

public function getFriendService() returns http:Service {

    return @http:ServiceConfig {
        basePath: "/api_friend/v1",
        cors: {
            allowOrigins: ["http://localhost:5173"],
            allowMethods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
            allowHeaders: ["Content-Type", "Authorization"],
            allowCredentials: true,
            maxAge: 3600
        }
    } service object {

        // Get list of friends for a user
        resource function get friends/[string userId](http:Caller caller, http:Request req) returns error? {
            sql:ParameterizedQuery whereClause = user_id_1User_Id = ${userId} OR user_id_2User_Id = ${userId};

            stream<db:FriendWithRelations, error?> resultStream = dbClient->/friends.get(
                db:FriendWithRelations,
                whereClause
            );

            db:FriendWithRelations[] friends = [];

            error? e = resultStream.forEach(function(db:FriendWithRelations friend) {
                friends.push(friend);
            });
            if (e is error) {
                log:printError("Error retrieving friends from DB", err = e.toString());
                http:Response res = new;
                res.statusCode = http:STATUS_INTERNAL_SERVER_ERROR;
                res.setJsonPayload({"error": "Failed to retrieve friends"});
                check caller->respond(res);
                return;
            }

            // Build friend details array with name and email
            json[] friendDetails = [];

            foreach var friend in friends {
                db:UserOptionalized? otherUser = ();

                if friend.user_id_1User_Id == userId {
                    otherUser = friend.user_Id_2;
                } else {
                    otherUser = friend.user_Id_1;
                }

                if otherUser is db:UserOptionalized {
                    string fullName = "";

                    string? fname = otherUser.first_name;
                    if fname is string {
                        fullName += fname;
                    }

                    string? lname = otherUser.last_name;
                    if lname is string {
                        if fullName.length() > 0 {
                            fullName += " ";
                        }
                        fullName += lname;
                    }

                    friendDetails.push({
                        name: fullName,
                        email: otherUser.email ?: ""
                    });
                }

            }

            // Return the friendDetails JSON array
            http:Response res = new;
            res.statusCode = http:STATUS_OK;
            res.setJsonPayload({"friends": friendDetails});
            check caller->respond(res);
        }

        




 // Get friend requests received by a user
resource function get friendrequests/[string userId](http:Caller caller, http:Request req) returns error? {
    string userIdStr = userId;

    // Fetch all friend requests with relations
    stream<db:FriendRequestWithRelations, error?> friendRequestsStream = dbClient->/friendrequests(db:FriendRequestWithRelations);

    db:FriendRequestWithRelations[] filteredRequests = [];

    // Filter friend requests where receiver matches and status is pending
    error? e = friendRequestsStream.forEach(function(db:FriendRequestWithRelations fr) {
        if fr.receive_user_Id == userIdStr && fr.status == "pending" {
            filteredRequests.push(fr);
        }
    });

    if e is error {
        http:Response res = new;
        res.statusCode = http:STATUS_INTERNAL_SERVER_ERROR;
        res.setJsonPayload({"error": "Error iterating friend requests"});
        check caller->respond(res);
        return;
    }

    json[] result = [];

    // Construct the JSON response array including friendReq_ID
    foreach var fr in filteredRequests {
        db:UserOptionalized? sender = fr.send_user_Id;

        string senderName = "";
        string senderEmail = "";

        if sender is db:UserOptionalized {
            string? fname = sender.first_name;
            string? lname = sender.last_name;
            if fname is string {
                senderName += fname;
            }
            if lname is string {
                if senderName.length() > 0 {
                    senderName += " ";
                }
                senderName += lname;
            }
            senderEmail = sender.email ?: "";
        }

        result.push({
            friendReq_ID: fr.friendReq_ID,  // This line is crucial for frontend ID
            senderName: senderName,
            senderEmail: senderEmail,
            senderImage: "placeholder.png" // Replace with actual image URL if available
        });
    }

    http:Response res = new;
    res.statusCode = http:STATUS_OK;
    res.setJsonPayload({friendRequests: result});
    check caller->respond(res);
}



        // Send a friend request
        resource function post friendrequests/send(http:Caller caller, http:Request req) returns error? {
            // Parse JSON payload from request
            json|error jsonPayload = req.getJsonPayload();
            if (jsonPayload is error) {
                log:printError("Invalid JSON payload received in send friend request", err = jsonPayload.toString());
                http:Response res = new;
                res.statusCode = http:STATUS_BAD_REQUEST;
                res.setJsonPayload({"error": "Invalid JSON payload"});
                check caller->respond(res);
                return;
            }

            map<json> payloadMap = <map<json>>jsonPayload;

            // Validate required keys
            if !payloadMap.hasKey("send_user_idUser_Id") || !payloadMap.hasKey("receive_user_Id") {
                log:printError("Missing required fields in send friend request payload");
                http:Response res = new;
                res.statusCode = http:STATUS_BAD_REQUEST;
                res.setJsonPayload({"error": "Missing required fields: send_user_idUser_Id and receive_user_Id"});
                check caller->respond(res);
                return;
            }

            // Extract sender and receiver IDs as strings
            string senderId = <string>payloadMap["send_user_idUser_Id"];
            string receiverId = <string>payloadMap["receive_user_Id"];

            // Create unique friend request ID
            string fullUuid = uuid:createType4AsString().toString();
            string friendReq_ID = "fr-" + fullUuid.substring(0, 8);

            // Construct new FriendRequest record
            db:FriendRequest newRequest = {
                friendReq_ID: friendReq_ID,
                send_user_idUser_Id: senderId,
                receive_user_Id: receiverId,
                status: "pending"
            };

            // Insert new friend request into DB
            var insertResult = dbClient->/friendrequests.post([newRequest]);

            if (insertResult is error) {
                log:printError("Failed to insert friend request into DB", err = insertResult.toString());
                http:Response res = new;
                res.statusCode = http:STATUS_INTERNAL_SERVER_ERROR;
                res.setJsonPayload({"error": "Failed to insert friend request"});
                check caller->respond(res);
                return;
            }

            // Success response
            json response = {
                message: "Friend request sent successfully",
                requestId: newRequest.friendReq_ID
            };

            http:Response res = new;
            res.statusCode = http:STATUS_CREATED;
            res.setJsonPayload(response);
            check caller->respond(res);
        }

        //Accept or decline frined

        resource function put friendRequests/[string requestId](http:Caller caller, http:Request req) returns error? {
            json|error payload = req.getJsonPayload();
            if (payload is error) {
                http:Response res = new;
                res.statusCode = http:STATUS_BAD_REQUEST;
                res.setJsonPayload({"error": "Invalid JSON body"});
                check caller->respond(res);
                return;
            }

            string status = "";
            if payload is map<any> {
                var statusValue = payload["status"];
                if (statusValue is string) {
                    status = statusValue;
                    if (status != "accepted" && status != "declined") {
                        http:Response res = new;
                        res.statusCode = http:STATUS_BAD_REQUEST;
                        res.setJsonPayload({"error": "Status must be 'accepted' or 'declined'"});
                        check caller->respond(res);
                        return;
                    }
                } else {
                    http:Response res = new;
                    res.statusCode = http:STATUS_BAD_REQUEST;
                    res.setJsonPayload({"error": "Missing or invalid 'status' field"});
                    check caller->respond(res);
                    return;
                }
            }

            sql:ParameterizedQuery whereClause = friendReq_ID = ${requestId};
            stream<db:FriendRequest, error?> requestStream = dbClient->/friendrequests.get(db:FriendRequest, whereClause);

            db:FriendRequest? existingRequest = ();
            var nextResult = check requestStream.next();

            if nextResult is record {db:FriendRequest value;} {
                existingRequest = nextResult.value;
            }

            if existingRequest is db:FriendRequest {
                string sendUserId = existingRequest.send_user_idUser_Id;
                string receiveUserId = existingRequest.receive_user_Id;

            

                // Update the FriendRequest status
                sql:ParameterizedQuery updateQuery = UPDATE FriendRequest SET status = ${status} WHERE friendReq_ID = ${requestId};
                var updateResult = dbClient->executeNativeSQL(updateQuery);
                if updateResult is error {
                    http:Response res = new;
                    res.statusCode = http:STATUS_INTERNAL_SERVER_ERROR;
                    res.setJsonPayload({"error": "Failed to update friend request status"});
                    check caller->respond(res);
                    return;
                }

                if status == "accepted" {
                    string newFriendId = uuid:createType4AsString().toString();
                    string friend_Id = "fr-" + newFriendId.substring(0, 8);

                    sql:ParameterizedQuery insertFriendQuery = `INSERT INTO Friend 
            (friend_Id, user_id_1User_Id, user_id_2User_Id, status) 
            VALUES (${friend_Id}, ${sendUserId}, ${receiveUserId}, 1)`;

                    var insertFriendResult = dbClient->executeNativeSQL(insertFriendQuery);
                    if insertFriendResult is error {
                        http:Response res = new;
                        res.statusCode = http:STATUS_INTERNAL_SERVER_ERROR;
                        res.setJsonPayload({"error": "Failed to insert new friend"});
                        check caller->respond(res);
                        return;
                    }
                }

                http:Response res = new;
                res.statusCode = http:STATUS_NO_CONTENT;
                check caller->respond(res);
                return;
            } else {
                http:Response res = new;
                res.statusCode = http:STATUS_NOT_FOUND;
                res.setJsonPayload({"error": "Friend request not found"});
                check caller->respond(res);
                return;
            }
        }

    };
    
    // Get the total balance with a friend (friendExpense)
        resource function get friendExpense/[string friendId](http:Caller caller, http:Request req) returns error? {
            // Get current user from cookie
            string? currentUserId = utils:getCookieValue(req, "user_id");
            if currentUserId == () {
                http:Response res = new;
                res.statusCode = http:STATUS_BAD_REQUEST;
                res.setJsonPayload({"error": "Invalid 'user_id' cookie"});
                check caller->respond(res);
                return;
            }

            // Check if the two users are friends (status = 1) - Use utils:Client instead of dbClient
            sql:ParameterizedQuery friendCheckQuery = SELECT friend_Id FROM Friend WHERE ((user_id_1User_Id = ${currentUserId} AND user_id_2User_Id = ${friendId}) OR (user_id_1User_Id = ${friendId} AND user_id_2User_Id = ${currentUserId})) AND status = 1;
            stream<record {| string friend_Id; |}, sql:Error?> friendStream = utils:Client->query(friendCheckQuery);
            var friendResult = friendStream.next();
            check friendStream.close(); // Important: Close the stream
            
            if friendResult is error || !(friendResult is record {|record {|string friend_Id;|} value;|}) {
                http:Response res = new;
                res.statusCode = http:STATUS_FORBIDDEN;
                res.setJsonPayload({"error": "Not friends with this user"});
                check caller->respond(res);
                return;
            }

            // Get friend's name - Use utils:Client for consistency
            sql:ParameterizedQuery friendNameQuery = SELECT first_name, last_name FROM User WHERE user_Id = ${friendId};
            stream<record {| string? first_name; string? last_name; |}, sql:Error?> friendNameStream = utils:Client->query(friendNameQuery);
            var friendNameResult = friendNameStream.next();
            check friendNameStream.close(); // Important: Close the stream
            
            string friendName = "";
            if friendNameResult is record {|record {|string? first_name; string? last_name;|} value;|} {
                string? fname = friendNameResult.value.first_name;
                string? lname = friendNameResult.value.last_name;
                if fname is string {
                    friendName += fname;
                }
                if lname is string {
                    if friendName.length() > 0 {
                        friendName += " ";
                    }
                    friendName += lname;
                }
            }

            // Find all expenses where both users are participants
            sql:ParameterizedQuery expenseIdsQuery = SELECT DISTINCT ep1.expenseExpense_Id FROM ExpenseParticipant ep1 JOIN ExpenseParticipant ep2 ON ep1.expenseExpense_Id = ep2.expenseExpense_Id JOIN Expense e ON ep1.expenseExpense_Id = e.expense_Id WHERE ep1.userUser_Id = ${currentUserId} AND ep2.userUser_Id = ${friendId} AND ep1.status = 1 AND ep2.status = 1 AND e.status = 1;
            stream<record {| string expenseExpense_Id; |}, sql:Error?> expenseIdsStream = utils:Client->query(expenseIdsQuery);

            string[] expenseIds = [];
            error? e1 = from var row in expenseIdsStream do { expenseIds.push(row.expenseExpense_Id); };
            check expenseIdsStream.close(); // Important: Close the stream
            
            if e1 is error {
                http:Response res = new;
                res.statusCode = http:STATUS_INTERNAL_SERVER_ERROR;
                res.setJsonPayload({"error": "Failed to fetch expenses"});
                check caller->respond(res);
                return;
            }

            decimal netAmount = 0d;
            json[] expenseDetails = [];

            foreach string expenseId in expenseIds {
                // Get expense details including name, total amount, and creation date
                sql:ParameterizedQuery expenseQuery = SELECT name, expense_total_amount, created_at FROM Expense WHERE expense_Id = ${expenseId} AND status = 1;
                stream<record {| string name; decimal expense_total_amount; time:Utc? created_at; |}, sql:Error?> expenseStream = utils:Client->query(expenseQuery);
                var expenseResult = expenseStream.next();
                check expenseStream.close(); // Important: Close the stream
                
                string expenseName = "";
                decimal expenseTotalAmount = 0d;
                time:Utc? createdAt = ();
                if expenseResult is record {|record {|string name; decimal expense_total_amount; time:Utc? created_at;|} value;|} {
                    expenseName = expenseResult.value.name;
                    expenseTotalAmount = expenseResult.value.expense_total_amount;
                    createdAt = expenseResult.value.created_at;
                }

                // Get all participants for this expense
                sql:ParameterizedQuery participantsQuery = SELECT userUser_Id, participant_role, owning_amount FROM ExpenseParticipant WHERE expenseExpense_Id = ${expenseId} AND status = 1;
                stream<record {| string userUser_Id; string participant_role; decimal owning_amount; |}, sql:Error?> participantsStream = utils:Client->query(participantsQuery);
                record {| string userUser_Id; string participant_role; decimal owning_amount; |}[] participants = [];
                error? e2 = from var p in participantsStream do { participants.push(p); };
                check participantsStream.close(); // Important: Close the stream
                
                if e2 is error {
                    http:Response res = new;
                    res.statusCode = http:STATUS_INTERNAL_SERVER_ERROR;
                    res.setJsonPayload({"error": "Failed to fetch expense participants"});
                    check caller->respond(res);
                    return;
                }

                // Find roles and amounts for both users
                string? currentUserRole = ();
                decimal currentUserAmount = 0d;
                string? friendRole = ();
                decimal friendAmount = 0d;
                foreach var p in participants {
                    if p.userUser_Id == currentUserId {
                        currentUserRole = p.participant_role;
                        currentUserAmount = p.owning_amount;
                    } else if p.userUser_Id == friendId {
                        friendRole = p.participant_role;
                        friendAmount = p.owning_amount;
                    }
                }

                // Get transactions for this expense
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
                error? e3 = from var txn in transactionsStream 
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
                
                if e3 is error {
                    http:Response res = new;
                    res.statusCode = http:STATUS_INTERNAL_SERVER_ERROR;
                    res.setJsonPayload({"error": "Failed to fetch expense transactions"});
                    check caller->respond(res);
                    return;
                }

                // If current user is creator, friend owes them (add to netAmount)
                // If friend is creator, current user owes them (subtract from netAmount)
                if currentUserRole == "creator" && friendRole != "creator" {
                    netAmount += friendAmount;
                } else if friendRole == "creator" && currentUserRole != "creator" {
                    netAmount -= currentUserAmount;
                }

                // Add to details with expense name, total amount, creation date, and transactions
                json expenseDetail = {
                    "expenseId": expenseId,
                    "expenseName": expenseName,
                    "expenseTotalAmount": expenseTotalAmount,
                    "currentUserRole": currentUserRole,
                    "currentUserAmount": currentUserAmount,
                    "friendRole": friendRole,
                    "friendAmount": friendAmount,
                    "createdAt": createdAt is time:Utc ? createdAt.toString() : (),
                    "transactions": expenseTransactions
                };

                expenseDetails.push(expenseDetail);
            }

            // Prepare response
            json response = {
                "user_Id": currentUserId,
                "friend_Id": friendId,
                "friend_Name": friendName,
                "netAmount": netAmount,
                "details": expenseDetails
            };

            http:Response res = new;
            res.statusCode = http:STATUS_OK;
            res.setJsonPayload(response);
            check caller->respond(res);
        }

};
}