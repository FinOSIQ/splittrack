import ballerina/email;
import ballerina/log;

// Fetch SMTP config from environment variables
configurable string smtpHost = "smtp.gmail.com";
configurable string smtpUsername = "lasinthaattanayake@gmail.com";
configurable string smtpPassword = "qvdeuetwecoskseg";
configurable int smtpPort = 587;

// Define parameters for user registration email
public type UserRegistrationEmailParams record {|
    string recipientEmail;
    string firstName;
    string userId;
|};

// Define parameters for payment notification email
public type PaymentNotificationEmailParams record {|
    string recipientEmail;
    string recipientName;
    string payerName;
    string expenseName;
    decimal paymentAmount;
    decimal remainingAmount;
    string currency;
|};

// Function to send user registration email
public isolated function sendUserRegistrationEmail(UserRegistrationEmailParams params) returns boolean|error {
    // Validate required configs
    if smtpUsername == "" || smtpPassword == "" {
        return error("SMTP username or password not set in environment variables");
    }

    // Email template
    string emailTemplate = string `
        <html>
        <body>
            <h2>Welcome to Our Platform, ${params.firstName}!</h2>
            <p>Thank you for registering with us. Your user ID is: <strong>${params.userId}</strong>.</p>
            <p>Get started by logging in and exploring our features.</p>
            <p>Best regards,<br>The Team</p>
        </body>
        </html>
    `;

    email:SmtpConfiguration smtpConfig = {
        port: smtpPort
    };

    email:SmtpClient smtpClient = check new (smtpHost, smtpUsername, smtpPassword, smtpConfig);

    // Construct email message
    email:Message emailMessage = {
        to: [params.recipientEmail],
        subject: "Welcome to Our Platform!",
        body: emailTemplate,
        contentType: "text/html",
        'from: smtpUsername
    };

    // Send email
    error? result = smtpClient->sendMessage(emailMessage);
    if result is error {
        log:printError("Failed to send registration email: " + result.message());
        return result;
    }
    return true;
}

// Function to send payment notification email to expense creator
public isolated function sendPaymentNotificationEmail(PaymentNotificationEmailParams params) returns boolean|error {
    // Validate required configs
    if smtpUsername == "" || smtpPassword == "" {
        return error("SMTP username or password not set in environment variables");
    }

    // Format remaining amount to 2 decimal places
    string amountStr = params.remainingAmount.toString();
    string formattedRemainingAmount;

    int? dotIndex = amountStr.indexOf(".");
    if dotIndex is int && dotIndex >= 0 {
        // If there's a decimal point, limit to 2 decimal places
        if amountStr.length() > dotIndex + 3 {
            formattedRemainingAmount = amountStr.substring(0, dotIndex + 3);
        } else if amountStr.length() == dotIndex + 2 {
            // Only one decimal place, add a zero
            formattedRemainingAmount = amountStr + "0";
        } else {
            formattedRemainingAmount = amountStr;
        }
    } else {
        // No decimal point, add .00
        formattedRemainingAmount = amountStr + ".00";
    }

    // Email template for payment notification
    string emailTemplate = string `
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
        Payment Received!
        </h2>
        <p>Hi <strong>${params.recipientName}</strong>,</p>
        <p>Great news! You've received a payment for one of your expenses.</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #2c3e50;">Payment Details:</h3>
        <ul style="list-style: none; padding: 0;">
        <li style="margin: 8px 0;"><strong>From:</strong> ${params.payerName}</li>
        <li style="margin: 8px 0;"><strong>Expense:</strong> ${params.expenseName}</li>
        <li style="margin: 8px 0;"><strong>Amount Paid:</strong> <span style="color: #27ae60; font-weight: bold;">${params.paymentAmount} ${params.currency}</span></li>
        <li style="margin: 8px 0;"><strong>Remaining Balance:</strong> ${formattedRemainingAmount} ${params.currency}</li>
        </ul>
        </div>
        ${params.remainingAmount == 0.0d ?
        "<p style='color: #27ae60; font-weight: bold;'>🎉 This expense has been fully paid!</p>" :
        "<p>The remaining balance will be settled in future payments.</p>"
        }
        <p>You can view all your expense details by logging into your account.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #7f8c8d; font-size: 14px;">
        Best regards,<br>
        <strong>SplitTrack Team</strong>
        </p>
        </div>
        </body>
        </html>
    `;

    email:SmtpConfiguration smtpConfig = {
        port: smtpPort
    };

    email:SmtpClient smtpClient = check new (smtpHost, smtpUsername, smtpPassword, smtpConfig);

    // Construct email message
    email:Message emailMessage = {
        to: [params.recipientEmail],
        subject: string `💰 Payment Received - ${params.expenseName}`,
        body: emailTemplate,
        contentType: "text/html",
        'from: smtpUsername
    };

    // Send email
    error? result = smtpClient->sendMessage(emailMessage);
    if result is error {
        log:printError("Failed to send payment notification email: " + result.message());
        return result;
    }

    return true;
}
