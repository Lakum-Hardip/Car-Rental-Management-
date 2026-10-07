"""
Car Rental Management System - REST API URL Routing.
"""
from django.urls import path
from rental import api_views

urlpatterns = [
    # Cars
    path('cars/', api_views.api_car_list, name='api_cars'),
    path('cars/<int:car_id>/', api_views.api_car_detail, name='api_car_detail'),

    # Auth
    path('auth/register/', api_views.api_register, name='api_register'),
    path('auth/login/', api_views.api_login, name='api_login'),
    path('auth/admin-login/', api_views.api_admin_login, name='api_admin_login'),
    path('auth/me/', api_views.api_me, name='api_me'),
    path('auth/logout/', api_views.api_logout, name='api_logout'),

    # Customer operations
    path('bookings/', api_views.api_bookings, name='api_bookings'),
    path('bookings/<int:booking_id>/', api_views.api_booking_detail, name='api_booking_detail'),
    path('bookings/<int:booking_id>/cancel/', api_views.api_booking_cancel, name='api_booking_cancel'),
    path('payments/<int:booking_id>/', api_views.api_payment_process, name='api_payment_process'),
    path('profile/', api_views.api_profile, name='api_profile'),

    # Admin operations
    path('admin/dashboard/', api_views.api_admin_dashboard, name='api_admin_dashboard'),
    path('admin/cars/', api_views.api_admin_cars, name='api_admin_cars'),
    path('admin/cars/<int:car_id>/', api_views.api_admin_car_detail, name='api_admin_car_detail'),
    path('admin/cars/<int:car_id>/status/', api_views.api_admin_car_status, name='api_admin_car_status'),
    path('admin/bookings/', api_views.api_admin_bookings, name='api_admin_bookings'),
    path('admin/customers/', api_views.api_admin_customers, name='api_admin_customers'),
    path('admin/customers/<int:customer_id>/', api_views.api_admin_customer_detail, name='api_admin_customer_detail'),
    path('admin/payments/', api_views.api_admin_payments, name='api_admin_payments'),
    path('admin/reports/', api_views.api_admin_reports, name='api_admin_reports'),
    path('admin/maintenance/', api_views.api_admin_maintenance, name='api_admin_maintenance'),
    path('admin/activity-logs/', api_views.api_admin_activity_logs, name='api_admin_activity_logs'),
]
