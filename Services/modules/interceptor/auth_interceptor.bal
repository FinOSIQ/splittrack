// utils.bal

// import splittrack_backend.utils as cookie_utils;

import ballerina/http;

isolated function validateToken(string token) returns boolean|error {
    http:Client asgardeoClient = check new ("https://api.asgardeo.io/t/sparkz");
    http:Response userInfoResp = check asgardeoClient->get("/oauth2/userinfo", {
        "Authorization": "Bearer " + token
    });
    return userInfoResp.statusCode == 200;
}

public isolated function authenticate(http:Request req) returns boolean|error {

    // If not in header, try to get from cookie
    // string? cookieToken = cookie_utils:getCookieValue(req, "access_token");
    // if cookieToken is string {
    //     return validateToken(cookieToken);
    // }

    // First check for token in header 
    string? authHeader = check req.getHeader("Authorization");
    if authHeader is string && authHeader.startsWith("Bearer ") {
        string token = authHeader.substring(7).trim();
        return validateToken(token);
    }

    return false;
}
