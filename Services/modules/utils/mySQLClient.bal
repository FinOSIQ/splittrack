
import ballerinax/mysql;


configurable string host =?;
configurable string user =?;
configurable string password =?;
configurable int port =?;
configurable string database =?;


public final mysql:Client Client = check new(
    host = host,
    user = user,
    password = password,
    port = port,
    database = database
);
