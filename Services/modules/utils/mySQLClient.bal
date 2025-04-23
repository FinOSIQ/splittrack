
import ballerinax/mysql;


configurable string host =?;
configurable string user =?;
configurable string password =?;
configurable int port =?;
configurable string database =?;


public final mysql:Client Client = check new(
    host = "localhost",
    user = "root",
    password = "",
    port = 3306,
    database = "splittrack"
);
