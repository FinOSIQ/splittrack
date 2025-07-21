-- Execute after schema creation
-- Get-Content modules\utils\test_data.sql | & "C:\xampp\mysql\bin\mysql.exe" -u root -D splittrack
-- Get-Content modules\utils\test_data.sql | & "C:\XAMMP\mysql\bin\mysql.exe" -u root -D splittrack


START TRANSACTION;

-- =====================================================
-- EXPENSE SHARING DATABASE - COMPLETE SQL SCRIPT
-- =====================================================

-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS Card;
DROP TABLE IF EXISTS BankAccount;
DROP TABLE IF EXISTS Transaction;
DROP TABLE IF EXISTS ExpenseParticipant;
DROP TABLE IF EXISTS GuestUser;
DROP TABLE IF EXISTS Expense;
DROP TABLE IF EXISTS UserGroupMember;
DROP TABLE IF EXISTS UserGroup;
DROP TABLE IF EXISTS Friend;
DROP TABLE IF EXISTS FriendRequest;
DROP TABLE IF EXISTS User;

-- =====================================================
-- CREATE TABLES
-- =====================================================

-- Users Table
CREATE TABLE User (
    user_Id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    birthdate DATE,
    currency_pref VARCHAR(3),
    status INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_email (email)
);

-- Friend Requests Table
CREATE TABLE FriendRequest (
    friendReq_ID VARCHAR(36) PRIMARY KEY,
    send_user_Id VARCHAR(36) NOT NULL,
    receive_user_Id VARCHAR(36) NOT NULL,
    status ENUM('pending', 'accepted', 'declined') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (send_user_Id) REFERENCES User(user_Id) ON DELETE CASCADE,
    FOREIGN KEY (receive_user_Id) REFERENCES User(user_Id) ON DELETE CASCADE,
    UNIQUE KEY unique_friend_request (send_user_Id, receive_user_Id)
);

-- Friends Table
CREATE TABLE Friend (
    friend_Id VARCHAR(36) PRIMARY KEY,
    user_Id_1 VARCHAR(36) NOT NULL,
    user_Id_2 VARCHAR(36) NOT NULL,
    status INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_Id_1) REFERENCES User(user_Id) ON DELETE CASCADE,
    FOREIGN KEY (user_Id_2) REFERENCES User(user_Id) ON DELETE CASCADE,
    UNIQUE KEY unique_friendship (user_Id_1, user_Id_2)
);

-- User Groups Table
CREATE TABLE UserGroup (
    group_Id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    status INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User Group Members Table
CREATE TABLE UserGroupMember (
    group_member_Id VARCHAR(36) PRIMARY KEY,
    member_role ENUM('admin', 'member') DEFAULT 'member',
    group_Id VARCHAR(36) NOT NULL,
    user_Id VARCHAR(36) NOT NULL,
    status INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (group_Id) REFERENCES UserGroup(group_Id) ON DELETE CASCADE,
    FOREIGN KEY (user_Id) REFERENCES User(user_Id) ON DELETE CASCADE,
    UNIQUE KEY unique_group_member (group_Id, user_Id)
);

-- Expenses Table
CREATE TABLE Expense (
    expense_Id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    expense_total_amount DECIMAL(10,2) NOT NULL,
    expense_owe_amount DECIMAL(10,2) NOT NULL,
    group_Id VARCHAR(36) NOT NULL,
    status INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (group_Id) REFERENCES UserGroup(group_Id) ON DELETE CASCADE
);

-- Guest Users Table
CREATE TABLE GuestUser (
    guest_user_id VARCHAR(36) PRIMARY KEY,
    guest_name VARCHAR(100) NOT NULL,
    expense_Id VARCHAR(36) NOT NULL,
    owning_amount DECIMAL(10,2) NOT NULL,
    status INT DEFAULT 1,
    FOREIGN KEY (expense_Id) REFERENCES Expense(expense_Id) ON DELETE CASCADE
);

-- Expense Participants Table
CREATE TABLE ExpenseParticipant (
    participant_Id VARCHAR(36) PRIMARY KEY,
    participant_role ENUM('payer', 'participant') DEFAULT 'participant',
    owning_amount DECIMAL(10,2) NOT NULL,
    expense_Id VARCHAR(36) NOT NULL,
    user_Id VARCHAR(36) NOT NULL,
    status INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (expense_Id) REFERENCES Expense(expense_Id) ON DELETE CASCADE,
    FOREIGN KEY (user_Id) REFERENCES User(user_Id) ON DELETE CASCADE,
    UNIQUE KEY unique_expense_participant (expense_Id, user_Id)
);

-- Transactions Table
CREATE TABLE Transaction (
    transaction_Id VARCHAR(36) PRIMARY KEY,
    payed_amount DECIMAL(10,2) NOT NULL,
    expense_Id VARCHAR(36) NOT NULL,
    payer_user_Id VARCHAR(36) NOT NULL,
    payee_user_Id VARCHAR(36) NOT NULL,
    status INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (expense_Id) REFERENCES Expense(expense_Id) ON DELETE CASCADE,
    FOREIGN KEY (payer_user_Id) REFERENCES User(user_Id) ON DELETE CASCADE,
    FOREIGN KEY (payee_user_Id) REFERENCES User(user_Id) ON DELETE CASCADE
);

-- Bank Accounts Table
CREATE TABLE BankAccount (
    account_Id VARCHAR(36) PRIMARY KEY,
    account_no VARCHAR(20) NOT NULL,
    bank VARCHAR(100) NOT NULL,
    branch VARCHAR(100) NOT NULL,
    user_Id VARCHAR(36) NOT NULL,
    status INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_Id) REFERENCES User(user_Id) ON DELETE CASCADE
);

