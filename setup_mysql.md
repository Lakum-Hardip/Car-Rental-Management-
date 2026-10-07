# My Car - MySQL Database Setup

## Create Tables in MySQL

All required tables are created automatically by Django migrations. Run:

```bash
python manage.py migrate
```

Or if using `py` launcher on Windows:
```bash
py -3 manage.py migrate
```

## Tables Created

The migration creates these MySQL tables:

| Table | Description |
|-------|-------------|
| `rental_customer` | Customer profiles |
| `rental_car` | Vehicles |
| `rental_admin` | Admin users (Manager/Staff) |
| `rental_booking` | Bookings |
| `rental_payment` | Payments |
| `rental_vehicle_maintenance` | Maintenance records |
| `rental_admin_activity_log` | Admin audit logs |

## Prerequisites

1. MySQL server running on localhost:3306
2. Database `car_rental_db` created:
   ```sql
   CREATE DATABASE car_rental_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Update `car_rental/settings.py` if your MySQL user/password differ

## Create Admin User

After migrations, create an admin user:
```bash
python manage.py create_admin
```
