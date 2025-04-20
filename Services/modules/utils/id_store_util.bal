import splittrack_backend.db as db;

import ballerina/log;
import ballerina/persist;
import ballerina/uuid;

final db:Client dbClient = check new ();

string[] idStore = [];

public function storeId(string id) returns boolean {
    idStore.push(id);
    return true;
}

public function getAllIds() returns string[] {
    return idStore;
}

public function checkAndRemoveId(string id) returns string {
    int? index = idStore.indexOf(id);
    if index is int {
        _ = idStore.remove(index);
        return "ID deleted successfully.";
    } else {
        return "ID doesn’t exist.";
    }
}

public function generateUniqueExpenseId() returns string|error {
    string newId = "";
    boolean isUnique = false;

    while (!isUnique) {
        newId = uuid:createType4AsString();

        if idStore.indexOf(newId) is int {
            continue;
        }

        db:Expense|persist:Error expense = dbClient->/expenses/[newId];
        if expense is persist:NotFoundError {
            isUnique = true;
            return newId;
        } else if expense is persist:Error {
            log:printError("Database error while checking expense ID: " + expense.message());
            return expense;
        } else {
            continue;
        }
    }

    return "Error Creating Unique ID";

}
