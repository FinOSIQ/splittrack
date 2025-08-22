-- AUTO-GENERATED FILE.

-- This file is an auto-generated file by Ballerina persistence layer for model.
-- Please verify the generated scripts and execute them against the target DB server.

DROP TABLE IF EXISTS `ExpenseParticipant`;
DROP TABLE IF EXISTS `GuestUser`;
DROP TABLE IF EXISTS `Friend`;
DROP TABLE IF EXISTS `Transaction`;
DROP TABLE IF EXISTS `Expense`;
DROP TABLE IF EXISTS `FriendRequest`;
DROP TABLE IF EXISTS `UserGroupMember`;
DROP TABLE IF EXISTS `Card`;
DROP TABLE IF EXISTS `User`;
DROP TABLE IF EXISTS `BankAccount`;
DROP TABLE IF EXISTS `UserGroup`;

CREATE TABLE `UserGroup` (
	`group_Id` VARCHAR(191) NOT NULL,
	`name` VARCHAR(191) NOT NULL,
	`status` INT NOT NULL,
	`created_at` TIMESTAMP,
	`updated_at` TIMESTAMP,
	PRIMARY KEY(`group_Id`)
);

CREATE TABLE `BankAccount` (
	`account_Id` VARCHAR(191) NOT NULL,
	`account_no` VARCHAR(191) NOT NULL,
	`bank` VARCHAR(191) NOT NULL,
	`branch` VARCHAR(191) NOT NULL,
	`status` INT NOT NULL,
	`created_at` TIMESTAMP,
	`updated_at` TIMESTAMP,
	PRIMARY KEY(`account_Id`)
);

CREATE TABLE `User` (
	`user_Id` VARCHAR(191) NOT NULL,
	`email` VARCHAR(191),
	`first_name` VARCHAR(191) NOT NULL,
	`last_name` VARCHAR(191) NOT NULL,
	`phone_number` VARCHAR(191),
	`birthdate` VARCHAR(191),
	`currency_pref` VARCHAR(191),
	`status` INT NOT NULL,
	`created_at` TIMESTAMP,
	`updated_at` TIMESTAMP,
	PRIMARY KEY(`user_Id`)
);

CREATE TABLE `Card` (
	`card_Id` VARCHAR(191) NOT NULL,
	`card_no` VARCHAR(191) NOT NULL,
	`card_name` VARCHAR(191) NOT NULL,
	`card_expiry` VARCHAR(191) NOT NULL,
	`card_cv` VARCHAR(191) NOT NULL,
	`status` INT NOT NULL,
	`created_at` TIMESTAMP,
	`updated_at` TIMESTAMP,
	`bankaccountAccount_Id` VARCHAR(191) NOT NULL,
	FOREIGN KEY(`bankaccountAccount_Id`) REFERENCES `BankAccount`(`account_Id`),
	PRIMARY KEY(`card_Id`)
);

CREATE TABLE `UserGroupMember` (
	`group_member_Id` VARCHAR(191) NOT NULL,
	`member_role` VARCHAR(191) NOT NULL,
	`status` INT NOT NULL,
	`created_at` TIMESTAMP,
	`updated_at` TIMESTAMP,
	`groupGroup_Id` VARCHAR(191) NOT NULL,
	FOREIGN KEY(`groupGroup_Id`) REFERENCES `UserGroup`(`group_Id`),
	`userUser_Id` VARCHAR(191) NOT NULL,
	FOREIGN KEY(`userUser_Id`) REFERENCES `User`(`user_Id`),
	PRIMARY KEY(`group_member_Id`)
);

CREATE TABLE `FriendRequest` (
	`friendReq_ID` VARCHAR(191) NOT NULL,
	`receive_user_Id` VARCHAR(191) NOT NULL,
	`status` VARCHAR(191) NOT NULL,
	`created_at` TIMESTAMP,
	`updated_at` TIMESTAMP,
	`send_user_idUser_Id` VARCHAR(191) NOT NULL,
	FOREIGN KEY(`send_user_idUser_Id`) REFERENCES `User`(`user_Id`),
	PRIMARY KEY(`friendReq_ID`)
);

CREATE TABLE `Expense` (
	`expense_Id` VARCHAR(191) NOT NULL,
	`name` VARCHAR(191) NOT NULL,
	`expense_total_amount` DECIMAL(65,30) NOT NULL,
	`expense_owe_amount` DECIMAL(65,30) NOT NULL,
	`status` INT NOT NULL,
	`created_at` TIMESTAMP,
	`updated_at` TIMESTAMP,
	`usergroupGroup_Id` VARCHAR(191) NOT NULL,
	FOREIGN KEY(`usergroupGroup_Id`) REFERENCES `UserGroup`(`group_Id`),
	PRIMARY KEY(`expense_Id`)
);

CREATE TABLE `Transaction` (
	`transaction_Id` VARCHAR(191) NOT NULL,
	`payed_amount` DECIMAL(65,30) NOT NULL,
	`status` INT NOT NULL,
	`created_at` TIMESTAMP,
	`updated_at` TIMESTAMP,
	`expenseExpense_Id` VARCHAR(191) NOT NULL,
	FOREIGN KEY(`expenseExpense_Id`) REFERENCES `Expense`(`expense_Id`),
	`payee_idUser_Id` VARCHAR(191) NOT NULL,
	FOREIGN KEY(`payee_idUser_Id`) REFERENCES `User`(`user_Id`),
	PRIMARY KEY(`transaction_Id`)
);

CREATE TABLE `Friend` (
	`friend_Id` VARCHAR(191) NOT NULL,
	`status` INT NOT NULL,
	`created_at` TIMESTAMP,
	`updated_at` TIMESTAMP,
	`user_id_1User_Id` VARCHAR(191) NOT NULL,
	FOREIGN KEY(`user_id_1User_Id`) REFERENCES `User`(`user_Id`),
	`user_id_2User_Id` VARCHAR(191) NOT NULL,
	FOREIGN KEY(`user_id_2User_Id`) REFERENCES `User`(`user_Id`),
	PRIMARY KEY(`friend_Id`)
);

CREATE TABLE `GuestUser` (
	`guest_user_id` VARCHAR(191) NOT NULL,
	`guest_name` VARCHAR(191) NOT NULL,
	`owning_amount` DECIMAL(65,30) NOT NULL,
	`status` INT NOT NULL,
	`expenseExpense_Id` VARCHAR(191) NOT NULL,
	FOREIGN KEY(`expenseExpense_Id`) REFERENCES `Expense`(`expense_Id`),
	PRIMARY KEY(`guest_user_id`)
);

CREATE TABLE `ExpenseParticipant` (
	`participant_Id` VARCHAR(191) NOT NULL,
	`participant_role` VARCHAR(191) NOT NULL,
	`owning_amount` DECIMAL(65,30) NOT NULL,
	`status` INT NOT NULL,
	`created_at` TIMESTAMP,
	`updated_at` TIMESTAMP,
	`expenseExpense_Id` VARCHAR(191) NOT NULL,
	FOREIGN KEY(`expenseExpense_Id`) REFERENCES `Expense`(`expense_Id`),
	`userUser_Id` VARCHAR(191) NOT NULL,
	FOREIGN KEY(`userUser_Id`) REFERENCES `User`(`user_Id`),
	PRIMARY KEY(`participant_Id`)
);


