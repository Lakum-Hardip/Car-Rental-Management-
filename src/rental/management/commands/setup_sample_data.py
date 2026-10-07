"""
Management command: Setup sample data (cars, customers, bookings) for testing.
Usage: python manage.py setup_sample_data
"""
from django.core.management.base import BaseCommand
from rental.models import Car, Customer, AdminUser
from decimal import Decimal


class Command(BaseCommand):
    help = 'Create sample data (cars, customers) for testing the Car Rental System.'

    def handle(self, *args, **options):
        self.stdout.write('\n' + '='*60)
        self.stdout.write('CAR RENTAL - SAMPLE DATA SETUP')
        self.stdout.write('='*60 + '\n')
        
        # Create sample cars
        self.stdout.write(self.style.SUCCESS('Creating sample cars...'))
        self._create_sample_cars()
        
        # Create sample customers
        self.stdout.write(self.style.SUCCESS('\nCreating sample customers...'))
        self._create_sample_customers()
        
        # Create admin if not exists
        self.stdout.write(self.style.SUCCESS('\nVerifying admin user...'))
        self._ensure_admin_exists()
        
        self.stdout.write(self.style.SUCCESS('\n✓ Sample data setup complete!\n'))
    
    def _create_sample_cars(self):
        """Create sample car records."""
        cars_data = [
            {
                'brand': 'Toyota',
                'model': 'Fortuner',
                'reg_no': 'DL-01-AA-0001',
                'vehicle_type': 'Petrol',
                'capacity': 7,
                'rent_per_day': Decimal('5000.00'),
                'status': 'Available',
            },
            {
                'brand': 'Hyundai',
                'model': 'Creta',
                'reg_no': 'DL-01-AA-0002',
                'vehicle_type': 'Diesel',
                'capacity': 5,
                'rent_per_day': Decimal('3500.00'),
                'status': 'Available',
            },
            {
                'brand': 'Maruti',
                'model': 'Swift',
                'reg_no': 'DL-01-AA-0003',
                'vehicle_type': 'Petrol',
                'capacity': 5,
                'rent_per_day': Decimal('2000.00'),
                'status': 'Available',
            },
            {
                'brand': 'Mahindra',
                'model': 'XUV500',
                'reg_no': 'DL-01-AA-0004',
                'vehicle_type': 'Diesel',
                'capacity': 7,
                'rent_per_day': Decimal('4500.00'),
                'status': 'Available',
            },
            {
                'brand': 'Honda',
                'model': 'City',
                'reg_no': 'DL-01-AA-0005',
                'vehicle_type': 'Petrol',
                'capacity': 5,
                'rent_per_day': Decimal('2500.00'),
                'status': 'Available',
            },
            {
                'brand': 'Tata',
                'model': 'Safari',
                'reg_no': 'DL-01-AA-0006',
                'vehicle_type': 'Diesel',
                'capacity': 7,
                'rent_per_day': Decimal('4000.00'),
                'status': 'Available',
            },
            {
                'brand': 'Kia',
                'model': 'Seltos',
                'reg_no': 'DL-01-AA-0007',
                'vehicle_type': 'Petrol',
                'capacity': 5,
                'rent_per_day': Decimal('3000.00'),
                'status': 'Available',
            },
            {
                'brand': 'MG',
                'model': 'Hector',
                'reg_no': 'DL-01-AA-0008',
                'vehicle_type': 'Diesel',
                'capacity': 7,
                'rent_per_day': Decimal('4500.00'),
                'status': 'Available',
            },
        ]
        
        created_count = 0
        for car_data in cars_data:
            if Car.objects.filter(reg_no=car_data['reg_no']).exists():
                self.stdout.write(f"  ○ {car_data['brand']} {car_data['model']} ({car_data['reg_no']}) - Already exists")
                continue
            
            car = Car.objects.create(**car_data)
            created_count += 1
            self.stdout.write(
                self.style.SUCCESS(f"  ✓ Created: {car.brand} {car.model} ({car.reg_no}) - ${car.rent_per_day}/day")
            )
        
        self.stdout.write(f"\nSummary: Created {created_count} new cars, {len(cars_data) - created_count} already existed")
    
    def _create_sample_customers(self):
        """Create sample customer records."""
        customers_data = [
            {
                'name': 'John Doe',
                'email': 'john@example.com',
                'phone_no': '9876543210',
                'address': '123 Main Street, New Delhi',
                'license_no': 'DL-1001',
            },
            {
                'name': 'Jane Smith',
                'email': 'jane@example.com',
                'phone_no': '9876543211',
                'address': '456 Park Avenue, Mumbai',
                'license_no': 'MH-2002',
            },
            {
                'name': 'Raj Kumar',
                'email': 'raj@example.com',
                'phone_no': '9876543212',
                'address': '789 Lake Road, Bangalore',
                'license_no': 'KA-3003',
            },
        ]
        
        created_count = 0
        for cust_data in customers_data:
            if Customer.objects.filter(email=cust_data['email']).exists():
                self.stdout.write(f"  ○ {cust_data['name']} ({cust_data['email']}) - Already exists")
                continue
            
            customer = Customer(**cust_data)
            customer.set_password('Password@123')
            customer.save()
            created_count += 1
            self.stdout.write(
                self.style.SUCCESS(f"  ✓ Created: {customer.name} ({customer.email})")
            )
        
        self.stdout.write(f"\nSummary: Created {created_count} new customers, {len(customers_data) - created_count} already existed")
        if created_count > 0:
            self.stdout.write(self.style.WARNING("  Note: All sample customers have password: Password@123"))
    
    def _ensure_admin_exists(self):
        """Ensure admin user exists."""
        if AdminUser.objects.filter(username='admin').exists():
            admin = AdminUser.objects.get(username='admin')
            self.stdout.write(self.style.SUCCESS(f"  ✓ Admin user 'admin' ({admin.role}) already exists"))
            return
        
        admin = AdminUser(
            username='admin',
            email='admin@carrental.local',
            role='Manager'
        )
        admin.set_password('admin123')
        admin.save()
        self.stdout.write(self.style.SUCCESS(f"  ✓ Created admin user:"))
        self.stdout.write(f"     Username: admin")
        self.stdout.write(f"     Password: admin123")
        self.stdout.write(f"     Role: Manager")
