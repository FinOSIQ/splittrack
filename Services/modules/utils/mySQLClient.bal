
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
    database = database,
    options = { ssl: {
        mode: mysql:SSL_VERIFY_CA,
        cert: { path: "certs/ca-3986efd6-aafc-41ba-bdb4-aa70eafd1a3f.pem", password: "" },
        allowPublicKeyRetrieval: true
    } }
);

