import splittrack_backend.db;
import splittrack_backend.email as emailInterceptor;
import splittrack_backend.interceptor as authInterceptor;
import splittrack_backend.utils as cookie_utils;

import ballerina/http;
import ballerina/io;
import ballerina/log;
import ballerina/persist;
import ballerina/time;

// Get frontend URL from config
configurable string frontendUrl = ?;

final db:Client dbClient = check new ();

public function hello(string? name) returns string {
    if name !is () {
        return string `Hello, ${name}`;
    }
    return "Hello, World!";
}

public function getUserService() returns http:Service {
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
        resource function get sayHello(http:Caller caller, http:Request req) returns error? {

            io:println("Hello from the user service");

            // string stringResult = check id_store_util:generateUniqueExpenseId();
            // io:println(`${stringResult}`);

            // boolean booleanResult = id_store_util:storeId(stringResult);
            // io:println(`${booleanResult.toString()}`);

            // string[] listResult = id_store_util:getAllIds();
            // io:println(listResult.length());
            // if listResult.length() >= 0 {
            //     foreach var id in listResult {
            //         io:println("ID: " + id);
            //     }
            // } else {
            //     io:println("No IDs found");
            // }

            http:Response res = new;
            res.setPayload({"message": "Hello from authenticated endpoint"});
            check caller->respond(res);

        }

        // CREATE USER
        resource function post user(http:Caller caller, http:Request req) returns http:Created & readonly|error? {

            http:Response response = new;

            response.setHeader("Access-Control-Allow-Origin", frontendUrl);
            response.setHeader("Access-Control-Allow-Credentials", "true");
            response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
            response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

            // string? accessTokenn = cookie_utils:getCookieValue(req, "access_token");

            boolean|error isValid = authInterceptor:authenticate(req);
            if isValid is error || !isValid {
                io:println(isValid);
                response.statusCode = 401;
                response.setPayload({"error": "Unauthorized", "message": "Invalid or expired token"});
                check caller->respond(response);
                return;
            }

            string? authHeader = check req.getHeader("Authorization");
            if authHeader is () || !authHeader.startsWith("Bearer ") {
                return;
            }
            string accessToken = authHeader.substring(7).trim();

            http:Client userInfoClient = check new ("https://api.asgardeo.io/t/sparkz/oauth2/userinfo");
            http:Response|error userInfoResp = userInfoClient->get("", headers = {
                "Authorization": "Bearer " + accessToken
            });
            if userInfoResp is error {
                log:printError("Failed to fetch user info: " + userInfoResp.message());
                response.statusCode = http:STATUS_INTERNAL_SERVER_ERROR;
                response.setJsonPayload({"status": "error", "message": "Failed to fetch user info"});
                return caller->respond(response);
            }

            if userInfoResp.statusCode != http:STATUS_OK {
                log:printError("Failed to fetch user info: " + userInfoResp.statusCode.toString());
                response.statusCode = http:STATUS_UNAUTHORIZED;
                response.setJsonPayload({"status": "error", "message": "Invalid access token"});
                return caller->respond(response);
            }

            json userInfo = check userInfoResp.getJsonPayload();

            string id = check userInfo.sub.ensureType(string);
            string email = check userInfo.email.ensureType(string);
            string firstName = check userInfo.given_name.ensureType(string);
            string lastName = check userInfo.family_name.ensureType(string);
            string birthdate = check userInfo.birthdate.ensureType(string);
            string phoneNumber = check userInfo.phone_number.ensureType(string);

            db:UserWithRelations|persist:Error existingUser = dbClient->/users/[id];
            if existingUser is db:UserWithRelations {

                // Set cookies using utility function for existing user
                cookie_utils:setAuthCookies(response, accessToken, id);

                response.statusCode = http:STATUS_OK;
                response.setJsonPayload({"status": "success", "message": "User already exists", "userId": id});
                return caller->respond(response);
            } else if existingUser is persist:NotFoundError {
                time:Utc currentTime = time:utcNow();
                db:User newUser = {
                    user_Id: id,
                    email: email,
                    first_name: firstName,
                    last_name: lastName,
                    birthdate: birthdate,
                    phone_number: phoneNumber,
                    currency_pref: "USD",
                    status: 1,
                    created_at: currentTime,
                    updated_at: currentTime
                };

                string[]|error result = dbClient->/users.post([newUser]);
                if result is error {
                    log:printError("Database error: " + result.message());
                    response.statusCode = http:STATUS_INTERNAL_SERVER_ERROR;
                    response.setJsonPayload({"status": "error", "message": "Failed to create user in database"});
                    return caller->respond(response);
                }

                // Use the imported email function
                emailInterceptor:UserRegistrationEmailParams emailParams = {
                    recipientEmail: email,
                    firstName: firstName,
                    userId: id
                };

                string message = "User created successfully";

                boolean|error emailSent = emailInterceptor:sendUserRegistrationEmail(emailParams);
                if emailSent is error {
                    message = message + ". Email failed: " + emailSent.message();
                } else {
                    message = message + ". Email sent successfully";
                }

                // Set cookies using utility function for new user
                cookie_utils:setAuthCookies(response, accessToken, id);

                response.statusCode = http:STATUS_CREATED;
                response.setJsonPayload({
                    "status": "success",
                    "message": message,
                    "userId": id
                });
                return caller->respond(response);
            } else {
                response.statusCode = http:STATUS_INTERNAL_SERVER_ERROR;
                io:println("Database error: ", existingUser.message());
                response.setJsonPayload({"status": "error", "message": "Database error"});
                return caller->respond(response);
            }

        }

        // UPDATE USER
        resource function put user(http:Caller caller, http:Request req, @http:Payload UserUpdatePayload payload) returns http:Ok & readonly|error? {

            http:Response response = new;

            string? id = cookie_utils:getCookieValue(req, "user_id");

            boolean|error isValid = authInterceptor:authenticate(req);
            if isValid is error || !isValid {
                response.statusCode = 401;
                response.setPayload({"error": "Unauthorized", "message": "Invalid or expired token"});
                check caller->respond(response);
                return;
            }

            if id is () {
                response.statusCode = http:STATUS_BAD_REQUEST;
                response.setJsonPayload({"status": "error", "message": "User ID cookie not found"});
                return caller->respond(response);
            }

            db:UserWithRelations|persist:Error existingUser = dbClient->/users/[<string>id](db:User);
            if existingUser is persist:NotFoundError {
                response.statusCode = http:STATUS_NOT_FOUND;
                response.setJsonPayload({"status": "error", "message": "User not found"});
                return caller->respond(response);
            } else if existingUser is persist:Error {
                response.statusCode = http:STATUS_INTERNAL_SERVER_ERROR;
                response.setJsonPayload({"status": "error", "message": "Database error"});
                return caller->respond(response);
            }

            db:UserUpdate updateData = {
                first_name: payload.first_name,
                last_name: payload.last_name,
                phone_number: payload.phone_number,
                birthdate: payload.birthdate,
                currency_pref: payload.currency_pref,
                updated_at: time:utcNow()
            };

            db:User|persist:Error result = dbClient->/users/[id].put(updateData);
            if result is persist:Error {
                response.statusCode = http:STATUS_INTERNAL_SERVER_ERROR;
                response.setJsonPayload({"status": "error", "message": "Failed to update user"});
                return caller->respond(response);
            }

            response.statusCode = http:STATUS_OK;
            response.setJsonPayload({"status": "success", "message": "User updated successfully", "userId": id});
            return caller->respond(response);

        }

        // GET ALL USERS
        resource function get user(http:Caller caller, http:Request req) returns http:Ok & readonly|error? {
            http:Response response = new;

            stream<db:UserWithRelations, persist:Error?> userStream = dbClient->/users;
            db:UserWithRelations[] users = check from db:UserWithRelations user in userStream
                select user;

            // Build response data with timestamps
            json[] userData = [];
            foreach db:UserWithRelations user in users {
                json userInfo = {
                    "user_Id": user.user_Id,
                      "email": user?.email ?: (),
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "phone_number": user?.phone_number ?: (),
                    "birthdate": user?.birthdate ?: (),
                    "currency_pref": user?.currency_pref ?: (),

                    "status": user.status,
                    "created_at": user?.created_at ?: (),
                    "updated_at": user?.updated_at ?: ()
                };
                userData.push(userInfo);
            }

            response.statusCode = http:STATUS_OK;
            response.setJsonPayload({
                "status": "success",
                "message": "Users retrieved successfully",
                "data": userData,
                "count": userData.length()
            });
            return caller->respond(response);
        }

        // GET USER BY ID
        resource function get user_byid(http:Caller caller, http:Request req) returns http:Ok & readonly|error? {
            http:Response response = new;

            string? id = cookie_utils:getCookieValue(req, "user_id");

            boolean|error isValid = authInterceptor:authenticate(req);
            if isValid is error || !isValid {
                response.statusCode = 401;
                response.setPayload({"error": "Unauthorized", "message": "Invalid or expired token"});
                check caller->respond(response);
                return;
            }

            if id is () {
                response.statusCode = http:STATUS_BAD_REQUEST;
                response.setJsonPayload({"status": "error", "message": "User ID cookie not found"});
                return caller->respond(response);
            }

            db:UserWithRelations|persist:Error user = dbClient->/users/[id];
            if user is persist:NotFoundError {
                response.statusCode = http:STATUS_NOT_FOUND;
                response.setJsonPayload({"status": "error", "message": "User not found"});
                return caller->respond(response);
            } else if user is persist:Error {
                response.statusCode = http:STATUS_INTERNAL_SERVER_ERROR;
                response.setJsonPayload({"status": "error", "message": "Database error"});
                return caller->respond(response);
            }

            response.statusCode = http:STATUS_OK;
            
            // Build response data with timestamps
            if user is db:UserWithRelations {
                json userData = {
                    "user_Id": user.user_Id,
                         "email": user?.email ?: (),
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "phone_number": user?.phone_number ?: (),
                    "birthdate": user?.birthdate ?: (),
                    "currency_pref": user?.currency_pref ?: (),
                    "status": user.status,
                    "created_at": user?.created_at ?: (),
                    "updated_at": user?.updated_at ?: ()
                };
                
                response.setJsonPayload({
                    "status": "success",
                    "message": "User retrieved successfully",
                    "data": userData
                });
            } else {
                response.setJsonPayload({
                    "status": "success",
                    "message": "User retrieved successfully",
                    "data": {}
                });
            }
            return caller->respond(response);
        }

        // GET USER BY COOKIE (readonly)
        resource function get user_byCookie(http:Caller caller, http:Request req) returns http:Ok & readonly|error? {
            http:Response response = new;

            string? id = cookie_utils:getCookieValue(req, "user_id");

            if id is () {
                response.statusCode = http:STATUS_BAD_REQUEST;
                response.setJsonPayload({"status": "error", "message": "User ID cookie not found"});
                return caller->respond(response);
            }

            db:UserWithRelations|persist:Error user = dbClient->/users/[id];
            if user is persist:NotFoundError {
                response.statusCode = http:STATUS_NOT_FOUND;
                response.setJsonPayload({"status": "error", "message": "User not found"});
                return caller->respond(response);
            } else if user is persist:Error {
                response.statusCode = http:STATUS_INTERNAL_SERVER_ERROR;
                response.setJsonPayload({"status": "error", "message": "Database error"});
                return caller->respond(response);
            }

            // Return only the requested fields
            response.statusCode = http:STATUS_OK;
            response.setJsonPayload({
                "status": "success",
                "message": "User retrieved successfully",
                "data": {
                    "user_Id": user is db:UserWithRelations ? user.user_Id : "",
                    "first_name": user is db:UserWithRelations ? user.first_name : "",
                    "last_name": user is db:UserWithRelations ? user.last_name : "",
                    "currency_pref": user is db:UserWithRelations ? (user?.currency_pref ?: "USD") : "USD",
                    "created_at": user is db:UserWithRelations ? (user?.created_at ?: ()) : (),
                    "updated_at": user is db:UserWithRelations ? (user?.updated_at ?: ()) : ()
                }
            });
            return caller->respond(response);
        }

        // DELETE USER BY ID
        resource function delete user(http:Caller caller, http:Request req) returns http:Ok & readonly|error? {
            http:Response response = new;

            string? id = cookie_utils:getCookieValue(req, "user_id");

            boolean|error isValid = authInterceptor:authenticate(req);
            if isValid is error || !isValid {
                response.statusCode = 401;
                response.setPayload({"error": "Unauthorized", "message": "Invalid or expired token"});
                check caller->respond(response);
                return;
            }

            if id is () {
                response.statusCode = http:STATUS_BAD_REQUEST;
                response.setJsonPayload({"status": "error", "message": "User ID cookie not found"});
                return caller->respond(response);
            }

            // First check if the user exists
            db:UserWithRelations|persist:Error existingUser = dbClient->/users/[id];
            if existingUser is persist:NotFoundError {
                response.statusCode = http:STATUS_NOT_FOUND;
                response.setJsonPayload({"status": "error", "message": "User not found"});
                return caller->respond(response);
            } else if existingUser is persist:Error {
                response.statusCode = http:STATUS_INTERNAL_SERVER_ERROR;
                response.setJsonPayload({"status": "error", "message": "Database error"});
                return caller->respond(response);
            }

            db:UserUpdate updateData = {
                status: 0,
                updated_at: time:utcNow()
            };

            db:User|persist:Error result = dbClient->/users/[id].put(updateData);
            if result is persist:Error {
                response.statusCode = http:STATUS_INTERNAL_SERVER_ERROR;
                response.setJsonPayload({"status": "error", "message": "Failed to deactivate user: " + result.message()});
                return caller->respond(response);
            }

            response.statusCode = http:STATUS_OK;
            response.setJsonPayload({
                "status": "success",
                "message": "User deleted successfully",
                "userId": id
            });
            return caller->respond(response);
        }

        // USER LOGOUT
        resource function post logout(http:Caller caller, http:Request req) returns http:Ok & readonly|error? {
            http:Response response = new;

           

            // Optional: Verify user is authenticated before logout
            // This is optional since we want to allow logout even with expired tokens
            string? userId = cookie_utils:getCookieValue(req, "user_id");

            // Clear authentication cookies using the utility function
            cookie_utils:clearAuthCookies(response);

            // Log the logout action (optional)
            if userId is string {
                log:printInfo("User logged out successfully: " + userId);
            } else {
                log:printInfo("Anonymous logout - clearing any existing cookies");
            }

            response.statusCode = http:STATUS_OK;
            response.setJsonPayload({
                "status": "success",
                "message": "Logged out successfully",
                "data": {
                    "logged_out": true,
                    "timestamp": time:utcNow()
                }
            });
            return caller->respond(response);
        }

    };

}

