# Car Rental Management System

A **complete, production-ready** web-based Car Rental Management System built with **Django**, **MySQL**, **HTML5**, **CSS3**, and **JavaScript**. Suitable for college final-year projects and academic evaluation.

## Project Overview

- **Objective:** Fast, secure, and reliable car rental services with multiple car categories, real-time vehicle tracking (Google Maps), online booking, digital payments, and contract-based rental agreements.
- **Architecture:** MVT (Model-View-Template) with Django; clean separation of concerns and industry best practices.

## Features

### Authentication
- User registration and login (customers)
- Admin login (Manager / Staff)
- Password encryption (Django hashers)
- Session-based authentication

### Customer
- Search cars by location, date range, car type
- View car details (images, brand, model, capacity, rent/day, availability)
- Online booking with contract acceptance
- Payment options: Credit Card, Debit Card, Online/UPI (simulation)
- Auto-generated receipt (on-screen + PDF download)
- Booking history, profile management
- Real-time vehicle tracking (Google Maps)
- Booking cancellation with refund logic
- Notifications (console email when configured)

### Admin
- Dashboard with statistics and charts (bookings, revenue, vehicles)
- Add / update / delete vehicles
- Vehicle availability: Available / Booked / Maintenance
- Vehicle maintenance & garage service tracking
- Manage customers, bookings, payments
- Reports: daily bookings, revenue, vehicle usage
- Role-based access (Manager / Staff)
- Admin activity logs (audit trail)

### Advanced
- Google Maps: pickup/drop location, live vehicle tracking
- Vehicle maintenance scheduler
- Late return penalty calculation
- Email notifications (console backend if no SMTP)
- Invoice & receipt generation (PDF)
- Booking cancellation with refund logic
- Frontend + backend validation
- Secure database transactions
- Search & filter system

## Tech Stack

| Layer    | Technology        |
|----------|-------------------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend  | Python 3, Django 4.x |
| Database | MySQL 8.x (utf8mb4) |
| Maps     | Google Maps JavaScript API |
| PDF      | ReportLab |

## Project Structure

```
project/
├── manage.py
├── requirements.txt
├── README.md
├── mysql_schema.sql          # Schema reference
├── src/
│   ├── car_rental/           # Project config
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   └── rental/               # Main app
│       ├── models.py         # Customer, Car, Booking, Payment, Admin, Maintenance, ActivityLog
│       ├── views/            # auth_views, customer_views, admin_views
│       ├── forms.py
│       ├── urls.py
│       ├── admin.py
│       ├── management/commands/
│       │   └── create_admin.py   # Create admin user
│       └── templates/rental/     # All HTML templates
├── templates/                # Base template
│   └── base.html
├── static/                   # Optional CSS/JS
└── media/                    # Uploaded car images (created on run)
```

## Setup Instructions

### 1. Prerequisites

- **Python 3.10+**
- **MySQL 8.x** (or 5.7+)
- **pip** and **virtualenv** (recommended)

### 2. Create Virtual Environment

```bash
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

If `mysqlclient` fails on Windows, install MySQL dev headers or use a wheel from [here](https://www.lfd.uci.edu/~gohlke/pythonlibs/#mysqlclient).

### 4. Configure MySQL

1. Create database:

```sql
CREATE DATABASE car_rental_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'carrental'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON car_rental_db.* TO 'carrental'@'localhost';
FLUSH PRIVILEGES;
```

2. Set environment variables (or edit `car_rental/settings.py`):

```bash
# Windows (PowerShell)
$env:MYSQL_DATABASE="car_rental_db"
$env:MYSQL_USER="carrental"
$env:MYSQL_PASSWORD="your_password"
$env:MYSQL_HOST="127.0.0.1"
$env:MYSQL_PORT="3306"
```

Or in `settings.py` under `DATABASES['default']` set `NAME`, `USER`, `PASSWORD`, `HOST`, `PORT`.

### 5. Run Migrations

```bash
python manage.py migrate
```

This creates all tables (Customer, Car, Booking, Payment, Admin, VehicleMaintenance, AdminActivityLog, and Django auth/session tables).

### 6. Create Admin User

```bash
python manage.py create_admin --username admin --password admin123 --role Manager
```

Use this to log in at **/admin/login/** (Admin Login page).

### 7. (Optional) Google Maps API Key

For vehicle tracking and map display:

1. Get an API key from [Google Cloud Console](https://console.cloud.google.com/) (Maps JavaScript API).
2. Set environment variable:

```bash
$env:GOOGLE_MAPS_API_KEY="your_api_key"
```

Or in `settings.py`: `GOOGLE_MAPS_API_KEY = 'your_api_key'`.

### 8. Start Development Server

```bash
python manage.py runserver
```

Open **http://127.0.0.1:8000/** in a browser.

## Main URLs

| URL | Description |
|-----|-------------|
| `/` | Home – search cars |
| `/cars/` | Browse/search cars |
| `/cars/<id>/` | Car detail & book |
| `/register/` | Customer registration |
| `/login/` | Customer login |
| `/logout/` | Logout |
| `/admin/login/` | Admin login |
| `/dashboard/` | Customer dashboard (bookings, profile) |
| `/booking/<car_id>/` | Create booking |
| `/payment/<booking_id>/` | Payment page |
| `/receipt/<booking_id>/` | Receipt (PDF link) |
| `/tracking/<booking_id>/` | Vehicle tracking (Google Maps) |
| `/admin-panel/` | Admin dashboard |
| `/admin-panel/cars/` | Manage vehicles |
| `/admin-panel/bookings/` | Manage bookings |
| `/admin-panel/reports/` | Reports |
| `/admin-panel/activity-logs/` | Activity logs |

## Testing the Application

1. **Customer flow:** Register → Login → Search cars (set dates) → View car → Book (accept contract) → Pay (simulate method) → View receipt → Track vehicle (if Maps key set).
2. **Admin flow:** Login at `/admin/login/` with created admin → Dashboard → Add vehicle → Set status → View bookings/payments/reports → Schedule maintenance → View activity logs.

## Database Design (Exact Structure)

- **Customer:** customer_id, name, address, phone_no, email, license_no, password  
- **Car:** car_id, model, brand, reg_no, capacity, rent_per_day, status (Available/Booked/Maintenance)  
- **Booking:** booking_id, customer_id, car_id, start_date, end_date, total_amount, payment_status (Paid/Unpaid)  
- **Payment:** payment_id, booking_id, payment_date, amount, method (Cash/Card/Online)  
- **Admin:** admin_id, username, password, role (Manager/Staff)  

See `mysql_schema.sql` for full reference.

## Security Notes

- Passwords are hashed (Django’s `make_password` / `check_password`).
- Use strong `SECRET_KEY` and set `DEBUG=False` in production.
- Set `ALLOWED_HOSTS` and use HTTPS in production.
- Never commit real API keys or DB passwords.

## License

This project is for educational and evaluation purposes.

---

**Car Rental System** – Fast, secure & reliable car rental with GPS tracking and digital payments.
