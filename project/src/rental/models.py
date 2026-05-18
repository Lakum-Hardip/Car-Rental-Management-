"""
Car Rental Management System - Django ORM Models.
Exact structure as per project specification (Customer, Car, Booking, Payment, Admin).
"""
from django.db import models
from django.contrib.auth.hashers import make_password, check_password


class Customer(models.Model):
    """Customer table - registered users who can book cars."""
    customer_id = models.AutoField(primary_key=True, db_column='customer_id')
    name = models.CharField(max_length=255)
    address = models.TextField(blank=True)
    phone_no = models.CharField(max_length=20)
    email = models.EmailField(unique=True)
    license_no = models.CharField(max_length=50)
    password = models.CharField(max_length=128)  # Store hashed password

    class Meta:
        db_table = 'rental_customer'
        verbose_name = 'Customer'
        verbose_name_plural = 'Customers'

    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password)

    def __str__(self):
        return self.name


class Car(models.Model):
    """Car table - vehicles available for rent."""
    VEHICLE_TYPE_CHOICES = [
        ('CNG', 'CNG'),
        ('Petrol', 'Petrol'),
        ('Diesel', 'Diesel'),
        ('Electric', 'Electric'),
    ]
    STATUS_CHOICES = [
        ('Available', 'Available'),
        ('Booked', 'Booked'),
        ('Maintenance', 'Maintenance'),
    ]
    car_id = models.AutoField(primary_key=True, db_column='car_id')
    model = models.CharField(max_length=100)
    brand = models.CharField(max_length=100)
    reg_no = models.CharField(max_length=20, unique=True)
    vehicle_type = models.CharField(max_length=20, choices=VEHICLE_TYPE_CHOICES, default='Petrol')
    capacity = models.PositiveIntegerField()  # Number of seats
    rent_per_day = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Available')
    image = models.ImageField(upload_to='cars/', blank=True, null=True)
    # For GPS / pickup location
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'rental_car'
        verbose_name = 'Car'
        verbose_name_plural = 'Cars'

    def __str__(self):
        return f"{self.brand} {self.model} ({self.reg_no})"


class AdminUser(models.Model):
    """Admin table - Manager / Staff with role-based access."""
    ROLE_CHOICES = [
        ('Manager', 'Manager'),
        ('Staff', 'Staff'),
    ]
    admin_id = models.AutoField(primary_key=True, db_column='admin_id')
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(unique=True, null=True, blank=True)
    password = models.CharField(max_length=128)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    class Meta:
        db_table = 'rental_admin'
        verbose_name = 'Admin'
        verbose_name_plural = 'Admins'

    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password)

    def __str__(self):
        return f"{self.username} ({self.role})"


class Booking(models.Model):
    """Booking table - links customer, car, dates and payment status."""
    PAYMENT_STATUS_CHOICES = [
        ('Paid', 'Paid'),
        ('Unpaid', 'Unpaid'),
    ]
    booking_id = models.AutoField(primary_key=True, db_column='booking_id')
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, db_column='customer_id')
    car = models.ForeignKey(Car, on_delete=models.CASCADE, db_column='car_id')
    start_date = models.DateField()
    end_date = models.DateField()
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='Unpaid')
    # Contract acceptance (digital agreement)
    contract_accepted = models.BooleanField(default=False)
    # Late return penalty (calculated if returned late)
    late_penalty = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    # Cancellation
    is_cancelled = models.BooleanField(default=False)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'rental_booking'
        verbose_name = 'Booking'
        verbose_name_plural = 'Bookings'
        ordering = ['-created_at']

    def __str__(self):
        return f"Booking #{self.booking_id} - {self.car}"


class Payment(models.Model):
    """Payment table - records payments against bookings."""
    METHOD_CHOICES = [
        ('Cash', 'Cash'),
        ('Card', 'Card'),
        ('Online', 'Online'),
    ]
    payment_id = models.AutoField(primary_key=True, db_column='payment_id')
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, db_column='booking_id')
    payment_date = models.DateField(auto_now_add=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=20, choices=METHOD_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'rental_payment'
        verbose_name = 'Payment'
        verbose_name_plural = 'Payments'

    def __str__(self):
        return f"Payment #{self.payment_id} - {self.amount} ({self.method})"


class VehicleMaintenance(models.Model):
    """Vehicle maintenance / garage service tracking."""
    car = models.ForeignKey(Car, on_delete=models.CASCADE)
    scheduled_date = models.DateField()
    completed_date = models.DateField(null=True, blank=True)
    description = models.TextField()
    cost = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=True, blank=True)
    status = models.CharField(max_length=50, default='Scheduled')  # Scheduled, In Progress, Completed
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'rental_vehicle_maintenance'
        verbose_name = 'Vehicle Maintenance'
        verbose_name_plural = 'Vehicle Maintenances'

    def __str__(self):
        return f"{self.car} - {self.scheduled_date}"


class AdminActivityLog(models.Model):
    """Admin activity logs for audit trail."""
    admin = models.ForeignKey(AdminUser, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=255)
    model_name = models.CharField(max_length=100, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    details = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'rental_admin_activity_log'
        verbose_name = 'Admin Activity Log'
        verbose_name_plural = 'Admin Activity Logs'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.admin} - {self.action} at {self.created_at}"
