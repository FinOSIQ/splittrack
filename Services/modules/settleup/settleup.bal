import splittrack_backend.db;
import splittrack_backend.email as emailInterceptor;
import splittrack_backend.utils;

import ballerina/http;
import ballerina/log;
import ballerina/persist;
import ballerina/sql;
import ballerina/time;
import ballerina/uuid;

// Get frontend URL from config
configurable string frontendUrl = ?;

final db:Client dbClient = check new ();

public function hello(string? name) returns string {
    if name !is () {
        return string `Hello, ${name}`;
    }
    return "Hello, World!";
}

// Settle Up Service
public function getSettleUpService() returns http:Service {
    return @http:ServiceConfig {
        cors: {
            allowOrigins: [frontendUrl],
            allowMethods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
            allowHeaders: ["Content-Type", "Authorization"],
            allowCredentials: true,
            maxAge: 3600
        }
    }
    
    service object {

        // Get users who owe money to me
        // Logic: Current user is expense creator, others are members who owe money
        resource function get owesToMe(http:Caller caller, http:Request req) returns error? {
            http:Response response = new;

            string? userId = utils:getCookieValue(req, "user_id");
            if userId == () {
                response.statusCode = 400;
                response.setJsonPayload({
                    "status": "error",
                    "message": "User ID not found in request",
                    "errorCode": "USER_ID_MISSING",
                    "timestamp": time:utcNow()[0]
                });
                check caller->respond(response);
                return;
            }

            sql:ParameterizedQuery query = `
        SELECT 
            u.user_Id,
            u.first_name,
            u.last_name,
            u.email,
            u.currency_pref,
            SUM(ep.owning_amount) as total_owing
        FROM ExpenseParticipant ep
        JOIN Expense e ON ep.expenseExpense_Id = e.expense_Id
        JOIN ExpenseParticipant creator_ep ON e.expense_Id = creator_ep.expenseExpense_Id 
            AND creator_ep.participant_role = 'Creator' 
            AND creator_ep.userUser_Id = ${userId}
        JOIN User u ON ep.userUser_Id = u.user_Id
        WHERE ep.participant_role = 'Member' 
            AND ep.userUser_Id != ${userId}
            AND e.status = 1
            AND ep.status = 1
        GROUP BY u.user_Id, u.first_name, u.last_name, u.email, u.currency_pref
        HAVING total_owing > 0
        ORDER BY total_owing DESC
    `;

            stream<record {}, persist:Error?> resultStream = dbClient->queryNativeSQL(query);
            OwesToMeResponse[] owesToMeList = [];

            error? processResult = from record {} row in resultStream
                do {
                    OwesToMeResponse owesToMe = {
                        userId: <string>row["user_Id"],
                        userName: <string>row["first_name"] + " " + <string>row["last_name"],
                        email: <string>row["email"],
                        totalOwingAmount: <decimal>row["total_owing"],
                        currency: <string>row["currency_pref"]
                    };
                    owesToMeList.push(owesToMe);
                };

            if processResult is error {
                log:printError("Database error in owes-to-me: " + processResult.message());
                response.statusCode = 500;
                response.setJsonPayload({
                    "status": "error",
                    "message": "Database error occurred",
                    "errorCode": "DATABASE_ERROR",
                    "timestamp": time:utcNow()[0]
                });
                check caller->respond(response);
                return;
            }

            response.statusCode = 200;
            response.setJsonPayload({
                "status": "success",
                "data": owesToMeList,
                "timestamp": time:utcNow()[0]
            });
            check caller->respond(response);
        }

        // Get users to whom I owe money
        resource function get iOwe(http:Caller caller, http:Request req) returns error? {
            http:Response response = new;

            // FIXED: Use dynamic userId instead of hardcoded
            string? userId = utils:getCookieValue(req, "user_id");
            if userId == () {
                response.statusCode = 400;
                response.setJsonPayload({
                    "status": "error",
                    "message": "User ID not found in request",
                    "errorCode": "USER_ID_MISSING",
                    "timestamp": time:utcNow()[0]
                });
                check caller->respond(response);
                return;
            }

            sql:ParameterizedQuery query = `
        SELECT 
            u.user_Id,
            u.first_name,
            u.last_name,
            u.email,
            u.currency_pref,
            SUM(ep.owning_amount) as total_owing
        FROM ExpenseParticipant ep
        JOIN Expense e ON ep.expenseExpense_Id = e.expense_Id
        JOIN ExpenseParticipant creator_ep ON e.expense_Id = creator_ep.expenseExpense_Id 
            AND creator_ep.participant_role = 'Creator'
        JOIN User u ON creator_ep.userUser_Id = u.user_Id
        WHERE ep.participant_role = 'Member' 
            AND ep.userUser_Id = ${userId}
            AND creator_ep.userUser_Id != ${userId}
            AND e.status = 1
            AND ep.status = 1
        GROUP BY u.user_Id, u.first_name, u.last_name, u.email, u.currency_pref
        HAVING total_owing > 0
        ORDER BY total_owing DESC
    `;

            stream<record {}, persist:Error?> resultStream = dbClient->queryNativeSQL(query);
            IOweResponse[] iOweList = [];

            error? processResult = from record {} row in resultStream
                do {
                    IOweResponse iOwe = {
                        userId: <string>row["user_Id"],
                        userName: <string>row["first_name"] + " " + <string>row["last_name"],
                        email: <string>row["email"],
                        totalOwingAmount: <decimal>row["total_owing"],
                        currency: <string>row["currency_pref"]
                    };
                    iOweList.push(iOwe);
                };

            if processResult is error {
                log:printError("Database error in i-owe: " + processResult.message());
                response.statusCode = 500;
                response.setJsonPayload({
                    "status": "error",
                    "message": "Database error occurred",
                    "errorCode": "DATABASE_ERROR",
                    "timestamp": time:utcNow()[0]
                });
                check caller->respond(response);
                return;
            }

            response.statusCode = 200;
            response.setJsonPayload({
                "status": "success",
                "data": iOweList,
                "timestamp": time:utcNow()[0]
            });
            check caller->respond(response);
        }

        // Get detailed expenses with specific creator
        resource function get expenseDetails/[string creatorId](http:Caller caller, http:Request req) returns error? {
            http:Response response = new;

            string? userId = utils:getCookieValue(req, "user_id");
            if userId == () {
                response.statusCode = 400;
                response.setJsonPayload({
                    "status": "error",
                    "message": "User ID not found in request",
                    "errorCode": "USER_ID_MISSING",
                    "timestamp": time:utcNow()[0]
                });
                check caller->respond(response);
                return;
            }

            // Check if creator exists
            db:User|persist:Error creatorUser = dbClient->/users/[creatorId];
            if creatorUser is persist:Error {
                response.statusCode = 404;
                response.setJsonPayload({
                    "status": "error",
                    "message": "Creator not found",
                    "errorCode": "CREATOR_NOT_FOUND",
                    "timestamp": time:utcNow()[0]
                });
                check caller->respond(response);
                return;
            }

            sql:ParameterizedQuery query = `
        SELECT
            e.expense_Id,
            e.name as expense_name,
            e.expense_total_amount,
            e.created_at,
            e.updated_at,
            ep.owning_amount as user_owing_amount,
            u.first_name,
            u.last_name,
            u.currency_pref
        FROM ExpenseParticipant ep
        JOIN Expense e ON ep.expenseExpense_Id = e.expense_Id
        JOIN ExpenseParticipant creator_ep ON e.expense_Id = creator_ep.expenseExpense_Id
            AND creator_ep.participant_role = 'Creator'
            AND creator_ep.userUser_Id = ${creatorId}
        JOIN User u ON creator_ep.userUser_Id = u.user_Id
        WHERE ep.participant_role = 'Member'
            AND ep.userUser_Id = ${userId}
            AND ep.owning_amount > 0
            AND e.status = 1
            AND ep.status = 1
        ORDER BY e.created_at DESC
    `;

            stream<record {}, persist:Error?> resultStream = dbClient->queryNativeSQL(query);
            ExpenseDetailResponse[] expenseDetailsList = [];

            error? processResult = from record {} row in resultStream
                do {
                    ExpenseDetailResponse expenseDetail = {
                        expenseId: <string>row["expense_Id"],
                        expenseName: <string>row["expense_name"],
                        expenseTotalAmount: <decimal>row["expense_total_amount"],
                        userOwingAmount: <decimal>row["user_owing_amount"],
                        creatorName: <string>row["first_name"] + " " + <string>row["last_name"],
                        createdAt: <string>row["created_at"],
                        updatedAt: <string>row["updated_at"]
                    };
                    expenseDetailsList.push(expenseDetail);
                };

            if processResult is error {
                log:printError("Database error in expenseDetails: " + processResult.message());
                response.statusCode = 500;
                response.setJsonPayload({
                    "status": "error",
                    "message": "Database error occurred",
                    "errorCode": "DATABASE_ERROR",
                    "timestamp": time:utcNow()[0]
                });
                check caller->respond(response);
                return;
            }

            response.statusCode = 200;
            response.setJsonPayload({
                "status": "success",
                "data": expenseDetailsList,
                "timestamp": time:utcNow()[0]
            });
            check caller->respond(response);
        }

        // Get detailed expenses where I'm creator and specific user owes me
        resource function get owesToMeDetails/[string memberId](http:Caller caller, http:Request req) returns error? {
            http:Response response = new;

            string? userId = utils:getCookieValue(req, "user_id");
            if userId == () {
                response.statusCode = 400;
                response.setJsonPayload({
                    "status": "error",
                    "message": "User ID not found in request",
                    "errorCode": "USER_ID_MISSING",
                    "timestamp": time:utcNow()[0]
                });
                check caller->respond(response);
                return;
            }

            // Check if member exists
            db:User|persist:Error memberUser = dbClient->/users/[memberId];
            if memberUser is persist:Error {
                response.statusCode = 404;
                response.setJsonPayload({
                    "status": "error",
                    "message": "Member not found",
                    "errorCode": "MEMBER_NOT_FOUND",
                    "timestamp": time:utcNow()[0]
                });
                check caller->respond(response);
                return;
            }

            sql:ParameterizedQuery query = `
        SELECT
            e.expense_Id,
            e.name as expense_name,
            e.expense_total_amount,
            e.created_at,
            e.updated_at,
            ep.owning_amount as member_owing_amount,
            u.first_name,
            u.last_name,
            u.currency_pref
        FROM ExpenseParticipant ep
        JOIN Expense e ON ep.expenseExpense_Id = e.expense_Id
        JOIN ExpenseParticipant creator_ep ON e.expense_Id = creator_ep.expenseExpense_Id
            AND creator_ep.participant_role = 'Creator'
            AND creator_ep.userUser_Id = ${userId}
        JOIN User u ON ep.userUser_Id = u.user_Id
        WHERE ep.participant_role = 'Member'
            AND ep.userUser_Id = ${memberId}
            AND ep.owning_amount > 0
            AND e.status = 1
            AND ep.status = 1
        ORDER BY e.created_at DESC
    `;

            stream<record {}, persist:Error?> resultStream = dbClient->queryNativeSQL(query);
            OwesToMeDetailResponse[] owesToMeDetailsList = [];

            error? processResult = from record {} row in resultStream
                do {
                    OwesToMeDetailResponse owesToMeDetail = {
                        expenseId: <string>row["expense_Id"],
                        expenseName: <string>row["expense_name"],
                        expenseTotalAmount: <decimal>row["expense_total_amount"],
                        memberOwingAmount: <decimal>row["member_owing_amount"],
                        memberName: <string>row["first_name"] + " " + <string>row["last_name"],
                        createdAt: <string>row["created_at"],
                        updatedAt: <string>row["updated_at"]

                    };
                    owesToMeDetailsList.push(owesToMeDetail);
                };

            if processResult is error {
                log:printError("Database error in owesToMeDetails: " + processResult.message());
                response.statusCode = 500;
                response.setJsonPayload({
                    "status": "error",
                    "message": "Database error occurred",
                    "errorCode": "DATABASE_ERROR",
                    "timestamp": time:utcNow()[0]
                });
                check caller->respond(response);
                return;
            }

            response.statusCode = 200;
            response.setJsonPayload({
                "status": "success",
                "data": owesToMeDetailsList,
                "timestamp": time:utcNow()[0]
            });
            check caller->respond(response);
        }

        // Settle up - Make payments on multiple expenses
        resource function post settleUp(http:Caller caller, http:Request req, @http:Payload SettleUpPayload payload) returns error? {
            http:Response response = new;

            string? userId = utils:getCookieValue(req, "user_id");
            if userId == () {
                response.statusCode = 400;
                response.setJsonPayload({
                    "status": "error",
                    "message": "User ID not found in request",
                    "errorCode": "USER_ID_MISSING",
                    "timestamp": time:utcNow()[0]
                });
                check caller->respond(response);
                return;
            }

            // Validate payload
            if payload.payments.length() == 0 {
                response.statusCode = 400;
                response.setJsonPayload({
                    "status": "error",
                    "message": "No payments provided",
                    "errorCode": "NO_PAYMENTS",
                    "timestamp": time:utcNow()[0]
                });
                check caller->respond(response);
                return;
            }

            // Process each payment in a transaction
            transaction {
                SettleUpResult[] results = [];

                foreach PaymentItem payment in payload.payments {
                    // Validate payment amount
                    if payment.paymentAmount <= 0d {
                        fail error("Invalid payment amount for expense: " + payment.expenseId, statusCode = http:STATUS_BAD_REQUEST);
                    }

                    // Get current expense participant record and expense creator details
                    sql:ParameterizedQuery checkQuery = `
                SELECT 
                    ep.owning_amount, 
                    ep.participant_Id,
                    e.name as expense_name,
                    creator_ep.userUser_Id as creator_user_id,
                    creator_user.email as creator_email,
                    creator_user.first_name as creator_first_name,
                    creator_user.last_name as creator_last_name,
                    payer_user.first_name as payer_first_name,
                    payer_user.last_name as payer_last_name,
                    payer_user.currency_pref as currency
                FROM ExpenseParticipant ep
                JOIN Expense e ON ep.expenseExpense_Id = e.expense_Id
                JOIN ExpenseParticipant creator_ep ON e.expense_Id = creator_ep.expenseExpense_Id 
                    AND creator_ep.participant_role = 'Creator'
                JOIN User creator_user ON creator_ep.userUser_Id = creator_user.user_Id
                JOIN User payer_user ON ep.userUser_Id = payer_user.user_Id
                WHERE ep.expenseExpense_Id = ${payment.expenseId}
                    AND ep.userUser_Id = ${userId}
                    AND ep.participant_role = 'Member'
                    AND e.status = 1
                    AND ep.status = 1
            `;

                    stream<record {}, persist:Error?> checkStream = dbClient->queryNativeSQL(checkQuery);
                    record {}? currentRecord = ();

                    error? checkResult = from record {} row in checkStream
                        do {
                            currentRecord = row;
                        };

                    if checkResult is error {
                        fail error("Database error checking expense: " + checkResult.message(), statusCode = http:STATUS_INTERNAL_SERVER_ERROR);
                    }

                    if currentRecord == () {
                        fail error("Expense not found or user is not a member: " + payment.expenseId, statusCode = http:STATUS_NOT_FOUND);
                    }

                    decimal currentOwingAmount = <decimal>currentRecord["owning_amount"];
                    string participantId = <string>currentRecord["participant_Id"];

                    // Extract data for email notification
                    string expenseName = <string>currentRecord["expense_name"];
                    string creatorEmail = <string>currentRecord["creator_email"];
                    string creatorFirstName = <string>currentRecord["creator_first_name"];
                    string creatorLastName = <string>currentRecord["creator_last_name"];
                    string payerFirstName = <string>currentRecord["payer_first_name"];
                    string payerLastName = <string>currentRecord["payer_last_name"];

                    // Check if payment amount exceeds owing amount
                    if payment.paymentAmount > currentOwingAmount {
                        fail error("Payment amount exceeds owing amount for expense: " + payment.expenseId, statusCode = http:STATUS_BAD_REQUEST);
                    }

                    // Calculate new owing amount
                    decimal newOwingAmount = currentOwingAmount - payment.paymentAmount;

                    // Update the expense participant record
                    sql:ParameterizedQuery updateQuery = `
                UPDATE ExpenseParticipant 
                SET owning_amount = ${newOwingAmount},
                    updated_at = NOW()
                WHERE participant_Id = ${participantId}
            `;

                    sql:ExecutionResult|persist:Error updateResult = dbClient->executeNativeSQL(updateQuery);
                    if updateResult is persist:Error {
                        fail error("Failed to update expense: " + updateResult.message(), statusCode = http:STATUS_INTERNAL_SERVER_ERROR);
                    }

                    // Create transaction record
                    string transactionId = uuid:createRandomUuid().toString();

                    sql:ParameterizedQuery insertTransactionQuery = `
                INSERT INTO Transaction (
                    transaction_Id, 
                    payed_amount, 
                    expenseExpense_Id, 
                    payee_idUser_Id, 
                    status, 
                    created_at, 
                    updated_at
                ) VALUES (
                    ${transactionId},
                    ${payment.paymentAmount},
                    ${payment.expenseId},
                    ${userId},
                    1,
                    NOW(),
                    NOW()
                )
            `;

                    sql:ExecutionResult|persist:Error transactionResult = dbClient->executeNativeSQL(insertTransactionQuery);
                    if transactionResult is persist:Error {
                        fail error("Failed to create transaction record: " + transactionResult.message(), statusCode = http:STATUS_INTERNAL_SERVER_ERROR);
                    }

                    // Send email notification to expense creator (async, don't fail transaction if email fails)
                    PaymentNotificationEmailParams emailParams = {
                        recipientEmail: creatorEmail,
                        recipientName: creatorFirstName + " " + creatorLastName,
                        payerName: payerFirstName + " " + payerLastName,
                        expenseName: expenseName,
                        paymentAmount: payment.paymentAmount,
                        remainingAmount: newOwingAmount,
                        currency: "LKR"
                    };

                    // Send email asynchronously (don't block transaction)
                    boolean|error emailResult = emailInterceptor:sendPaymentNotificationEmail(emailParams);
                    if emailResult is error {
                        log:printError("Failed to send payment notification email for expense " + payment.expenseId + ": " + emailResult.message());
                    } else {
                        log:printInfo("Payment notification email sent successfully for expense: " + payment.expenseId);
                    }

                    // Add to results
                    SettleUpResult result = {
                        expenseId: payment.expenseId,
                        paymentAmount: payment.paymentAmount,
                        previousOwingAmount: currentOwingAmount,
                        newOwingAmount: newOwingAmount,
                        isFullyPaid: newOwingAmount == 0d
                    };
                    results.push(result);
                }

                response.statusCode = 200;
                response.setJsonPayload({
                    "status": "success",
                    "message": "Payments processed successfully",
                    "data": results,
                    "timestamp": time:utcNow()[0]
                });
                check caller->respond(response);
                check commit;

            } on fail error e {
                // Transaction failed (rolled back automatically)
                int statusCode = http:STATUS_INTERNAL_SERVER_ERROR;

                // Extract custom status code if available
                if e.detail().hasKey("statusCode") {
                    var statusCodeValue = e.detail()["statusCode"];
                    if statusCodeValue is int {
                        statusCode = statusCodeValue;
                    }
                }

                response.statusCode = statusCode;
                response.setJsonPayload({
                    "status": "error",
                    "message": e.message(),
                    "timestamp": time:utcNow()[0]
                });
                check caller->respond(response);
            }
        }

    };
}
