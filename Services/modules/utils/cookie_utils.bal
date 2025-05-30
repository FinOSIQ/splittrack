// cookie_utils.bal
import ballerina/http;

// Function to set HTTP-only cookies with both access token and user ID
public isolated function setAuthCookies(http:Response response, string accessToken, string userId) {
    // Create access token cookie with all properties set in the constructor
    http:Cookie accessTokenCookie = new ("access_token", accessToken,
        path = "/",
        httpOnly = true,
        secure = true,
        maxAge = 86400
    );

    // Create user ID cookie with all properties set in the constructor
    http:Cookie userIdCookie = new ("user_id", userId,
        path = "/",
        httpOnly = true,
        secure = true,
        maxAge = 86400
    );

    // Add cookies to response
    response.addCookie(accessTokenCookie);
    response.addCookie(userIdCookie);

    // Add manual Set-Cookie headers to reinforce the HttpOnly flag
    // This ensures the headers are explicitly set
    string accessTokenHeader = "access_token=" + accessToken + "; Path=/; HttpOnly; Secure; Max-Age=3600";
    string userIdHeader = "user_id=" + userId + "; Path=/; HttpOnly; Secure; Max-Age=3600";

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