-- Cards Table
CREATE TABLE Card (
    card_Id VARCHAR(36) PRIMARY KEY,
    card_no VARCHAR(20) NOT NULL,
    card_name VARCHAR(100) NOT NULL,
    card_expiry VARCHAR(7) NOT NULL,
    card_cv VARCHAR(4) NOT NULL,
    account_Id VARCHAR(36) NOT NULL,
    status INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (account_Id) REFERENCES BankAccount(account_Id) ON DELETE CASCADE
);

-- =====================================================
-- INSERT DATA
-- =====================================================

-- Insert Users
INSERT INTO User (user_Id, email, first_name, last_name, phone_number, birthdate, currency_pref, status, created_at, updated_at) VALUES
('30e02b55-c249-4cdd-b0a5-a3cf8a372570', 'alex.chen@email.com', 'Alex', 'Chen', '+1234567890', '1992-05-15', 'USD', 1, '2024-01-15 10:30:00', '2024-07-15 14:20:00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'sarah.johnson@email.com', 'Sarah', 'Johnson', '+1234567891', '1991-08-22', 'USD', 1, '2024-01-20 09:15:00', '2024-07-16 11:45:00'),
('b2c3d4e5-f6g7-8901-bcde-f23456789012', 'mike.rodriguez@email.com', 'Mike', 'Rodriguez', '+1234567892', '1993-03-10', 'USD', 1, '2024-02-05 16:45:00', '2024-07-14 08:30:00'),
('c3d4e5f6-g7h8-9012-cdef-345678901234', 'emma.thompson@email.com', 'Emma', 'Thompson', '+1234567893', '1990-11-28', 'USD', 1, '2024-02-12 13:20:00', '2024-07-12 19:15:00'),
('d4e5f6g7-h8i9-0123-defg-456789012345', 'david.kim@email.com', 'David', 'Kim', '+1234567894', '1994-07-03', 'USD', 1, '2024-03-01 12:00:00', '2024-07-10 15:30:00');

-- Insert Friend Requests
INSERT INTO FriendRequest (friendReq_ID, send_user_Id, receive_user_Id, status, created_at, updated_at) VALUES
('fr001-30e0-2b55-c249-4cdd8a372570', '30e02b55-c249-4cdd-b0a5-a3cf8a372570', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'accepted', '2024-01-25 14:30:00', '2024-01-25 16:45:00'),
('fr002-b2c3-d4e5-f6g7-890123456789', 'b2c3d4e5-f6g7-8901-bcde-f23456789012', '30e02b55-c249-4cdd-b0a5-a3cf8a372570', 'accepted', '2024-02-08 10:15:00', '2024-02-08 11:20:00'),
('fr003-30e0-2b55-c3d4-e5f6g7h89012', '30e02b55-c249-4cdd-b0a5-a3cf8a372570', 'c3d4e5f6-g7h8-9012-cdef-345678901234', 'accepted', '2024-02-15 09:45:00', '2024-02-15 10:30:00'),
('fr004-d4e5-f6g7-h8i9-012345678901', 'd4e5f6g7-h8i9-0123-defg-456789012345', '30e02b55-c249-4cdd-b0a5-a3cf8a372570', 'pending', '2024-07-15 18:20:00', '2024-07-15 18:20:00'),
('fr005-a1b2-c3d4-b2c3-d4e5f6789012', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'b2c3d4e5-f6g7-8901-bcde-f23456789012', 'accepted', '2024-03-08 12:30:00', '2024-03-08 14:15:00');

-- Insert Friends
INSERT INTO Friend (friend_Id, user_Id_1, user_Id_2, status, created_at, updated_at) VALUES
('f001-30e0-2b55-a1b2-c3d4e5f67890', '30e02b55-c249-4cdd-b0a5-a3cf8a372570', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 1, '2024-01-25 16:45:00', '2024-01-25 16:45:00'),
('f002-30e0-2b55-b2c3-d4e5f6g78901', '30e02b55-c249-4cdd-b0a5-a3cf8a372570', 'b2c3d4e5-f6g7-8901-bcde-f23456789012', 1, '2024-02-08 11:20:00', '2024-02-08 11:20:00'),
('f003-30e0-2b55-c3d4-e5f6g7h89012', '30e02b55-c249-4cdd-b0a5-a3cf8a372570', 'c3d4e5f6-g7h8-9012-cdef-345678901234', 1, '2024-02-15 10:30:00', '2024-02-15 10:30:00'),
('f004-a1b2-c3d4-b2c3-d4e5f6g78901', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'b2c3d4e5-f6g7-8901-bcde-f23456789012', 1, '2024-03-10 14:15:00', '2024-03-10 14:15:00');

-- Insert User Groups
INSERT INTO UserGroup (group_Id, name, status, created_at, updated_at) VALUES
('g001-30e0-2b55-trip-crew12345678', 'Weekend Trip Crew', 1, '2024-06-01 10:00:00', '2024-07-15 16:30:00'),
('g002-30e0-2b55-dinner-club87654321', 'Monthly Dinner Club', 1, '2024-04-15 19:30:00', '2024-07-12 20:45:00'),
('g003-30e0-2b55-coffee-addicts1234', 'Coffee Addicts', 1, '2024-05-20 08:15:00', '2024-07-16 09:20:00');

-- Insert User Group Members
INSERT INTO UserGroupMember (group_member_Id, member_role, group_Id, user_Id, status, created_at, updated_at) VALUES
-- Weekend Trip Crew Members
('gm001-30e0-2b55-g001-admin123456', 'admin', 'g001-30e0-2b55-trip-crew12345678', '30e02b55-c249-4cdd-b0a5-a3cf8a372570', 1, '2024-06-01 10:00:00', '2024-06-01 10:00:00'),
('gm002-a1b2-c3d4-g001-member123456', 'member', 'g001-30e0-2b55-trip-crew12345678', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 1, '2024-06-01 10:15:00', '2024-06-01 10:15:00'),
('gm003-b2c3-d4e5-g001-member123456', 'member', 'g001-30e0-2b55-trip-crew12345678', 'b2c3d4e5-f6g7-8901-bcde-f23456789012', 1, '2024-06-01 10:30:00', '2024-06-01 10:30:00'),
('gm004-c3d4-e5f6-g001-member123456', 'member', 'g001-30e0-2b55-trip-crew12345678', 'c3d4e5f6-g7h8-9012-cdef-345678901234', 1, '2024-06-01 10:45:00', '2024-06-01 10:45:00'),
-- Monthly Dinner Club Members
('gm005-30e0-2b55-g002-member123456', 'member', 'g002-30e0-2b55-dinner-club87654321', '30e02b55-c249-4cdd-b0a5-a3cf8a372570', 1, '2024-04-15 19:30:00', '2024-04-15 19:30:00'),
('gm006-a1b2-c3d4-g002-admin123456', 'admin', 'g002-30e0-2b55-dinner-club87654321', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 1, '2024-04-15 19:30:00', '2024-04-15 19:30:00'),
('gm007-c3d4-e5f6-g002-member123456', 'member', 'g002-30e0-2b55-dinner-club87654321', 'c3d4e5f6-g7h8-9012-cdef-345678901234', 1, '2024-04-15 19:45:00', '2024-04-15 19:45:00'),
-- Coffee Addicts Members
('gm008-30e0-2b55-g003-admin123456', 'admin', 'g003-30e0-2b55-coffee-addicts1234', '30e02b55-c249-4cdd-b0a5-a3cf8a372570', 1, '2024-05-20 08:15:00', '2024-05-20 08:15:00'),
('gm009-a1b2-c3d4-g003-member123456', 'member', 'g003-30e0-2b55-coffee-addicts1234', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 1, '2024-05-20 08:30:00', '2024-05-20 08:30:00');

-- Insert Expenses
INSERT INTO Expense (expense_Id, name, expense_total_amount, expense_owe_amount, group_Id, status, created_at, updated_at) VALUES
('exp001-30e0-2b55-hotel-booking123', 'Mountain Resort Hotel - Weekend Trip', 480.00, 360.00, 'g001-30e0-2b55-trip-crew12345678', 1, '2024-06-15 14:30:00', '2024-06-20 10:15:00'),
('exp002-30e0-2b55-groceries-trip123', 'Groceries for Weekend Trip', 156.80, 117.60, 'g001-30e0-2b55-trip-crew12345678', 1, '2024-06-20 09:45:00', '2024-06-20 11:20:00'),
('exp003-30e0-2b55-gas-money-trip123', 'Gas Money for Road Trip', 85.40, 63.00, 'g001-30e0-2b55-trip-crew12345678', 1, '2024-06-18 16:20:00', '2024-06-18 16:20:00'),
('exp004-30e0-2b55-italian-dinner123', 'Tonys Italian Restaurant', 125.60, 83.73, 'g002-30e0-2b55-dinner-club87654321', 1, '2024-07-12 20:30:00', '2024-07-12 21:45:00'),
('exp005-30e0-2b55-coffee-morning123', 'Morning Coffee Run', 28.75, 14.25, 'g003-30e0-2b55-coffee-addicts1234', 1, '2024-07-16 09:20:00', '2024-07-16 09:20:00');

-- Insert Guest Users
INSERT INTO GuestUser (guest_user_id, guest_name, expense_Id, owning_amount, status) VALUES
('guest001-30e0-2b55-hotel-guest123', 'Robert Chen', 'exp001-30e0-2b55-hotel-booking123', 120.00, 1),
('guest002-30e0-2b55-dinner-guest123', 'Lisa Johnson', 'exp004-30e0-2b55-italian-dinner123', 41.87, 1);

-- Insert Expense Participants
INSERT INTO ExpenseParticipant (participant_Id, participant_role, owning_amount, expense_Id, user_Id, status, created_at, updated_at) VALUES
-- Hotel Booking Participants
('ep001-30e0-2b55-hotel-alex123', 'payer', 0.00, 'exp001-30e0-2b55-hotel-booking123', '30e02b55-c249-4cdd-b0a5-a3cf8a372570', 1, '2024-06-15 14:30:00', '2024-06-15 14:30:00'),
('ep002-a1b2-c3d4-hotel-sarah123', 'participant', 120.00, 'exp001-30e0-2b55-hotel-booking123', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 1, '2024-06-15 14:30:00', '2024-06-15 14:30:00'),
('ep003-b2c3-d4e5-hotel-mike123', 'participant', 120.00, 'exp001-30e0-2b55-hotel-booking123', 'b2c3d4e5-f6g7-8901-bcde-f23456789012', 1, '2024-06-15 14:30:00', '2024-06-15 14:30:00'),
('ep004-c3d4-e5f6-hotel-emma123', 'participant', 120.00, 'exp001-30e0-2b55-hotel-booking123', 'c3d4e5f6-g7h8-9012-cdef-345678901234', 1, '2024-06-15 14:30:00', '2024-06-15 14:30:00'),
-- Groceries Participants
('ep005-a1b2-c3d4-groceries-sarah', 'payer', 0.00, 'exp002-30e0-2b55-groceries-trip123', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 1, '2024-06-20 09:45:00', '2024-06-20 09:45:00'),
('ep006-30e0-2b55-groceries-alex', 'participant', 39.20, 'exp002-30e0-2b55-groceries-trip123', '30e02b55-c249-4cdd-b0a5-a3cf8a372570', 1, '2024-06-20 09:45:00', '2024-06-20 09:45:00'),
('ep007-b2c3-d4e5-groceries-mike', 'participant', 39.20, 'exp002-30e0-2b55-groceries-trip123', 'b2c3d4e5-f6g7-8901-bcde-f23456789012', 1, '2024-06-20 09:45:00', '2024-06-20 09:45:00'),
('ep008-c3d4-e5f6-groceries-emma', 'participant', 39.20, 'exp002-30e0-2b55-groceries-trip123', 'c3d4e5f6-g7h8-9012-cdef-345678901234', 1, '2024-06-20 09:45:00', '2024-06-20 09:45:00'),
-- Gas Money Participants
('ep009-b2c3-d4e5-gas-mike-payer', 'payer', 0.00, 'exp003-30e0-2b55-gas-money-trip123', 'b2c3d4e5-f6g7-8901-bcde-f23456789012', 1, '2024-06-18 16:20:00', '2024-06-18 16:20:00'),
('ep010-30e0-2b55-gas-alex', 'participant', 21.35, 'exp003-30e0-2b55-gas-money-trip123', '30e02b55-c249-4cdd-b0a5-a3cf8a372570', 1, '2024-06-18 16:20:00', '2024-06-18 16:20:00'),
('ep011-a1b2-c3d4-gas-sarah', 'participant', 21.35, 'exp003-30e0-2b55-gas-money-trip123', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 1, '2024-06-18 16:20:00', '2024-06-18 16:20:00'),
('ep012-c3d4-e5f6-gas-emma', 'participant', 21.35, 'exp003-30e0-2b55-gas-money-trip123', 'c3d4e5f6-g7h8-9012-cdef-345678901234', 1, '2024-06-18 16:20:00', '2024-06-18 16:20:00'),
-- Italian Dinner Participants
('ep013-30e0-2b55-dinner-alex-payer', 'payer', 0.00, 'exp004-30e0-2b55-italian-dinner123', '30e02b55-c249-4cdd-b0a5-a3cf8a372570', 1, '2024-07-12 20:30:00', '2024-07-12 20:30:00'),
('ep014-a1b2-c3d4-dinner-sarah', 'participant', 41.87, 'exp004-30e0-2b55-italian-dinner123', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 1, '2024-07-12 20:30:00', '2024-07-12 20:30:00'),
('ep015-c3d4-e5f6-dinner-emma', 'participant', 41.87, 'exp004-30e0-2b55-italian-dinner123', 'c3d4e5f6-g7h8-9012-cdef-345678901234', 1, '2024-07-12 20:30:00', '2024-07-12 20:30:00'),
-- Coffee Morning Participants
('ep016-a1b2-c3d4-coffee-sarah-payer', 'payer', 0.00, 'exp005-30e0-2b55-coffee-morning123', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 1, '2024-07-16 09:20:00', '2024-07-16 09:20:00'),
('ep017-30e0-2b55-coffee-alex', 'participant', 14.25, 'exp005-30e0-2b55-coffee-morning123', '30e02b55-c249-4cdd-b0a5-a3cf8a372570', 1, '2024-07-16 09:20:00', '2024-07-16 09:20:00');

-- Insert Transactions
INSERT INTO Transaction (transaction_Id, payed_amount, expense_Id, payer_user_Id, payee_user_Id, status, created_at, updated_at) VALUES
-- Hotel payments
('t001-sarah-alex-hotel-payment123', 120.00, 'exp001-30e0-2b55-hotel-booking123', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '30e02b55-c249-4cdd-b0a5-a3cf8a372570', 1, '2024-06-20 10:15:00', '2024-06-20 10:15:00'),
('t002-mike-alex-hotel-payment123', 120.00, 'exp001-30e0-2b55-hotel-booking123', 'b2c3d4e5-f6g7-8901-bcde-f23456789012', '30e02b55-c249-4cdd-b0a5-a3cf8a372570', 1, '2024-06-19 15:30:00', '2024-06-19 15:30:00'),
-- Groceries payments
('t003-alex-sarah-groceries-payment', 39.20, 'exp002-30e0-2b55-groceries-trip123', '30e02b55-c249-4cdd-b0a5-a3cf8a372570', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 1, '2024-06-20 11:20:00', '2024-06-20 11:20:00'),
('t004-mike-sarah-groceries-payment', 39.20, 'exp002-30e0-2b55-groceries-trip123', 'b2c3d4e5-f6g7-8901-bcde-f23456789012', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 1, '2024-06-20 12:45:00', '2024-06-20 12:45:00'),
-- Gas payments (partial)
('t005-alex-mike-gas-payment', 21.35, 'exp003-30e0-2b55-gas-money-trip123', '30e02b55-c249-4cdd-b0a5-a3cf8a372570', 'b2c3d4e5-f6g7-8901-bcde-f23456789012', 1, '2024-06-19 08:30:00', '2024-06-19 08:30:00'),
('t006-sarah-mike-gas-payment', 21.35, 'exp003-30e0-2b55-gas-money-trip123', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'b2c3d4e5-f6g7-8901-bcde-f23456789012', 1, '2024-06-19 09:15:00', '2024-06-19 09:15:00');

-- Insert Bank Accounts
INSERT INTO BankAccount (account_Id, account_no, bank, branch, user_Id, status, created_at, updated_at) VALUES
('ba001-30e0-2b55-chase-primary123', '****1234', 'Chase Bank', 'Downtown Branch', '30e02b55-c249-4cdd-b0a5-a3cf8a372570', 1, '2024-01-15 10:30:00', '2024-07-15 14:20:00'),
('ba002-a1b2-c3d4-wells-primary123', '****5678', 'Wells Fargo', 'Main Street Branch', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 1, '2024-01-20 09:15:00', '2024-07-16 11:45:00'),
('ba003-b2c3-d4e5-bofa-primary123', '****9012', 'Bank of America', 'Central Plaza Branch', 'b2c3d4e5-f6g7-8901-bcde-f23456789012', 1, '2024-02-05 16:45:00', '2024-07-14 08:30:00'),
('ba004-c3d4-e5f6-citi-primary123', '****3456', 'Citibank', 'Westside Branch', 'c3d4e5f6-g7h8-9012-cdef-345678901234', 1, '2024-02-12 13:20:00', '2024-07-12 19:15:00'),
('ba005-d4e5-f6g7-usbank-primary123', '****7890', 'US Bank', 'University Branch', 'd4e5f6g7-h8i9-0123-defg-456789012345', 1, '2024-03-01 12:00:00', '2024-07-10 15:30:00');

-- Insert Cards
INSERT INTO Card (card_Id, card_no, card_name, card_expiry, card_cv, account_Id, status, created_at, updated_at) VALUES
-- Alex's Cards
('card001-30e0-2b55-chase-visa123', '****1234', 'Alex Chen', '12/27', '***', 'ba001-30e0-2b55-chase-primary123', 1, '2024-01-15 10:30:00', '2024-07-15 14:20:00'),
('card002-30e0-2b55-chase-debit123', '****5678', 'Alex Chen', '08/26', '***', 'ba001-30e0-2b55-chase-primary123', 1, '2024-01-15 10:30:00', '2024-07-15 14:20:00'),
-- Sarah's Cards
('card003-a1b2-c3d4-wells-visa123', '****9012', 'Sarah Johnson', '06/28', '***', 'ba002-a1b2-c3d4-wells-primary123', 1, '2024-01-20 09:15:00', '2024-07-16 11:45:00'),
('card004-a1b2-c3d4-wells-debit123', '****3456', 'Sarah Johnson', '03/27', '***', 'ba002-a1b2-c3d4-wells-primary123', 1, '2024-01-20 09:15:00', '2024-07-16 11:45:00'),
-- Mike's Cards
('card005-b2c3-d4e5-bofa-visa123', '****7890', 'Mike Rodriguez', '11/29', '***', 'ba003-b2c3-d4e5-bofa-primary123', 1, '2024-02-05 16:45:00', '2024-07-14 08:30:00'),
('card006-b2c3-d4e5-bofa-master123', '****1234', 'Mike Rodriguez', '09/28', '***', 'ba003-b2c3-d4e5-bofa-primary123', 1, '2024-02-05 16:45:00', '2024-07-14 08:30:00'),
-- Emma's Cards
('card007-c3d4-e5f6-citi-visa123', '****5678', 'Emma Thompson', '04/30', '***', 'ba004-c3d4-e5f6-citi-primary123', 1, '2024-02-12 13:20:00', '2024-07-12 19:15:00'),
-- David's Cards
('card008-d4e5-f6g7-usbank-debit123', '****9012', 'David Kim', '01/29', '***', 'ba005-d4e5-f6g7-usbank-primary123', 1, '2024-03-01 12:00:00', '2024-07-10 15:30:00');

-- =====================================================
-- USEFUL QUERIES FOR TESTING
-- =====================================================

-- Query 1: Get all expenses for a specific user (Alex)
/*
SELECT 
    e.expense_Id,
    e.name,
    e.expense_total_amount,
    ug.name as group_name,
    ep.participant_role,
    ep.owning_amount,
    CASE 
        WHEN ep.participant_role = 'payer' THEN 'Paid'
        WHEN ep.owning_amount > 0 THEN 'Owes'
        ELSE 'Settled'
    END as payment_status
FROM Expense e
JOIN UserGroup ug ON e.group_Id = ug.group_Id
JOIN ExpenseParticipant ep ON e.expense_Id = ep.expense_Id
WHERE ep.user_Id = '30e02b55-c249-4cdd-b0a5-a3cf8a372570'
ORDER BY e.created_at DESC;
*/

-- Query 2: Get all pending friend requests for a user
/*
SELECT 
    fr.friendReq_ID,
    u1.first_name + ' ' + u1.last_name as sender_name,
    u1.email as sender_email,
    fr.status,
    fr.created_at
FROM FriendRequest fr
JOIN User u1 ON fr.send_user_Id = u1.user_Id
WHERE fr.receive_user_Id = '30e02b55-c249-4cdd-b0a5-a3cf8a372570'
    AND fr.status = 'pending'
ORDER BY fr.created_at DESC;
*/

-- Query 3: Get user's total balance (what they owe vs what they're owed)
/*
SELECT 
    user_Id,
    first_name,
    last_name,
    SUM(CASE WHEN participant_role = 'participant' THEN owning_amount ELSE 0 END) as total_owes,
    SUM(CASE WHEN participant_role = 'payer' THEN 
        (SELECT SUM(owning_amount) FROM ExpenseParticipant ep2 WHERE ep2.expense_Id = ep.expense_Id AND ep2.participant_role = 'participant')
        ELSE 0 END) as total_owed,
    (SUM(CASE WHEN participant_role = 'payer' THEN 
        (SELECT SUM(owning_amount) FROM ExpenseParticipant ep2 WHERE ep2.expense_Id = ep.expense_Id AND ep2.participant_role = 'participant')
        ELSE 0 END) - 
     SUM(CASE WHEN participant_role = 'participant' THEN owning_amount ELSE 0 END)) as net_balance
FROM User u
JOIN ExpenseParticipant ep ON u.user_Id = ep.user_Id
WHERE u.user_Id = '30e02b55-c249-4cdd-b0a5-a3cf8a372570'
GROUP BY u.user_Id, u.first_name, u.last_name;
*/

