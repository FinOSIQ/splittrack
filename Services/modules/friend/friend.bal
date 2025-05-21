import splittrack_backend.db as db;

import ballerina/http;
import ballerina/log;
import ballerina/sql;
import ballerina/uuid;

final db:Client dbClient = check new;

public function getFriendService() returns http:Service {
    return service object {

        // Get list of friends for a user
        resource function get friends/[string userId](http:Caller caller, http:Request req) returns error? {
            sql:ParameterizedQuery whereClause = `user_id_1User_Id = ${userId} OR user_id_2User_Id = ${userId}`;

            stream<db:FriendWithRelations, error?> resultStream = dbClient->/friends.get(
                db:FriendOptionalized,
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

            // Return the collected friends as JSON response
            http:Response res = new;
            res.statusCode = http:STATUS_OK;
            res.setJsonPayload({"friends": friends});
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
                result.push({
                    requestId: fr.friendReq_ID,
                    senderUserId: fr.send_user_idUser_Id,
                    receiverUserId: fr.receive_user_Id,
                    status: fr.status
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
            string friendReq_ID = "fr-" + uuid:createType4AsString().toString();

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
        // Accept or decline a friend request
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
                if statusValue is string {
                    status = statusValue;

                    if status != "accepted" && status != "declined" {
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
            } else {
                http:Response res = new;
                res.statusCode = http:STATUS_BAD_REQUEST;
                res.setJsonPayload({"error": "Invalid JSON structure"});
                check caller->respond(res);
                return;
            }

            // TODO: Update friend request status in database here

            json response = {message: "Friend request " + status + " successfully."};
            http:Response res = new;
            res.statusCode = http:STATUS_OK;
            res.setJsonPayload(response);
            check caller->respond(res);
        }
    };
}
