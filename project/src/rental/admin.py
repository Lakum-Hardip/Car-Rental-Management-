"""
Register models with Django admin for superuser management.
"""
from django.contrib import admin
from .models import Customer, Car, AdminUser, Booking, Payment, VehicleMaintenance, AdminActivityLog


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('customer_id', 'name', 'email', 'phone_no')
    search_fields = ('name', 'email', 'phone_no')


@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    list_display = ('car_id', 'brand', 'model', 'reg_no', 'status', 'rent_per_day')
    list_filter = ('status', 'brand')
    search_fields = ('brand', 'model', 'reg_no')


@admin.register(AdminUser)
class AdminUserAdmin(admin.ModelAdmin):
    list_display = ('admin_id', 'username', 'role')


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('booking_id', 'customer', 'car', 'start_date', 'end_date', 'payment_status', 'total_amount')
    list_filter = ('payment_status', 'start_date')


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('payment_id', 'booking', 'amount', 'method', 'payment_date')


@admin.register(VehicleMaintenance)
class VehicleMaintenanceAdmin(admin.ModelAdmin):
    list_display = ('car', 'scheduled_date', 'status', 'description')


@admin.register(AdminActivityLog)
class AdminActivityLogAdmin(admin.ModelAdmin):
    list_display = ('admin', 'action', 'model_name', 'created_at')
    list_filter = ('created_at',)
    readonly_fields = ('admin', 'action', 'model_name', 'object_id', 'details', 'ip_address', 'created_at')
