// utils.bal
import ballerina/http;

isolated function validateToken(string token) returns boolean|error {
    http:Client asgardeoClient = check new ("https://api.asgardeo.io/t/sparkz");
    http:Response userInfoResp = check asgardeoClient->get("/oauth2/userinfo", {
        "Authorization": "Bearer " + token
    });
    return userInfoResp.statusCode == 200;
}

public isolated function authenticate(http:Request req) returns boolean|error {
    string? authHeader = check req.getHeader("Authorization");
    if authHeader is () || !authHeader.startsWith("Bearer ") {
        return false;
    }
    string token = authHeader.substring(7).trim();
    return validateToken(token);
}