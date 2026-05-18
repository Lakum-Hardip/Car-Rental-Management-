"""
Car Rental Management System - URL routing.
"""
from django.urls import path
from rental.views import auth_views, customer_views, admin_views

app_name = 'rental'

urlpatterns = [
    # Public
    path('', customer_views.home, name='home'),
    path('cars/', customer_views.car_list, name='car_list'),
    path('cars/<int:car_id>/', customer_views.car_detail, name='car_detail'),
    # Auth
    path('register/', auth_views.register, name='register'),
    path('login/', auth_views.login, name='login'),
    path('password-reset/customer/', auth_views.customer_password_reset_request, name='customer_password_reset_request'),
    path('password-reset/admin/', auth_views.admin_password_reset_request, name='admin_password_reset_request'),
    path('password-reset/<str:token>/', auth_views.password_reset_confirm, name='password_reset_confirm'),
    path('logout/', auth_views.logout_view, name='logout'),
    path('admin/login/', auth_views.admin_login, name='admin_login'),
    # Customer (login required)
    path('dashboard/', customer_views.dashboard, name='dashboard'),
    path('profile/', customer_views.profile, name='profile'),
    path('booking/<int:car_id>/', customer_views.booking_create, name='booking_create'),
    path('payment/<int:booking_id>/', customer_views.payment_view, name='payment'),
    path('receipt/<int:booking_id>/', customer_views.receipt, name='receipt'),
    path('receipt/<int:booking_id>/pdf/', customer_views.receipt_pdf, name='receipt_pdf'),
    path('booking/<int:booking_id>/cancel/', customer_views.booking_cancel, name='booking_cancel'),
    path('tracking/<int:booking_id>/', customer_views.tracking, name='tracking'),
    # Admin panel
    path('admin-panel/', admin_views.admin_dashboard, name='admin_dashboard'),
    path('admin-panel/cars/', admin_views.admin_car_list, name='admin_car_list'),
    path('admin-panel/cars/add/', admin_views.admin_car_add, name='admin_car_add'),
    path('admin-panel/cars/<int:car_id>/edit/', admin_views.admin_car_edit, name='admin_car_edit'),
    path('admin-panel/cars/<int:car_id>/delete/', admin_views.admin_car_delete, name='admin_car_delete'),
    path('admin-panel/cars/<int:car_id>/status/', admin_views.admin_car_status, name='admin_car_status'),
    path('admin-panel/bookings/', admin_views.admin_booking_list, name='admin_booking_list'),
    path('admin-panel/payments/', admin_views.admin_payment_list, name='admin_payment_list'),
    path('admin-panel/customers/', admin_views.admin_customer_list, name='admin_customer_list'),
    path('admin-panel/customers/<int:customer_id>/', admin_views.admin_customer_profile, name='admin_customer_profile'),
    path('admin-panel/reports/', admin_views.admin_reports, name='admin_reports'),
    path('admin-panel/maintenance/', admin_views.admin_maintenance_list, name='admin_maintenance_list'),
    path('admin-panel/maintenance/add/', admin_views.admin_maintenance_add, name='admin_maintenance_add'),
    path('admin-panel/activity-logs/', admin_views.admin_activity_logs, name='admin_activity_logs'),
]
