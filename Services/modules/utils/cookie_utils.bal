// cookie_utils.bal
import ballerina/http;

// Function to set HTTP-only cookies with both access token and user ID
public isolated function setAuthCookies(http:Response response, string accessToken, string userId) {
    // Create access token cookie with all properties set in the constructor
    http:Cookie accessTokenCookie = new ("access_token", accessToken,
        path = "/",
        httpOnly = true,
        secure = true,
        maxAge = 3600
    );

    // Create user ID cookie with all properties set in the constructor
    http:Cookie userIdCookie = new ("user_id", userId,
        path = "/",
        httpOnly = true,
        secure = true,
        maxAge = 3600
    );

    // Add cookies to response
    response.addCookie(accessTokenCookie);
    response.addCookie(userIdCookie);
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
