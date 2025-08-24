// AUTO-GENERATED FILE. DO NOT MODIFY.

// This file is an auto-generated file by Ballerina persistence layer.
// It should not be modified by hand.

import ballerinax/mysql;

configurable int port = ?;
configurable string host = ?;
configurable string user = ?;
configurable string database = ?;
configurable string password = ?;
configurable mysql:Options & readonly connectionOptions = {
	ssl: {
		mode: mysql:SSL_VERIFY_CA,
		cert: { path: "certs/ca-3986efd6-aafc-41ba-bdb4-aa70eafd1a3f.pem", password: "" },
		allowPublicKeyRetrieval: true
	}
};

