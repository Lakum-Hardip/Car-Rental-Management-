# Car Rental Management System - Setup and Fixes Walkthrough

## What was fixed
The project was originally configured to use MySQL and `mysqlclient`. On Windows, installing `mysqlclient` often fails without the proper C++ build tools, which prevented the project from starting. Furthermore, Pillow had a version mismatch that caused a `Pillow is not installed` error during Django checks.

To fix this and make the application easily runnable:
1. **Swapped MySQL for SQLite3**: I updated `car_rental/settings.py` to use Python's built-in `sqlite3` database engine. This removes the need to manually install and configure MySQL Server.
2. **Fixed Dependencies**: I commented out `mysqlclient` in `requirements.txt` and downgraded `Pillow` to a stable version (`10.4.0`) that properly works in your environment.
3. **Initialized the Database**: I ran the database migrations to set up all tables and created the default admin user.

## How to Run This

The project is fully set up and ready to go. To start the development server, simply run the following commands in your terminal:

### 1. Open your terminal in the project folder
Ensure you are in the `h:\car_rental_management\fp\project` directory.

### 2. Activate the Virtual Environment
Activate the pre-configured virtual environment:
```powershell
.\venv\Scripts\activate
```

### 3. Start the Server
Run the Django development server:
```powershell
python manage.py runserver
```

### 4. Access the Application
- **Customer Portal**: Open your browser and go to [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- **Admin Dashboard**: Go to [http://127.0.0.1:8000/admin/login/](http://127.0.0.1:8000/admin/login/)

**Admin Credentials:**
- **Username:** `admin`
- **Password:** `admin123`

You can now log in, add vehicles, and test out the car rental system!
