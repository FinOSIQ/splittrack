// cookie_utils.bal
import ballerina/http;

// Function to set HTTP-only cookies with both access token and user ID
public isolated function setAuthCookies(http:Response response, string accessToken, string userId) {
    // Create access token cookie with all properties set in the constructor
    http:Cookie accessTokenCookie = new ("access_token", accessToken,
        path = "/",
        httpOnly = true,
        secure = true,
        maxAge =  2592000
    );

    // Create user ID cookie with all properties set in the constructor
    http:Cookie userIdCookie = new ("user_id", userId,
        path = "/",
        httpOnly = true,
        secure = true,
        maxAge = 2592000
    );

    // Add cookies to response
    response.addCookie(accessTokenCookie);
    response.addCookie(userIdCookie);

    // Add manual Set-Cookie headers to reinforce the HttpOnly flag
    // This ensures the headers are explicitly set
    string accessTokenHeader = "access_token=" + accessToken + "; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=2592000";
    string userIdHeader = "user_id=" + userId + "; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=2592000";

    // Override any existing cookie headers to ensure HttpOnly is set
    response.setHeader("Set-Cookie", accessTokenHeader);
    response.addHeader("Set-Cookie", userIdHeader);
}

// Function to extract cookie value by name
public isolated function getCookieValue(http:Request request, string name) returns string? {
    http:Cookie[] cookies = request.getCookies();

    foreach http:Cookie cookie in cookies {
        if cookie.name == name {
            return cookie.value;
        }
    }

    return ();
}

// Function to invalidate and delete authentication cookies
public isolated function clearAuthCookies(http:Response response) {
    
    // Use only manual Set-Cookie headers to delete cookies
    // Ballerina doesn't allow empty string values in Cookie objects
    string expiredAccessTokenHeader = "access_token=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
    string expiredUserIdHeader = "user_id=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT";

    // Set the cookie headers to delete cookies
    response.setHeader("Set-Cookie", expiredAccessTokenHeader);
    response.addHeader("Set-Cookie", expiredUserIdHeader);
}