-- Query 4: Get all groups where user is admin
/*
SELECT 
    ug.group_Id,
    ug.name,
    ugm.member_role,
    COUNT(ugm2.group_member_Id) as member_count,
    ug.created_at
FROM UserGroup ug
JOIN UserGroupMember ugm ON ug.group_Id = ugm.group_Id
LEFT JOIN UserGroupMember ugm2 ON ug.group_Id = ugm2.group_Id
WHERE ugm.user_Id = '30e02b55-c249-4cdd-b0a5-a3cf8a372570'
    AND ugm.member_role = 'admin'
GROUP BY ug.group_Id, ug.name, ugm.member_role, ug.created_at
ORDER BY ug.created_at DESC;
*/

-- Query 5: Get all transactions for a specific expense
/*
SELECT 
    t.transaction_Id,
    t.payed_amount,
    u1.first_name + ' ' + u1.last_name as payer_name,
    u2.first_name + ' ' + u2.last_name as payee_name,
    e.name as expense_name,
    t.created_at
FROM Transaction t
JOIN User u1 ON t.payer_user_Id = u1.user_Id
JOIN User u2 ON t.payee_user_Id = u2.user_Id
JOIN Expense e ON t.expense_Id = e.expense_Id
WHERE t.expense_Id = 'exp001-30e0-2b55-hotel-booking123'
ORDER BY t.created_at DESC;
*/

