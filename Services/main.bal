import ballerina/http;

service / on new http:Listener(9090, {host: "0.0.0.0"}) {
    resource function get health() returns string {
        return "OK";
    }
}