

import ballerina/http;
import ballerina/io;
import ballerina/sql;
import splittrack_backend.utils;

// Get frontend URL from config
configurable string frontendUrl = ?;





// public final mysql:Client Client = check new (
//     host = "localhost",
//     user = "root",
//     password = "",
//     port = 3306,
//     database = "splittrack"
// );

type SearchResponse record {
    json|error users?;
    json|error friends?;
    json|error groups?;
};

// Function returning `http:Service`

 

public function getSearchService() returns http:Service {
 
    
    return @http:ServiceConfig {
        cors: {
            allowOrigins: [frontendUrl], // Frontend URL from config
            allowMethods: ["GET", "POST", "OPTIONS","PUT", "DELETE"],
            allowHeaders: ["Content-Type", "Authorization"],
            allowCredentials: true,
            maxAge: 3600
        }
    } 
     service object {
        resource function get search(http:Caller caller, http:Request req) returns error? {

            string? userId = utils:getCookieValue(req, "user_id");
            if userId == () {
                return utils:sendErrorResponse(
                    caller, 
                    http:STATUS_BAD_REQUEST, 
                    "Invalid 'user_id' cookie", 
                    "Expected a valid 'user_id' cookie"
                );
            }    
            // Get query parameters
            map<string[]> queryParams = req.getQueryParams();
            string? searchValue = queryParams.hasKey("value") ? queryParams.get("value")[0] : ();
            // string? userId = queryParams.hasKey("userId") ? queryParams.get("userId")[0] : ();   
            string[] searchTypes = queryParams.get("type") is string[] ? queryParams.get("type") : [];



            io:println(searchTypes.length());
            if searchValue == () || searchTypes.length() == 0 {
                http:Response res = new;
                res.statusCode = http:STATUS_BAD_REQUEST;
                res.setPayload({"error": "Missing 'value' or 'type' query parameter"});
                check caller->respond(res);
                return;
            }


            
            // Validate types
            // string[] validTypes = ["users", "friends", "groups"];

            SearchResponse result = searchDatabase(searchValue, searchTypes,userId);
            check caller->respond(result.toString().toJson());
        }
    };
}

// Function to query the database based on multiple search types
function searchDatabase(string value, string[] types, string? userId) returns SearchResponse {
    SearchResponse response = {};

    if types.indexOf("users") != () {
        response.users = searchUsers(value, userId);
    }
    if types.indexOf("friends") != () {
        response.friends = searchFriends(userId,value);
    }
    if types.indexOf("groups") != () {
        response.groups = searchGroups(value, userId);
    }

    return response;
}

// Function to search users
function searchUsers(string value, string? userId) returns json|error {
    if userId == () {
        return {"error": "userId is required for users search"};
    }

    sql:ParameterizedQuery query = `SELECT user_id, first_name, email 
                                    FROM user 
                                    WHERE email IS NOT NULL
                                    AND user_id != ${userId}
                                    AND user_id NOT IN (
                                        SELECT CASE 
                                            WHEN f.user_id_1User_Id = ${userId} THEN f.user_id_2User_Id
                                            WHEN f.user_id_2User_Id = ${userId} THEN f.user_id_1User_Id
                                        END
                                        FROM friend f
                                        WHERE f.user_id_1User_Id = ${userId} OR f.user_id_2User_Id = ${userId}
                                    )
                                    AND (first_name LIKE ${"%" + value + "%"} 
                                       OR email LIKE ${"%" + value + "%"})`;
    stream<utils:JsonRecord, error?> resultStream = utils:Client->query(query);
    return  check utils:streamToJson(resultStream);
}

// Function to search friends
// Fixed function for searching friends
function searchFriends(string? userId, string value) returns json|error {
    if userId == () {
        return {"error": "userId is required for friends search"};
    }

    string searchTerm = "%" + value + "%";
    sql:ParameterizedQuery query = `SELECT u.user_id, u.first_name, u.email
                                    FROM friend f
                                    JOIN user u ON u.user_id = 
                                        CASE 
                                            WHEN f.user_id_1User_Id = ${userId} THEN f.user_id_2User_Id
                                            WHEN f.user_id_2User_Id = ${userId} THEN f.user_id_1User_Id
                                        END
                                    WHERE (f.user_id_1User_Id = ${userId} OR f.user_id_2User_Id = ${userId})
                                    AND u.first_name LIKE ${searchTerm}`;
    
    stream<utils:JsonRecord, error?> resultStream = utils:Client->query(query);
    return  check utils:streamToJson(resultStream);
}

// Fixed function for searching groups - only returns groups where current user is a member
function searchGroups(string value, string? userId) returns json|error {
    if userId == () {
        return {"error": "userId is required for groups search"};
    }

    string searchTerm = "%" + value + "%";
    
    // Query to find groups where the user is a member and group name matches search term
    sql:ParameterizedQuery query = `SELECT DISTINCT ug.group_Id, ug.name 
                                    FROM UserGroup ug
                                    INNER JOIN UserGroupMember ugm ON ug.group_Id = ugm.groupGroup_Id
                                    WHERE ugm.userUser_Id = ${userId} 
                                    AND ugm.status = 1
                                    AND ug.status = 1
                                    AND ug.name LIKE ${searchTerm}`;
    
    stream<utils:JsonRecord, error?> resultStream = utils:Client->query(query);
    return  check utils:streamToJson(resultStream);
}



