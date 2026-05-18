"""
Admin panel views: Dashboard, vehicles CRUD, bookings, payments, reports, activity logs.
Role-based access: Manager / Staff.
"""
from functools import wraps
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.views.decorators.http import require_http_methods
from django.db.models import Sum, Count
from django.db.models.functions import TruncDate, TruncWeek, TruncMonth, TruncYear
from django.utils import timezone
from datetime import date, timedelta
from decimal import Decimal
import json

from rental.models import (
    AdminUser, Customer, Car, Booking, Payment,
    VehicleMaintenance, AdminActivityLog
)
from rental.forms import CarForm, MaintenanceForm


def get_admin_user(request):
    """Return current admin from session or None."""
    if request.session.get('user_type') != 'admin':
        return None
    aid = request.session.get('admin_id')
    if not aid:
        return None
    try:
        return AdminUser.objects.get(admin_id=aid)
    except AdminUser.DoesNotExist:
        return None


def admin_required(view_func):
    """Decorator: require admin login."""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if get_admin_user(request) is None:
            messages.warning(request, 'Please log in as admin.')
            return redirect('rental:login')
        return view_func(request, *args, **kwargs)
    return wrapper


def log_admin_activity(admin_user, action, model_name='', object_id=None, details='', request=None):
    """Record admin activity for audit."""
    ip = None
    if request:
        xff = request.META.get('HTTP_X_FORWARDED_FOR')
        ip = xff.split(',')[0].strip() if xff else request.META.get('REMOTE_ADDR')
    AdminActivityLog.objects.create(
        admin=admin_user,
        action=action,
        model_name=model_name,
        object_id=object_id,
        details=details,
        ip_address=ip,
    )


@admin_required
def admin_dashboard(request):
    """Admin dashboard with charts & statistics."""
    admin_user = get_admin_user(request)
    today = timezone.now().date()
    # Stats
    total_bookings = Booking.objects.filter(is_cancelled=False).count()
    today_bookings = Booking.objects.filter(start_date__lte=today, end_date__gte=today, is_cancelled=False).count()
    revenue_total = Payment.objects.aggregate(s=Sum('amount'))['s'] or Decimal('0')
    revenue_today = Payment.objects.filter(payment_date=today).aggregate(s=Sum('amount'))['s'] or Decimal('0')
    vehicles_total = Car.objects.count()
    vehicles_available = Car.objects.filter(status='Available').count()
    vehicles_maintenance = Car.objects.filter(status='Maintenance').count()
    customers_count = Customer.objects.count()
    # Daily bookings for chart (last 14 days)
    daily_bookings = []
    for i in range(13, -1, -1):
        d = today - timedelta(days=i)
        cnt = Booking.objects.filter(start_date__lte=d, end_date__gte=d, is_cancelled=False).count()
        daily_bookings.append({'date': d.isoformat(), 'count': cnt})
    # Recent bookings
    recent_bookings = Booking.objects.select_related('customer', 'car').filter(is_cancelled=False).order_by('-created_at')[:10]
    context = {
        'admin_user': admin_user,
        'total_bookings': total_bookings,
        'today_bookings': today_bookings,
        'revenue_total': revenue_total,
        'revenue_today': revenue_today,
        'vehicles_total': vehicles_total,
        'vehicles_available': vehicles_available,
        'vehicles_maintenance': vehicles_maintenance,
        'customers_count': customers_count,
        'daily_bookings': daily_bookings,
        'daily_bookings_json': json.dumps(daily_bookings),
        'recent_bookings': recent_bookings,
    }
    return render(request, 'rental/admin/dashboard.html', context)


@admin_required
def admin_car_list(request):
    """List all vehicles with availability management."""
    cars = Car.objects.all().order_by('-updated_at')
    return render(request, 'rental/admin/car_list.html', {'cars': cars})


