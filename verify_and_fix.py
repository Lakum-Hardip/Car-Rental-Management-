#!/usr/bin/env python
"""
Car Rental Management System - Verification and Fix Script
This script verifies the project setup, runs migrations, and creates sample data.
"""

import os
import sys
import django
from pathlib import Path

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'car_rental.settings')
sys.path.insert(0, str(Path(__file__).parent))

django.setup()

from django.core.management import call_command
from django.db import connection
from rental.models import Customer, Car, AdminUser, Booking, Payment, VehicleMaintenance, AdminActivityLog

def print_section(title):
    """Print section header."""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def check_django_health():
    """Run Django checks."""
    print_section("1. Django Health Check")
    try:
        from django.core.management import call_command
        from io import StringIO
        out = StringIO()
        call_command('check', stdout=out, stderr=out)
        print("✓ Django checks passed!")
        return True
    except Exception as e:
        print(f"✗ Django check failed: {e}")
        return False

def check_database():
    """Check and verify database setup."""
    print_section("2. Database Verification")
    try:
        # Get database info
        db = connection.settings_dict
        db_name = db.get('NAME', 'Unknown')
        db_engine = db.get('ENGINE', 'Unknown')
        
        print(f"Database Engine: {db_engine}")
        print(f"Database File: {db_name}")
        
        # Check if db file exists
        if os.path.exists(db_name):
            size_mb = os.path.getsize(db_name) / (1024 * 1024)
            print(f"Database Size: {size_mb:.2f} MB")
            print("✓ Database file exists")
        else:
            print("! Database file not found - will be created by migrations")
        
        return True
    except Exception as e:
        print(f"✗ Database check failed: {e}")
        return False

def run_migrations():
    """Run all pending migrations."""
    print_section("3. Running Migrations")
    try:
        from io import StringIO
        out = StringIO()
        call_command('migrate', stdout=out, stderr=out)
        print("✓ Migrations completed successfully!")
        return True
    except Exception as e:
        print(f"✗ Migration failed: {e}")
        return False

def verify_tables():
    """Verify all required tables exist."""
    print_section("4. Verifying Database Tables")
    try:
        cursor = connection.cursor()
        
        # Get list of tables
        if 'sqlite' in connection.settings_dict['ENGINE'].lower():
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        else:
            cursor.execute("SHOW TABLES")
        
        tables = [row[0] for row in cursor.fetchall()]
        
        required_tables = [
            'rental_customer',
            'rental_car',
            'rental_booking',
            'rental_payment',
            'rental_admin',
            'rental_vehicle_maintenance',
            'rental_admin_activity_log',
        ]
        
        print(f"Found {len(tables)} tables in database:")
        for table in sorted(tables):
            status = "✓" if table in required_tables or table.startswith('django_') or table.startswith('auth_') else "○"
            print(f"  {status} {table}")
        
        missing = [t for t in required_tables if t not in tables]
        if missing:
            print(f"\n✗ Missing required tables: {missing}")
            return False
        
        print("\n✓ All required tables exist!")
        return True
    except Exception as e:
        print(f"✗ Table verification failed: {e}")
        return False

def check_admin_user():
    """Check if admin user exists."""
    print_section("5. Admin User Verification")
    try:
        admin_count = AdminUser.objects.count()
        print(f"Total admin users: {admin_count}")
        
        if admin_count > 0:
            for admin in AdminUser.objects.all():
                print(f"  - {admin.username} ({admin.role})")
            print("✓ Admin users exist")
            return True
        else:
            print("! No admin users found - will create one")
            return False
    except Exception as e:
        print(f"✗ Admin check failed: {e}")
        return False

def create_admin_user():
    """Create default admin user if not exists."""
    print_section("6. Creating Default Admin User")
    try:
        if AdminUser.objects.filter(username='admin').exists():
            print("✓ Admin user 'admin' already exists")
            return True
        
        admin = AdminUser(
            username='admin',
            email='admin@carrental.local',
            role='Manager'
        )
        admin.set_password('admin123')
        admin.save()
        print(f"✓ Created admin user:")
        print(f"  Username: admin")
        print(f"  Password: admin123")
        print(f"  Role: Manager")
        return True
    except Exception as e:
        print(f"✗ Failed to create admin: {e}")
        return False

def check_sample_data():
    """Check if sample data exists."""
    print_section("7. Sample Data Check")
    try:
        car_count = Car.objects.count()
        customer_count = Customer.objects.count()
        booking_count = Booking.objects.count()
        
        print(f"Cars in database: {car_count}")
        print(f"Customers in database: {customer_count}")
        print(f"Bookings in database: {booking_count}")
        
        if car_count > 0:
            print("\n✓ Sample cars already exist")
            return True
        else:
            print("! No sample data found - will create it")
            return False
    except Exception as e:
        print(f"✗ Sample data check failed: {e}")
        return False

