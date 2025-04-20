import ballerina/http;  

public function sendErrorResponse(http:Caller caller, int statusCode, string errorMessage, string? details = ()) returns error? {
    http:Response res = new;
    res.statusCode = statusCode;
    json payload = {"error": errorMessage};
    if details is string {
        payload = check payload.mergeJson({"details": details});
    }
    res.setPayload(payload);
    return caller->respond(res);
}