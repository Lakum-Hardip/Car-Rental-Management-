-- Car Rental Management System - MySQL Schema
-- This file documents the database structure. Tables are created by Django migrations (manage.py migrate).
-- For manual reference only; use: python manage.py migrate

-- Customer Table (rental_customer)
-- customer_id INT PK AUTO_INCREMENT
-- name VARCHAR(255)
-- address TEXT
-- phone_no VARCHAR(20)
-- email VARCHAR(254) UNIQUE
-- license_no VARCHAR(50)
-- password VARCHAR(128)

-- Car Table (rental_car)
-- car_id INT PK AUTO_INCREMENT
-- model VARCHAR(100)
-- brand VARCHAR(100)
-- reg_no VARCHAR(20) UNIQUE
-- capacity INT
-- rent_per_day DECIMAL(10,2)
-- status VARCHAR(20) - Available / Booked / Maintenance
-- image VARCHAR(100) NULL
-- latitude DECIMAL(9,6) NULL, longitude DECIMAL(9,6) NULL
-- created_at DATETIME, updated_at DATETIME

-- Admin Table (rental_admin)
-- admin_id INT PK AUTO_INCREMENT
-- username VARCHAR(100) UNIQUE
-- password VARCHAR(128)
-- role VARCHAR(20) - Manager / Staff

-- Booking Table (rental_booking)
-- booking_id INT PK AUTO_INCREMENT
-- customer_id FK -> rental_customer
-- car_id FK -> rental_car
-- start_date DATE, end_date DATE
-- total_amount DECIMAL(10,2)
-- payment_status VARCHAR(20) - Paid / Unpaid
-- contract_accepted BOOLEAN, late_penalty DECIMAL, is_cancelled BOOLEAN, cancelled_at DATETIME, refund_amount DECIMAL
-- created_at DATETIME, updated_at DATETIME

-- Payment Table (rental_payment)
-- payment_id INT PK AUTO_INCREMENT
-- booking_id FK -> rental_booking
-- payment_date DATE
-- amount DECIMAL(10,2)
-- method VARCHAR(20) - Cash / Card / Online
-- created_at DATETIME

-- Vehicle Maintenance (rental_vehicle_maintenance)
-- car_id FK, scheduled_date DATE, completed_date DATE NULL, description TEXT, cost DECIMAL, status VARCHAR(50)

-- Admin Activity Log (rental_admin_activity_log)
-- admin_id FK, action VARCHAR(255), model_name VARCHAR(100), object_id INT, details TEXT, ip_address VARCHAR(45), created_at DATETIME

-- Create database (run once):
-- CREATE DATABASE car_rental_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- Then set MYSQL_* in environment or settings.py and run: python manage.py migrate
