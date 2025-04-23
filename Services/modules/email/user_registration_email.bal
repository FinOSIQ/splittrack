import ballerina/email;
import ballerina/log;

// Fetch SMTP config from environment variables
configurable string smtpHost = "smtp.gmail.com";
configurable string smtpUsername = "sonalattanayake2002@gmail.com";
configurable string smtpPassword = "olmvitpapqywvspi";
configurable int smtpPort = 465;

// Define parameters for user registration email
public type UserRegistrationEmailParams record {|
    string recipientEmail;
    string firstName;
    string userId;
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
