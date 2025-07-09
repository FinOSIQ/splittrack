import splittrack_backend.db as db;
import splittrack_backend.utils;

import ballerina/http;
// import ballerina/io;

import ballerina/persist;
// import ballerina/sql;
import ballerina/time;
import ballerina/uuid;

import ballerina/log;

final db:Client dbClient = check new ();

public function getBankAccountService() returns http:Service {

    return @http:ServiceConfig {
        cors: {
            allowOrigins: ["http://localhost:5173"], // Your frontend origin
            allowMethods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
            allowHeaders: ["Content-Type", "Authorization"],
            allowCredentials: false,
            maxAge: 3600
        }
    } 
    service object {
        // CREATE: Add a new bank account
        resource function post bankAccounts(http:Caller caller, http:Request req) returns error? {
            // Get and validate JSON payload
            json payload = check req.getJsonPayload();
            
            // Extract required fields from payload
            json|error accountNoJson = payload.account_no;
            json|error bankJson = payload.bank;
            json|error branchJson = payload.branch;
            json|error userIdJson = payload.userId;
            
            // Validate required fields
            if accountNoJson is error || accountNoJson is () {
                return utils:sendErrorResponse(caller, http:STATUS_BAD_REQUEST, "Missing 'account_no' field");
            }
            if bankJson is error || bankJson is () {
                return utils:sendErrorResponse(caller, http:STATUS_BAD_REQUEST, "Missing 'bank' field");
            }
            if branchJson is error || branchJson is () {
                return utils:sendErrorResponse(caller, http:STATUS_BAD_REQUEST, "Missing 'branch' field");
            }
            if userIdJson is error || userIdJson is () {
                return utils:sendErrorResponse(caller, http:STATUS_BAD_REQUEST, "Missing 'userId' field");
            }
            
            // Convert to string
            string accountNo = accountNoJson.toString();
            string bank = bankJson.toString();
            string branch = branchJson.toString();
            string userId = userIdJson.toString();
            
            // Verify the user exists
            db:UserWithRelations|persist:Error userCheck = dbClient->/users/[userId];
            if userCheck is persist:NotFoundError {
                return utils:sendErrorResponse(caller, http:STATUS_NOT_FOUND, "User not found", "User with ID " + userId + " does not exist");
            } else if userCheck is persist:Error {
                return utils:sendErrorResponse(caller, http:STATUS_INTERNAL_SERVER_ERROR, "Database error", userCheck.message());
            }
            
            // Generate a UUID for the new bank account
            string accountId = uuid:createType4AsString();
            
            // Create a new bank account record
            time:Utc currentTime = time:utcNow();
            db:BankAccountInsert newBankAccount = {
                account_Id: accountId,
                account_no: accountNo,
                bank: bank,
                branch: branch,
                status: 1,  // Active status
                created_at: currentTime,
                updated_at: currentTime
            };
            
            // Insert the bank account into the database
            transaction {
                string[]|error result = dbClient->/bankaccounts.post([newBankAccount]);
                if result is error {
                    log:printError("Database error: " + result.message());
                    fail error("Failed to create bank account in database", statusCode = http:STATUS_INTERNAL_SERVER_ERROR);
                }
                
                check commit;
            } on fail error e {
                // Transaction failed (rolled back automatically)
                int statusCode = e.detail().hasKey("statusCode")
                    ? check e.detail().get("statusCode").ensureType(int)
                    : http:STATUS_INTERNAL_SERVER_ERROR;
                return utils:sendErrorResponse(caller, statusCode, "Failed to create bank account", e.message());
            }
            
            // Get the created bank account with relations for the response
            db:BankAccountWithRelations|error createdAccount = dbClient->/bankaccounts/[accountId]();
            if createdAccount is error {
                return utils:sendErrorResponse(caller, http:STATUS_INTERNAL_SERVER_ERROR, "Failed to retrieve created account", createdAccount.message());
            }
            
            // Prepare and send success response
            http:Response res = new;
            res.statusCode = http:STATUS_CREATED; // 201
            res.setJsonPayload({
                "status": "success",
                "message": "Bank account created successfully",
                "accountId": accountId,
                "data": createdAccount
            });
            
            return caller->respond(res);
        }
        
        
    };
}