@admin_required
@require_http_methods(["GET", "POST"])
def admin_car_add(request):
    """Add new vehicle."""
    admin_user = get_admin_user(request)
    if request.method == 'POST':
        form = CarForm(request.POST, request.FILES)
        if form.is_valid():
            car = form.save()
            log_admin_activity(admin_user, 'Added vehicle', 'Car', car.car_id, str(car), request)
            messages.success(request, 'Vehicle added successfully.')
            return redirect('rental:admin_car_list')
        messages.error(request, 'Please correct the errors below.')
    else:
        form = CarForm()
    return render(request, 'rental/admin/car_form.html', {'form': form, 'title': 'Add Vehicle'})


@admin_required
@require_http_methods(["GET", "POST"])
def admin_car_edit(request, car_id):
    """Update vehicle."""
    car = get_object_or_404(Car, car_id=car_id)
    admin_user = get_admin_user(request)
    if request.method == 'POST':
        form = CarForm(request.POST, request.FILES, instance=car)
        if form.is_valid():
            form.save()
            log_admin_activity(admin_user, 'Updated vehicle', 'Car', car.car_id, str(car), request)
            messages.success(request, 'Vehicle updated successfully.')
            return redirect('rental:admin_car_list')
        messages.error(request, 'Please correct the errors below.')
    else:
        form = CarForm(instance=car)
    return render(request, 'rental/admin/car_form.html', {'form': form, 'car': car, 'title': 'Edit Vehicle'})


@admin_required
@require_http_methods(["POST"])
def admin_car_delete(request, car_id):
    """Delete vehicle."""
    car = get_object_or_404(Car, car_id=car_id)
    admin_user = get_admin_user(request)
    name = str(car)
    car.delete()
    log_admin_activity(admin_user, 'Deleted vehicle', 'Car', car_id, name, request)
    messages.success(request, 'Vehicle deleted.')
    return redirect('rental:admin_car_list')


@admin_required
@require_http_methods(["POST"])
def admin_car_status(request, car_id):
    """Quick update vehicle status (Available / Booked / Maintenance)."""
    car = get_object_or_404(Car, car_id=car_id)
    status = request.POST.get('status')
    if status in ('Available', 'Booked', 'Maintenance'):
        car.status = status
        car.save(update_fields=['status'])
        messages.success(request, f'Status set to {status}.')
    return redirect('rental:admin_car_list')


@admin_required
def admin_booking_list(request):
    """Manage bookings."""
    bookings = Booking.objects.select_related('customer', 'car').all().order_by('-created_at')
    return render(request, 'rental/admin/booking_list.html', {'bookings': bookings})


@admin_required
def admin_payment_list(request):
    """Manage payments."""
    payments = Payment.objects.select_related('booking', 'booking__customer', 'booking__car').all().order_by('-created_at')
    return render(request, 'rental/admin/payment_list.html', {'payments': payments})


@admin_required
def admin_customer_list(request):
    """Manage customers."""
    customers = Customer.objects.all().order_by('-customer_id')
    return render(request, 'rental/admin/customer_list.html', {'customers': customers})


@admin_required
def admin_customer_profile(request, customer_id):
    """View customer profile with booking history."""
    customer = get_object_or_404(Customer, customer_id=customer_id)
    bookings = Booking.objects.filter(customer=customer).select_related('car').order_by('-created_at')[:20]
    payments = Payment.objects.filter(booking__customer=customer).select_related('booking', 'booking__car').order_by('-created_at')[:20]
    context = {'customer': customer, 'bookings': bookings, 'payments': payments}
    return render(request, 'rental/admin/customer_profile.html', context)


