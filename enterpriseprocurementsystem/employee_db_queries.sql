/**********************************************************************
          ENTERPRISE PROCUREMENT SYSTEM
          Database : employee_db
          Developer : Aditya Bhardwaj
**********************************************************************/

USE employee_db;





/**********************************************************************
                            DAY 1
**********************************************************************/

-- Show All Tables
SHOW TABLES;

-- Department Table
SELECT * FROM department;

-- Category Table
SELECT * FROM category;

-- User Table
SELECT * FROM user;

-- Product Table
SELECT * FROM product;

-- Supplier Table
SELECT * FROM supplier;

-- Approval Hierarchy Table
SELECT * FROM approval_hierarchy;





/**********************************************************************
                        DEPARTMENT MODULE
**********************************************************************/

-- Get All Departments
SELECT * FROM department;

-- Get Department By Id
SELECT *
FROM department
WHERE department_id = 1;





/**********************************************************************
                        CATEGORY MODULE
**********************************************************************/

-- Get All Categories
SELECT * FROM category;

-- Categories of Department 1
SELECT *
FROM category
WHERE department_id = 1;





/**********************************************************************
                        USER MODULE
**********************************************************************/

-- Show Users
SELECT * FROM user;

-- Find User By Email
SELECT *
FROM user
WHERE email='aditya@gmail.com';

-- Login Verification
SELECT *
FROM user
WHERE email='aditya@gmail.com'
AND password='Aditya@123';





/**********************************************************************
                        REGISTRATION TEST
**********************************************************************/

-- Verify User Inserted
SELECT *
FROM user;

-- Verify Particular User
SELECT *
FROM user
WHERE email='aditya@gmail.com';

-- Total Registered Users
SELECT COUNT(*) AS TotalUsers
FROM user;





/**********************************************************************
                        LOGIN TEST
**********************************************************************/

-- Correct Login
SELECT *
FROM user
WHERE email='aditya@gmail.com'
AND password='Aditya@123';

-- Wrong Password
SELECT *
FROM user
WHERE email='aditya@gmail.com'
AND password='Wrong@123';

-- Wrong Email
SELECT *
FROM user
WHERE email='wrong@gmail.com';





/**********************************************************************
                        PRODUCT MODULE
**********************************************************************/

SELECT * FROM product;

SELECT *
FROM product
WHERE product_id=1;

SELECT *
FROM product
WHERE department_id=1;

SELECT *
FROM product
WHERE category_id=1;





/**********************************************************************
                        SUPPLIER MODULE
**********************************************************************/

SELECT * FROM supplier;

SELECT *
FROM supplier
WHERE supplier_id=1;

SELECT *
FROM supplier
WHERE product_id=1;





/**********************************************************************
                    APPROVAL HIERARCHY MODULE
**********************************************************************/

SELECT *
FROM approval_hierarchy;

SELECT *
FROM approval_hierarchy
WHERE department_id=1;





/**********************************************************************
                        UPDATE TESTING
**********************************************************************/

UPDATE department
SET manager_of_department='Aditya'
WHERE department_id=1;

SELECT *
FROM department
WHERE department_id=1;





/**********************************************************************
                        DELETE TESTING
**********************************************************************/

-- Example Only
-- DELETE FROM user
-- WHERE user_id=10;





/**********************************************************************
                        COUNT RECORDS
**********************************************************************/

SELECT COUNT(*) FROM department;

SELECT COUNT(*) FROM category;

SELECT COUNT(*) FROM user;

SELECT COUNT(*) FROM product;

SELECT COUNT(*) FROM supplier;

SELECT COUNT(*) FROM approval_hierarchy;





/**********************************************************************
                        CHECK DATABASE
**********************************************************************/

SHOW DATABASES;

USE employee_db;

SHOW TABLES;

DESCRIBE department;

DESCRIBE category;

DESCRIBE user;

DESCRIBE product;

DESCRIBE supplier;

DESCRIBE approval_hierarchy;





/**********************************************************************
                        NOTES
**********************************************************************/

-- Registration API
-- POST /user/register

-- Login API
-- POST /user/login

-- Department APIs
-- GET /department
-- GET /department/{id}

-- Category API
-- GET /category/department/{id}