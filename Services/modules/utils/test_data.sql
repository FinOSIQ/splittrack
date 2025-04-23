-- Execute after schema creation
-- Get-Content modules\utils\test_data.sql | & "C:\xampp\mysql\bin\mysql.exe" -u root -D splittrack


START TRANSACTION;

-- Users
INSERT INTO User (user_Id, email, first_name, last_name, phone_number, birthdate, currency_pref) VALUES 
('d57bce76', 'alice@example.com', 'Alice', 'Smith', '1234567890', '1995-04-10', 'USD'),
('600fc673', 'bob@example.com', 'Bob', 'Jones', '2345678901', '1993-06-20', 'USD'),
('711ca4dc', 'carol@example.com', 'Carol', 'Taylor', '3456789012', '1990-11-05', 'EUR'),
('65d0ed7b', 'dan@example.com', 'Dan', 'Brown', '4567890123', '1988-09-15', 'GBP');

-- User Groups
INSERT INTO UserGroup (group_Id, name) VALUES 
('49bf830f', 'Trip Buddies'),
('2515d78d', 'Office Team');

-- Bank Accounts
INSERT INTO BankAccount (account_Id, account_no, bank, branch) VALUES 
('c6fb7de1', '0011223344', 'Bank A', 'Main Branch'),
('3f005076', '5566778899', 'Bank B', 'City Branch');

-- Cards
INSERT INTO Card (card_Id, card_no, card_name, card_expiry, card_cv, bankAccountAccount_Id) VALUES 
('65ce5d5c', '4111111111111111', 'Alice''s Card', '12/27', '123', 'c6fb7de1'),
('ea638936', '4222222222222222', 'Bob''s Card', '11/26', '321', '3f005076');

-- Friends
INSERT INTO Friend (friend_Id, user_id_1User_Id, user_id_2User_Id) VALUES 
('d4341b6f', 'd57bce76', '600fc673'),
('fe07bc52', '711ca4dc', '65d0ed7b');

-- Friend Requests

INSERT INTO FriendRequest (friendReq_ID, send_user_idUser_Id, receive_user_Id, status)
VALUES ('19ddeeb0', '600fc673', '711ca4dc', 'pending');

-- Group Members
INSERT INTO UserGroupMember (group_member_Id, member_role, groupGroup_Id, userUser_Id) VALUES 
('2ee48272', 'creator', '49bf830f', 'd57bce76'),
('5a3f9b9a', 'member', '49bf830f', '600fc673'),
('8cd2b6d4', 'creator', '2515d78d', '711ca4dc'),
('1e0facc9', 'member', '2515d78d', '65d0ed7b');

-- Expenses
INSERT INTO Expense (expense_Id, name, expense_total_amount, expense_actual_amount, usergroupGroup_Id) VALUES 
('ec9986e2', 'Hotel Booking', 120.00, 120.00, '49bf830f'),
('af0348c4', 'Lunch', 50.50, 50.50, '49bf830f'),
('b098f734', 'Office Party', 200.00, 200.00, '2515d78d');

-- Expense Participants
INSERT INTO ExpenseParticipant (participant_Id, participant_role, owning_amount, expenseExpense_Id, userUser_Id) VALUES 
-- Hotel Booking
('p1', 'creator', 60.00, 'ec9986e2', 'd57bce76'),
('p2', 'participant', 60.00, 'ec9986e2', '600fc673'),

-- Lunch
('p3', 'creator', 25.25, 'af0348c4', '600fc673'),
('p4', 'participant', 25.25, 'af0348c4', 'd57bce76'),

-- Office Party
('p5', 'creator', 100.00, 'b098f734', '711ca4dc'),
('p6', 'participant', 100.00, 'b098f734', '65d0ed7b');

-- Transactions
INSERT INTO Transaction (transaction_Id, payed_amount, expenseExpense_Id, payee_IdUser_Id) VALUES 
('3bbf9a77', 60.00, 'ec9986e2', 'd57bce76'),
('1fa24d66', 25.25, 'af0348c4', '600fc673'),
('9a8f4a62', 100.00, 'b098f734', '711ca4dc');

COMMIT;
