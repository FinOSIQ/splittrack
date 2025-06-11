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
            sql:ParameterizedQuery whereClause = `user_id_1User_Id = ${userId} OR user_id_2User_Id = ${userId}`;

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

            stream<db:FriendRequestWithRelations, error?> friendRequestsStream = dbClient->/friendrequests(db:FriendRequestWithRelations);

            db:FriendRequestWithRelations[] filteredRequests = [];

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

    sql:ParameterizedQuery whereClause = `friendReq_ID = ${requestId}`;
    stream<db:FriendRequest, error?> requestStream = dbClient->/friendrequests.get(db:FriendRequest, whereClause);

    db:FriendRequest? existingRequest = ();
    var nextResult = check requestStream.next();

    if nextResult is record {db:FriendRequest value;} {
        existingRequest = nextResult.value;
    }

    if existingRequest is db:FriendRequest {
        string sendUserId = existingRequest.send_user_idUser_Id;
        string receiveUserId = existingRequest.receive_user_Id;

        // *** NEW: Delete the friend request from FriendRequest table ***
        sql:ParameterizedQuery deleteQuery = `DELETE FROM FriendRequest WHERE friendReq_ID = ${requestId}`;
        var deleteResult = dbClient->executeNativeSQL(deleteQuery);
        if deleteResult is error {
            http:Response res = new;
            res.statusCode = http:STATUS_INTERNAL_SERVER_ERROR;
            res.setJsonPayload({"error": "Failed to delete friend request"});
            check caller->respond(res);
            return;
        }

        // *** NEW: Insert into friendrequestupdate table with updated status ***
        sql:ParameterizedQuery insertUpdateQuery = `INSERT INTO FriendRequestUpdate (friendReq_ID, status) VALUES (${requestId}, ${status})`;
        var insertUpdateResult = dbClient->executeNativeSQL(insertUpdateQuery);
        if insertUpdateResult is error {
            http:Response res = new;
            res.statusCode = http:STATUS_INTERNAL_SERVER_ERROR;
            res.setJsonPayload({"error": "Failed to log friend request update"});
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
}

