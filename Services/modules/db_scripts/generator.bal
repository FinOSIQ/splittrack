import ballerina/io;
import ballerina/regex;

public function generateDbSetup() returns error? {
    string sqlFilePath = "modules/db/script.sql";
    string outputFilePath = "modules/db_scripts/db_setup.bal";

    string sqlContent = check io:fileReadString(sqlFilePath);

    string[] lines = regex:split(sqlContent, "\n");
    string filteredContent = "";
    foreach var line in lines {
        string trimmedLine = line.trim();
        // Skip empty lines, comments, and lines containing "DROP"
        if trimmedLine != "" && !trimmedLine.startsWith("--") && !regex:matches(trimmedLine, ".*DROP.*") {
            // Replace "CREATE TABLE" with "CREATE TABLE IF NOT EXISTS"
            string modifiedLine = regex:replaceAll(trimmedLine, "CREATE TABLE", "CREATE TABLE IF NOT EXISTS");
            filteredContent += modifiedLine + "\n";
        }
    }

    string[] statements = regex:split(filteredContent.trim(), ";");

    string output = "import ballerina/sql;\n";
    output += "import splittrack_backend.db;\n\n";
    output += "// Auto-generated file containing SQL queries from the persist SQL file\n\n";

    int queryCount = 1;

    foreach var stmt in statements {
        string trimmed = stmt.trim();
        if trimmed != "" {
            string processedStmt = regex:replaceAll(trimmed, "`", "");
            output += "sql:ParameterizedQuery query" + queryCount.toString() + " = `" + processedStmt + "`;\n";
            queryCount += 1;
        }
    }

    output += "\npublic function createTables() returns error? {\n";
    output += "    db:Client dbClient = check new ();\n";
    foreach int i in 1 ... (queryCount - 1) {
        output += " _ = check dbClient->executeNativeSQL(query" + i.toString() + ");\n";
    }
    output += "    check dbClient.close();\n";
    output += "}\n";

    check io:fileWriteString(outputFilePath, output);

    io:println("Generated db_setup.bal successfully at " + outputFilePath);
}