-- Query 6: Get detailed expense breakdown with participants and guests
/*
SELECT 
    e.expense_Id,
    e.name,
    e.expense_total_amount,
    'User' as participant_type,
    u.first_name + ' ' + u.last_name as participant_name,
    ep.participant_role,
    ep.owning_amount
FROM Expense e
JOIN ExpenseParticipant ep ON e.expense_Id = ep.expense_Id
JOIN User u ON ep.user_Id = u.user_Id
WHERE e.expense_Id = 'exp001-30e0-2b55-hotel-booking123'

UNION ALL

SELECT 
    e.expense_Id,
    e.name,
    e.expense_total_amount,
    'Guest' as participant_type,
    gu.guest_name as participant_name,
    'participant' as participant_role,
    gu.owning_amount
FROM Expense e
JOIN GuestUser gu ON e.expense_Id = gu.expense_Id
WHERE e.expense_Id = 'exp001-30e0-2b55-hotel-booking123'

ORDER BY participant_type, participant_role DESC;
*/

-- =====================================================
-- DATA VALIDATION QUERIES
-- =====================================================

-- Check referential integrity
/*
-- Verify all foreign keys exist
SELECT 'FriendRequest send_user_Id issues' as check_type, COUNT(*) as issue_count
FROM FriendRequest fr LEFT JOIN User u ON fr.send_user_Id = u.user_Id WHERE u.user_Id IS NULL
UNION ALL
SELECT 'FriendRequest receive_user_Id issues', COUNT(*)
FROM FriendRequest fr LEFT JOIN User u ON fr.receive_user_Id = u.user_Id WHERE u.user_Id IS NULL
UNION ALL
SELECT 'Friend user_Id_1 issues', COUNT(*)
FROM Friend f LEFT JOIN User u ON f.user_Id_1 = u.user_Id WHERE u.user_Id IS NULL
UNION ALL
SELECT 'Friend user_Id_2 issues', COUNT(*)
FROM Friend f LEFT JOIN User u ON f.user_Id_2 = u.user_Id WHERE u.user_Id IS NULL
UNION ALL
SELECT 'UserGroupMember group_Id issues', COUNT(*)
FROM UserGroupMember ugm LEFT JOIN UserGroup ug ON ugm.group_Id = ug.group_Id WHERE ug.group_Id IS NULL
UNION ALL
SELECT 'UserGroupMember user_Id issues', COUNT(*)
FROM UserGroupMember ugm LEFT JOIN User u ON ugm.user_Id = u.user_Id WHERE u.user_Id IS NULL
UNION ALL
SELECT 'Expense group_Id issues', COUNT(*)
FROM Expense e LEFT JOIN UserGroup ug ON e.group_Id = ug.group_Id WHERE ug.group_Id IS NULL
UNION ALL
SELECT 'ExpenseParticipant expense_Id issues', COUNT(*)
FROM ExpenseParticipant ep LEFT JOIN Expense e ON ep.expense_Id = e.expense_Id WHERE e.expense_Id IS NULL
UNION ALL
SELECT 'ExpenseParticipant user_Id issues', COUNT(*)
FROM ExpenseParticipant ep LEFT JOIN User u ON ep.user_Id = u.user_Id WHERE u.user_Id IS NULL
UNION ALL
SELECT 'Transaction expense_Id issues', COUNT(*)
FROM Transaction t LEFT JOIN Expense e ON t.expense_Id = e.expense_Id WHERE e.expense_Id IS NULL
UNION ALL
SELECT 'Transaction payer_user_Id issues', COUNT(*)
FROM Transaction t LEFT JOIN User u ON t.payer_user_Id = u.user_Id WHERE u.user_Id IS NULL
UNION ALL
SELECT 'Transaction payee_user_Id issues', COUNT(*)
FROM Transaction t LEFT JOIN User u ON t.payee_user_Id = u.user_Id WHERE u.user_Id IS NULL
UNION ALL
SELECT 'BankAccount user_Id issues', COUNT(*)
FROM BankAccount ba LEFT JOIN User u ON ba.user_Id = u.user_Id WHERE u.user_Id IS NULL
UNION ALL
SELECT 'Card account_Id issues', COUNT(*)
FROM Card c LEFT JOIN BankAccount ba ON c.account_Id = ba.account_Id WHERE ba.account_Id IS NULL
UNION ALL
SELECT 'GuestUser expense_Id issues', COUNT(*)
FROM GuestUser gu LEFT JOIN Expense e ON gu.expense_Id = e.expense_Id WHERE e.expense_Id IS NULL;
*/

-- Summary Statistics
/*
SELECT 
    'Users' as entity, COUNT(*) as total_count FROM User
UNION ALL
SELECT 'Active Friendships', COUNT(*) FROM Friend WHERE status = 1
UNION ALL
SELECT 'Pending Friend Requests', COUNT(*) FROM FriendRequest WHERE status = 'pending'
UNION ALL
SELECT 'Active Groups', COUNT(*) FROM UserGroup WHERE status = 1
UNION ALL
SELECT 'Total Expenses', COUNT(*) FROM Expense WHERE status = 1
UNION ALL
SELECT 'Total Transactions', COUNT(*) FROM Transaction WHERE status = 1
UNION ALL
SELECT 'Bank Accounts', COUNT(*) FROM BankAccount WHERE status = 1
UNION ALL
SELECT 'Cards', COUNT(*) FROM Card WHERE status = 1
UNION ALL
SELECT 'Guest Users', COUNT(*) FROM GuestUser WHERE status = 1;
*/

-- =====================================================
-- END OF SCRIPT
-- =====================================================

COMMIT;