@admin_required
def admin_reports(request):
    """Reports with day/week/month/year filters plus vehicle usage."""
    today = timezone.now().date()
    period = (request.GET.get('period') or 'month').lower()
    if period not in ('day', 'week', 'month', 'year'):
        period = 'month'

    booking_qs = Booking.objects.filter(is_cancelled=False)
    payment_qs = Payment.objects.all()

    if period == 'day':
        start_date = today - timedelta(days=29)
        booking_trunc = TruncDate('start_date')
        payment_trunc = TruncDate('payment_date')
    elif period == 'week':
        start_date = today - timedelta(weeks=11)
        booking_trunc = TruncWeek('start_date')
        payment_trunc = TruncWeek('payment_date')
    elif period == 'month':
        start_date = (today.replace(day=1) - timedelta(days=330)).replace(day=1)
        booking_trunc = TruncMonth('start_date')
        payment_trunc = TruncMonth('payment_date')
    else:  # year
        start_date = date(today.year - 4, 1, 1)
        booking_trunc = TruncYear('start_date')
        payment_trunc = TruncYear('payment_date')

    bookings_grouped = (
        booking_qs.filter(start_date__gte=start_date)
        .annotate(bucket=booking_trunc)
        .values('bucket')
        .annotate(bookings=Count('booking_id'))
        .order_by('bucket')
    )
    revenue_grouped = (
        payment_qs.filter(payment_date__gte=start_date)
        .annotate(bucket=payment_trunc)
        .values('bucket')
        .annotate(revenue=Sum('amount'))
        .order_by('bucket')
    )

    report_rows = {}
    for row in bookings_grouped:
        report_rows[row['bucket']] = {
            'date': row['bucket'],
            'bookings': row['bookings'],
            'revenue': Decimal('0'),
        }
    for row in revenue_grouped:
        if row['bucket'] not in report_rows:
            report_rows[row['bucket']] = {
                'date': row['bucket'],
                'bookings': 0,
                'revenue': row['revenue'] or Decimal('0'),
            }
        else:
            report_rows[row['bucket']]['revenue'] = row['revenue'] or Decimal('0')
    summary_rows = []
    for bucket in sorted(report_rows.keys()):
        row = report_rows[bucket]
        label = str(bucket)
        if period == 'day':
            label = bucket.strftime('%d %b %Y')
        elif period == 'week':
            week_end = bucket + timedelta(days=6)
            label = f"{bucket.strftime('%d %b %Y')} - {week_end.strftime('%d %b %Y')}"
        elif period == 'month':
            label = bucket.strftime('%b %Y')
        elif period == 'year':
            label = bucket.strftime('%Y')
        row['label'] = label
        summary_rows.append(row)

    total_bookings = sum(r['bookings'] for r in summary_rows)
    total_revenue = sum((r['revenue'] or Decimal('0')) for r in summary_rows)

    # Vehicle usage (bookings per car)
    from django.db.models import Q
    vehicle_usage = Car.objects.annotate(
        booking_count=Count('booking', filter=Q(booking__is_cancelled=False))
    ).order_by('-booking_count')
    context = {
        'summary_rows': summary_rows,
        'period': period,
        'total_bookings': total_bookings,
        'total_revenue': total_revenue,
        'vehicle_usage': vehicle_usage,
    }
    return render(request, 'rental/admin/reports.html', context)


@admin_required
def admin_maintenance_list(request):
    """Vehicle maintenance & garage service tracking."""
    maintenances = VehicleMaintenance.objects.select_related('car').all().order_by('-scheduled_date')
    return render(request, 'rental/admin/maintenance_list.html', {'maintenances': maintenances})


@admin_required
@require_http_methods(["GET", "POST"])
def admin_maintenance_add(request):
    """Schedule maintenance."""
    admin_user = get_admin_user(request)
    if request.method == 'POST':
        form = MaintenanceForm(request.POST)
        if form.is_valid():
            m = form.save()
            log_admin_activity(admin_user, 'Scheduled maintenance', 'VehicleMaintenance', m.id, str(m.car), request)
            messages.success(request, 'Maintenance scheduled.')
            return redirect('rental:admin_maintenance_list')
        messages.error(request, 'Please correct the errors below.')
    else:
        form = MaintenanceForm()
    return render(request, 'rental/admin/maintenance_form.html', {'form': form, 'title': 'Schedule Maintenance'})


@admin_required
def admin_activity_logs(request):
    """Admin activity logs."""
    logs = AdminActivityLog.objects.select_related('admin').all().order_by('-created_at')[:200]
    return render(request, 'rental/admin/activity_logs.html', {'logs': logs})
