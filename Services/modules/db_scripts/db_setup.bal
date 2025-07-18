import ballerina/sql;
import splittrack_backend.db;

// Auto-generated file containing SQL queries from the persist SQL file

sql:ParameterizedQuery query1 = `CREATE TABLE IF NOT EXISTS UserGroup (
group_Id VARCHAR(191) NOT NULL,
name VARCHAR(191) NOT NULL,
status INT NOT NULL,
created_at TIMESTAMP NOT NULL,
updated_at TIMESTAMP NOT NULL,
PRIMARY KEY(group_Id)
)`;
sql:ParameterizedQuery query2 = `CREATE TABLE IF NOT EXISTS BankAccount (
account_Id VARCHAR(191) NOT NULL,
account_no VARCHAR(191) NOT NULL,
bank VARCHAR(191) NOT NULL,
branch VARCHAR(191) NOT NULL,
status INT NOT NULL,
created_at TIMESTAMP NOT NULL,
updated_at TIMESTAMP NOT NULL,
PRIMARY KEY(account_Id)
)`;
sql:ParameterizedQuery query3 = `CREATE TABLE IF NOT EXISTS User (
user_Id VARCHAR(191) NOT NULL,
email VARCHAR(191),
first_name VARCHAR(191) NOT NULL,
last_name VARCHAR(191) NOT NULL,
phone_number VARCHAR(191),
birthdate VARCHAR(191),
currency_pref VARCHAR(191) NOT NULL,
status INT NOT NULL,
created_at TIMESTAMP NOT NULL,
updated_at TIMESTAMP NOT NULL,
PRIMARY KEY(user_Id)
)`;
sql:ParameterizedQuery query4 = `CREATE TABLE IF NOT EXISTS Card (
card_Id VARCHAR(191) NOT NULL,
card_no VARCHAR(191) NOT NULL,
card_name VARCHAR(191) NOT NULL,
card_expiry VARCHAR(191) NOT NULL,
card_cv VARCHAR(191) NOT NULL,
status INT NOT NULL,
created_at TIMESTAMP NOT NULL,
updated_at TIMESTAMP NOT NULL,
bankaccountAccount_Id VARCHAR(191) NOT NULL,
FOREIGN KEY(bankaccountAccount_Id) REFERENCES BankAccount(account_Id),
PRIMARY KEY(card_Id)
)`;
sql:ParameterizedQuery query5 = `CREATE TABLE IF NOT EXISTS UserGroupMember (
group_member_Id VARCHAR(191) NOT NULL,
member_role VARCHAR(191) NOT NULL,
status INT NOT NULL,
created_at TIMESTAMP NOT NULL,
updated_at TIMESTAMP NOT NULL,
groupGroup_Id VARCHAR(191) NOT NULL,
FOREIGN KEY(groupGroup_Id) REFERENCES UserGroup(group_Id),
userUser_Id VARCHAR(191) NOT NULL,
FOREIGN KEY(userUser_Id) REFERENCES User(user_Id),
PRIMARY KEY(group_member_Id)
)`;
sql:ParameterizedQuery query6 = `CREATE TABLE IF NOT EXISTS FriendRequest (
friendReq_ID VARCHAR(191) NOT NULL,
receive_user_Id VARCHAR(191) NOT NULL,
status VARCHAR(191) NOT NULL,
created_at TIMESTAMP NOT NULL,
updated_at TIMESTAMP NOT NULL,
send_user_idUser_Id VARCHAR(191) NOT NULL,
FOREIGN KEY(send_user_idUser_Id) REFERENCES User(user_Id),
PRIMARY KEY(friendReq_ID)
)`;
sql:ParameterizedQuery query7 = `CREATE TABLE IF NOT EXISTS Expense (
expense_Id VARCHAR(191) NOT NULL,
name VARCHAR(191) NOT NULL,
expense_total_amount DECIMAL(65,30) NOT NULL,
expense_owe_amount DECIMAL(65,30) NOT NULL,
status INT NOT NULL,
created_at TIMESTAMP NOT NULL,
updated_at TIMESTAMP NOT NULL,
usergroupGroup_Id VARCHAR(191) NOT NULL,
FOREIGN KEY(usergroupGroup_Id) REFERENCES UserGroup(group_Id),
PRIMARY KEY(expense_Id)
)`;
sql:ParameterizedQuery query8 = `CREATE TABLE IF NOT EXISTS Transaction (
transaction_Id VARCHAR(191) NOT NULL,
payed_amount DECIMAL(65,30) NOT NULL,
status INT NOT NULL,
created_at TIMESTAMP NOT NULL,
updated_at TIMESTAMP NOT NULL,
expenseExpense_Id VARCHAR(191) NOT NULL,
FOREIGN KEY(expenseExpense_Id) REFERENCES Expense(expense_Id),
payee_idUser_Id VARCHAR(191) NOT NULL,
FOREIGN KEY(payee_idUser_Id) REFERENCES User(user_Id),
PRIMARY KEY(transaction_Id)
)`;
sql:ParameterizedQuery query9 = `CREATE TABLE IF NOT EXISTS Friend (
friend_Id VARCHAR(191) NOT NULL,
status INT NOT NULL,
created_at TIMESTAMP NOT NULL,
updated_at TIMESTAMP NOT NULL,
user_id_1User_Id VARCHAR(191) NOT NULL,
FOREIGN KEY(user_id_1User_Id) REFERENCES User(user_Id),
user_id_2User_Id VARCHAR(191) NOT NULL,
FOREIGN KEY(user_id_2User_Id) REFERENCES User(user_Id),
PRIMARY KEY(friend_Id)
)`;
sql:ParameterizedQuery query10 = `CREATE TABLE IF NOT EXISTS GuestUser (
guest_user_id VARCHAR(191) NOT NULL,
guest_name VARCHAR(191) NOT NULL,
owning_amount DECIMAL(65,30) NOT NULL,
status INT NOT NULL,
expenseExpense_Id VARCHAR(191) NOT NULL,
FOREIGN KEY(expenseExpense_Id) REFERENCES Expense(expense_Id),
PRIMARY KEY(guest_user_id)
)`;
sql:ParameterizedQuery query11 = `CREATE TABLE IF NOT EXISTS ExpenseParticipant (
participant_Id VARCHAR(191) NOT NULL,
participant_role VARCHAR(191) NOT NULL,
owning_amount DECIMAL(65,30) NOT NULL,
status INT NOT NULL,
created_at TIMESTAMP NOT NULL,
updated_at TIMESTAMP NOT NULL,
expenseExpense_Id VARCHAR(191) NOT NULL,
FOREIGN KEY(expenseExpense_Id) REFERENCES Expense(expense_Id),
userUser_Id VARCHAR(191) NOT NULL,
FOREIGN KEY(userUser_Id) REFERENCES User(user_Id),
PRIMARY KEY(participant_Id)
)`;

public function createTables() returns error? {
    db:Client dbClient = check new ();
 _ = check dbClient->executeNativeSQL(query1);
 _ = check dbClient->executeNativeSQL(query2);
 _ = check dbClient->executeNativeSQL(query3);
 _ = check dbClient->executeNativeSQL(query4);
 _ = check dbClient->executeNativeSQL(query5);
 _ = check dbClient->executeNativeSQL(query6);
 _ = check dbClient->executeNativeSQL(query7);
 _ = check dbClient->executeNativeSQL(query8);
 _ = check dbClient->executeNativeSQL(query9);
 _ = check dbClient->executeNativeSQL(query10);
 _ = check dbClient->executeNativeSQL(query11);
    check dbClient.close();
}