def create_sample_cars():
    """Create sample cars for testing."""
    print_section("8. Creating Sample Car Data")
    try:
        if Car.objects.count() > 0:
            print("✓ Sample cars already exist, skipping creation")
            return True
        
        sample_cars = [
            {
                'brand': 'Toyota',
                'model': 'Fortuner',
                'reg_no': 'DL-01-AA-0001',
                'vehicle_type': 'Petrol',
                'capacity': 7,
                'rent_per_day': 5000,
                'status': 'Available',
            },
            {
                'brand': 'Hyundai',
                'model': 'Creta',
                'reg_no': 'DL-01-AA-0002',
                'vehicle_type': 'Diesel',
                'capacity': 5,
                'rent_per_day': 3500,
                'status': 'Available',
            },
            {
                'brand': 'Maruti',
                'model': 'Swift',
                'reg_no': 'DL-01-AA-0003',
                'vehicle_type': 'Petrol',
                'capacity': 5,
                'rent_per_day': 2000,
                'status': 'Available',
            },
            {
                'brand': 'Mahindra',
                'model': 'XUV500',
                'reg_no': 'DL-01-AA-0004',
                'vehicle_type': 'Diesel',
                'capacity': 7,
                'rent_per_day': 4500,
                'status': 'Available',
            },
            {
                'brand': 'Honda',
                'model': 'City',
                'reg_no': 'DL-01-AA-0005',
                'vehicle_type': 'Petrol',
                'capacity': 5,
                'rent_per_day': 2500,
                'status': 'Available',
            },
            {
                'brand': 'Tata',
                'model': 'Safari',
                'reg_no': 'DL-01-AA-0006',
                'vehicle_type': 'Diesel',
                'capacity': 7,
                'rent_per_day': 4000,
                'status': 'Available',
            },
            {
                'brand': 'Kia',
                'model': 'Seltos',
                'reg_no': 'DL-01-AA-0007',
                'vehicle_type': 'Petrol',
                'capacity': 5,
                'rent_per_day': 3000,
                'status': 'Available',
            },
            {
                'brand': 'MG',
                'model': 'Hector',
                'reg_no': 'DL-01-AA-0008',
                'vehicle_type': 'Diesel',
                'capacity': 7,
                'rent_per_day': 4500,
                'status': 'Available',
            },
        ]
        
        created = []
        for car_data in sample_cars:
            car = Car.objects.create(**car_data)
            created.append(car)
            print(f"✓ Created: {car.brand} {car.model} ({car.reg_no}) - ${car.rent_per_day}/day")
        
        print(f"\n✓ Successfully created {len(created)} sample cars!")
        return True
    except Exception as e:
        print(f"✗ Failed to create sample cars: {e}")
        return False

def verify_models():
    """Verify all models can be accessed."""
    print_section("9. Model Verification")
    try:
        models = [
            ('Customer', Customer),
            ('Car', Car),
            ('AdminUser', AdminUser),
            ('Booking', Booking),
            ('Payment', Payment),
            ('VehicleMaintenance', VehicleMaintenance),
            ('AdminActivityLog', AdminActivityLog),
        ]
        
        for name, model in models:
            count = model.objects.count()
            print(f"✓ {name}: {count} records")
        
        print("\n✓ All models accessible!")
        return True
    except Exception as e:
        print(f"✗ Model verification failed: {e}")
        return False

def main():
    """Run all verification steps."""
    print_section("CAR RENTAL MANAGEMENT SYSTEM - VERIFICATION & FIX")
    
    steps = [
        ("Django Health Check", check_django_health),
        ("Database Verification", check_database),
        ("Run Migrations", run_migrations),
        ("Verify Tables", verify_tables),
        ("Check Admin User", check_admin_user),
        ("Create Admin User", create_admin_user),
        ("Check Sample Data", check_sample_data),
        ("Create Sample Cars", create_sample_cars),
        ("Model Verification", verify_models),
    ]
    
    results = []
    for step_name, step_func in steps:
        try:
            result = step_func()
            results.append((step_name, result))
        except Exception as e:
            print(f"✗ {step_name} failed with exception: {e}")
            results.append((step_name, False))
    
    # Print summary
    print_section("VERIFICATION SUMMARY")
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for step_name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {step_name}")
    
    print(f"\nTotal: {passed}/{total} steps passed")
    
    if passed == total:
        print("\n✓ ALL CHECKS PASSED - PROJECT IS READY!")
        print("\nTo run the development server:")
        print("  python manage.py runserver")
        print("\nThen visit:")
        print("  - Customer Portal: http://127.0.0.1:8000/")
        print("  - Admin Dashboard: http://127.0.0.1:8000/admin/login/")
        print("  - Admin Credentials: admin / admin123")
    else:
        print("\n✗ Some checks failed - please review the output above")
    
    return 0 if passed == total else 1

if __name__ == '__main__':
    sys.exit(main())
