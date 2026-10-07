"""
Car Rental Management System - RESTful API Views for React Frontend.
Preserves existing Django models, auth, and business logic.
"""
import json
from decimal import Decimal
from datetime import date, timedelta
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from django.db.models import Sum, Count, Q
from django.shortcuts import get_object_or_404

from rental.models import (
    Customer, Car, AdminUser, Booking, Payment,
    VehicleMaintenance, AdminActivityLog
)
from rental.views.admin_views import log_admin_activity


def _car_to_dict(car, request=None):
    """Serialize Car model to dict."""
    image_url = None
    if car.image:
        try:
            image_url = car.image.url
            if request and not image_url.startswith('http'):
                image_url = request.build_absolute_uri(image_url)
        except Exception:
            image_url = None
    return {
        'car_id': car.car_id,
        'brand': car.brand,
        'model': car.model,
        'reg_no': car.reg_no,
        'vehicle_type': car.vehicle_type,
        'capacity': car.capacity,
        'rent_per_day': float(car.rent_per_day),
        'status': car.status,
        'image': image_url,
        'latitude': float(car.latitude) if car.latitude is not None else 23.0225,
        'longitude': float(car.longitude) if car.longitude is not None else 72.5714,
        'created_at': car.created_at.isoformat() if car.created_at else None,
    }


def _customer_to_dict(customer):
    return {
        'customer_id': customer.customer_id,
        'name': customer.name,
        'email': customer.email,
        'phone_no': customer.phone_no,
        'license_no': customer.license_no,
        'address': customer.address,
    }


def _admin_to_dict(admin):
    return {
        'admin_id': admin.admin_id,
        'username': admin.username,
        'email': admin.email,
        'role': admin.role,
    }


def _booking_to_dict(booking, request=None):
    return {
        'booking_id': booking.booking_id,
        'customer_id': booking.customer_id,
        'customer_name': booking.customer.name if booking.customer else '',
        'customer_email': booking.customer.email if booking.customer else '',
        'car': _car_to_dict(booking.car, request) if booking.car else None,
        'start_date': booking.start_date.isoformat() if booking.start_date else None,
        'end_date': booking.end_date.isoformat() if booking.end_date else None,
        'total_amount': float(booking.total_amount),
        'payment_status': booking.payment_status,
        'contract_accepted': booking.contract_accepted,
        'late_penalty': float(booking.late_penalty),
        'is_cancelled': booking.is_cancelled,
        'cancelled_at': booking.cancelled_at.isoformat() if booking.cancelled_at else None,
        'refund_amount': float(booking.refund_amount) if booking.refund_amount else 0.0,
        'created_at': booking.created_at.isoformat() if booking.created_at else None,
    }


# ==============================================================================
# Public & Cars Endpoints
# ==============================================================================

@require_http_methods(["GET"])
def api_car_list(request):
    """List available cars with optional filters."""
    qs = Car.objects.all()
    
    # Optional status filter (default to Available for customer browse unless all=true)
    status_filter = request.GET.get('status')
    show_all = request.GET.get('all', 'false').lower() == 'true'
    if status_filter:
        qs = qs.filter(status=status_filter)
    elif not show_all:
        qs = qs.filter(status='Available')

    # Brand / Model / Type search
    car_type = request.GET.get('car_type', '').strip()
    if car_type:
        qs = qs.filter(
            Q(brand__icontains=car_type) |
            Q(model__icontains=car_type) |
            Q(vehicle_type__icontains=car_type)
        )

    # Date conflict filter
    start_date_s = request.GET.get('start_date', '').strip()
    end_date_s = request.GET.get('end_date', '').strip()
    if start_date_s and end_date_s:
        try:
            start_date = date.fromisoformat(start_date_s)
            end_date = date.fromisoformat(end_date_s)
            booked_car_ids = Booking.objects.filter(
                is_cancelled=False,
                start_date__lte=end_date,
                end_date__gte=start_date
            ).values_list('car_id', flat=True)
            qs = qs.exclude(car_id__in=booked_car_ids)
        except ValueError:
            pass

    cars = [_car_to_dict(c, request) for c in qs]
    return JsonResponse({'success': True, 'cars': cars, 'count': len(cars)})


@require_http_methods(["GET"])
def api_car_detail(request, car_id):
    """Retrieve single car detail."""
    car = get_object_or_404(Car, car_id=car_id)
    return JsonResponse({'success': True, 'car': _car_to_dict(car, request)})


# ==============================================================================
# Authentication Endpoints
# ==============================================================================

@csrf_exempt
@require_http_methods(["POST"])
def api_register(request):
    """Register customer."""
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON body'}, status=400)

    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    phone_no = data.get('phone_no', '').strip()
    license_no = data.get('license_no', '').strip()
    address = data.get('address', '').strip()
    password = data.get('password', '')

    if not all([name, email, phone_no, license_no, password]):
        return JsonResponse({'success': False, 'error': 'All required fields must be provided.'}, status=400)

    if Customer.objects.filter(email=email).exists():
        return JsonResponse({'success': False, 'error': 'An account with this email already exists.'}, status=400)

    customer = Customer(
        name=name,
        email=email,
        phone_no=phone_no,
        license_no=license_no,
        address=address,
    )
    customer.set_password(password)
    customer.save()

    # Automatically set session
    request.session['customer_id'] = customer.customer_id
    request.session['user_type'] = 'customer'

    return JsonResponse({
        'success': True,
        'message': 'Registration successful.',
        'customer': _customer_to_dict(customer),
        'user_type': 'customer'
    })


@csrf_exempt
@require_http_methods(["POST"])
def api_login(request):
    """Customer login."""
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON body'}, status=400)

    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    try:
        customer = Customer.objects.get(email=email)
        if customer.check_password(password):
            request.session['customer_id'] = customer.customer_id
            request.session['user_type'] = 'customer'
            return JsonResponse({
                'success': True,
                'message': f'Welcome back, {customer.name}!',
                'customer': _customer_to_dict(customer),
                'user_type': 'customer'
            })
    except Customer.DoesNotExist:
        pass

    return JsonResponse({'success': False, 'error': 'Invalid email or password.'}, status=401)


@csrf_exempt
@require_http_methods(["POST"])
def api_admin_login(request):
    """Admin login."""
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON body'}, status=400)

    username = data.get('username', '').strip()
    password = data.get('password', '')

    try:
        admin_user = AdminUser.objects.get(username=username)
        if admin_user.check_password(password):
            request.session['admin_id'] = admin_user.admin_id
            request.session['user_type'] = 'admin'
            request.session['admin_role'] = admin_user.role
            log_admin_activity(admin_user, 'Logged In', 'AdminUser', admin_user.admin_id, 'Admin session authenticated', request)
            return JsonResponse({
                'success': True,
                'message': f'Welcome, {admin_user.username}.',
                'admin': _admin_to_dict(admin_user),
                'user_type': 'admin'
            })
    except AdminUser.DoesNotExist:
        pass

    return JsonResponse({'success': False, 'error': 'Invalid username or password.'}, status=401)


@require_http_methods(["GET"])
def api_me(request):
    """Get current session user."""
    user_type = request.session.get('user_type')
    if user_type == 'customer':
        cid = request.session.get('customer_id')
        if cid:
            try:
                c = Customer.objects.get(customer_id=cid)
                return JsonResponse({'success': True, 'user_type': 'customer', 'user': _customer_to_dict(c)})
            except Customer.DoesNotExist:
                pass
    elif user_type == 'admin':
        aid = request.session.get('admin_id')
        if aid:
            try:
                a = AdminUser.objects.get(admin_id=aid)
                return JsonResponse({'success': True, 'user_type': 'admin', 'user': _admin_to_dict(a)})
            except AdminUser.DoesNotExist:
                pass

    return JsonResponse({'success': True, 'user_type': None, 'user': None})


@csrf_exempt
@require_http_methods(["POST"])
def api_logout(request):
    """Logout current user."""
    request.session.flush()
    return JsonResponse({'success': True, 'message': 'Logged out successfully.'})


# ==============================================================================
# Customer Actions: Bookings, Payments, Profile
# ==============================================================================

@csrf_exempt
@require_http_methods(["GET", "POST"])
def api_bookings(request):
    """List customer's bookings or create a new booking."""
    user_type = request.session.get('user_type')
    customer_id = request.session.get('customer_id')

    if request.method == 'GET':
        if user_type != 'customer' or not customer_id:
            # Return demo/empty list if unauthenticated
            return JsonResponse({'success': True, 'bookings': []})
        bookings = Booking.objects.select_related('car', 'customer').filter(customer_id=customer_id).order_by('-created_at')
        return JsonResponse({'success': True, 'bookings': [_booking_to_dict(b, request) for b in bookings]})

    # POST: Create booking
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON body'}, status=400)

    # Allow customer_id from request body if session not set (e.g. dev/direct api call)
    if not customer_id:
        customer_id = data.get('customer_id')
    if not customer_id:
        customer = Customer.objects.first()
        if customer:
            customer_id = customer.customer_id

    customer = get_object_or_404(Customer, customer_id=customer_id)
    car_id = data.get('car_id')
    car = get_object_or_404(Car, car_id=car_id)

    start_date_s = data.get('start_date')
    end_date_s = data.get('end_date')
    if not start_date_s or not end_date_s:
        return JsonResponse({'success': False, 'error': 'Both start and end dates are required.'}, status=400)

    start_date = date.fromisoformat(start_date_s)
    end_date = date.fromisoformat(end_date_s)
    if end_date < start_date:
        return JsonResponse({'success': False, 'error': 'Return date must be on or after pick-up date.'}, status=400)

    days = (end_date - start_date).days + 1
    total_amount = Decimal(str(days)) * car.rent_per_day

    booking = Booking.objects.create(
        customer=customer,
        car=car,
        start_date=start_date,
        end_date=end_date,
        total_amount=total_amount,
        payment_status='Unpaid',
        contract_accepted=data.get('contract_accepted', True)
    )

    return JsonResponse({
        'success': True,
        'message': 'Booking reservation created successfully.',
        'booking': _booking_to_dict(booking, request)
    })


@require_http_methods(["GET"])
def api_booking_detail(request, booking_id):
    """Get single booking details with payment and receipt."""
    booking = get_object_or_404(Booking.objects.select_related('car', 'customer'), booking_id=booking_id)
    payment = Payment.objects.filter(booking=booking).order_by('-created_at').first()
    payment_dict = None
    if payment:
        payment_dict = {
            'payment_id': payment.payment_id,
            'amount': float(payment.amount),
            'method': payment.method,
            'payment_date': payment.payment_date.isoformat(),
        }

    return JsonResponse({
        'success': True,
        'booking': _booking_to_dict(booking, request),
        'payment': payment_dict,
        'customer': _customer_to_dict(booking.customer),
    })


@csrf_exempt
@require_http_methods(["POST"])
def api_booking_cancel(request, booking_id):
    """Cancel booking with refund calculation."""
    booking = get_object_or_404(Booking, booking_id=booking_id)
    if booking.is_cancelled:
        return JsonResponse({'success': False, 'error': 'Booking is already cancelled.'}, status=400)

    today = timezone.now().date()
    days_to_start = (booking.start_date - today).days

    if days_to_start >= 2:
        refund_rate = Decimal('1.00')
    elif days_to_start >= 1:
        refund_rate = Decimal('0.50')
    else:
        refund_rate = Decimal('0.00')

    refund_amount = booking.total_amount * refund_rate if booking.payment_status == 'Paid' else Decimal('0')

    booking.is_cancelled = True
    booking.cancelled_at = timezone.now()
    booking.refund_amount = refund_amount
    booking.save()

    return JsonResponse({
        'success': True,
        'message': 'Reservation cancelled.',
        'refund_amount': float(refund_amount),
        'booking': _booking_to_dict(booking, request)
    })


@csrf_exempt
@require_http_methods(["POST"])
def api_payment_process(request, booking_id):
    """Simulate payment checkout."""
    booking = get_object_or_404(Booking, booking_id=booking_id)
    if booking.payment_status == 'Paid':
        return JsonResponse({'success': False, 'error': 'Booking is already marked as paid.'}, status=400)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        data = {}

    method = data.get('method', 'Card')
    payment = Payment.objects.create(
        booking=booking,
        amount=booking.total_amount,
        method=method
    )
    booking.payment_status = 'Paid'
    booking.save()

    return JsonResponse({
        'success': True,
        'message': 'Payment authorized and settled successfully.',
        'payment_id': payment.payment_id,
        'booking': _booking_to_dict(booking, request)
    })


@csrf_exempt
@require_http_methods(["GET", "POST", "PUT"])
def api_profile(request):
    """Get or update customer profile."""
    customer_id = request.session.get('customer_id')
    if not customer_id:
        customer = Customer.objects.first()
    else:
        customer = get_object_or_404(Customer, customer_id=customer_id)

    if not customer:
        return JsonResponse({'success': False, 'error': 'Customer not found'}, status=404)

    if request.method in ['POST', 'PUT']:
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'error': 'Invalid JSON body'}, status=400)

        customer.name = data.get('name', customer.name)
        customer.phone_no = data.get('phone_no', customer.phone_no)
        customer.license_no = data.get('license_no', customer.license_no)
        customer.address = data.get('address', customer.address)
        customer.save()
        return JsonResponse({'success': True, 'message': 'Profile updated successfully.', 'customer': _customer_to_dict(customer)})

    return JsonResponse({'success': True, 'customer': _customer_to_dict(customer)})


# ==============================================================================
# Admin Endpoints: Dashboard, Fleet CRUD, Bookings, Reports, Maintenance
# ==============================================================================

@require_http_methods(["GET"])
def api_admin_dashboard(request):
    """Admin dashboard KPIs and metrics."""
    today = timezone.now().date()
    total_bookings = Booking.objects.filter(is_cancelled=False).count()
    today_bookings = Booking.objects.filter(start_date__lte=today, end_date__gte=today, is_cancelled=False).count()
    revenue_total = Payment.objects.aggregate(s=Sum('amount'))['s'] or Decimal('0')
    revenue_today = Payment.objects.filter(payment_date=today).aggregate(s=Sum('amount'))['s'] or Decimal('0')
    vehicles_total = Car.objects.count()
    vehicles_available = Car.objects.filter(status='Available').count()
    vehicles_maintenance = Car.objects.filter(status='Maintenance').count()
    customers_count = Customer.objects.count()

    daily_bookings = []
    for i in range(13, -1, -1):
        d = today - timedelta(days=i)
        cnt = Booking.objects.filter(start_date__lte=d, end_date__gte=d, is_cancelled=False).count()
        daily_bookings.append({'date': d.isoformat(), 'count': cnt})

    recent_bookings = Booking.objects.select_related('customer', 'car').filter(is_cancelled=False).order_by('-created_at')[:10]

    return JsonResponse({
        'success': True,
        'stats': {
            'total_bookings': total_bookings,
            'today_bookings': today_bookings,
            'revenue_total': float(revenue_total),
            'revenue_today': float(revenue_today),
            'vehicles_total': vehicles_total,
            'vehicles_available': vehicles_available,
            'vehicles_maintenance': vehicles_maintenance,
            'customers_count': customers_count,
        },
        'daily_bookings': daily_bookings,
        'recent_bookings': [_booking_to_dict(b, request) for b in recent_bookings]
    })


@csrf_exempt
@require_http_methods(["GET", "POST"])
def api_admin_cars(request):
    """Admin list or add car."""
    if request.method == 'GET':
        cars = Car.objects.all().order_by('-created_at')
        return JsonResponse({'success': True, 'cars': [_car_to_dict(c, request) for c in cars]})

    # POST: Add car
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON body'}, status=400)

    brand = data.get('brand', '').strip()
    model = data.get('model', '').strip()
    reg_no = data.get('reg_no', '').strip()
    vehicle_type = data.get('vehicle_type', 'Petrol')
    capacity = int(data.get('capacity', 5))
    rent_per_day = Decimal(str(data.get('rent_per_day', 2500)))
    status = data.get('status', 'Available')
    lat = data.get('latitude', 23.0225)
    lng = data.get('longitude', 72.5714)

    if Car.objects.filter(reg_no=reg_no).exists():
        return JsonResponse({'success': False, 'error': f'Car with registration {reg_no} already exists.'}, status=400)

    car = Car.objects.create(
        brand=brand,
        model=model,
        reg_no=reg_no,
        vehicle_type=vehicle_type,
        capacity=capacity,
        rent_per_day=rent_per_day,
        status=status,
        latitude=Decimal(str(lat)),
        longitude=Decimal(str(lng))
    )

    return JsonResponse({'success': True, 'message': 'Vehicle added to fleet.', 'car': _car_to_dict(car, request)})


@csrf_exempt
@require_http_methods(["GET", "PUT", "DELETE"])
def api_admin_car_detail(request, car_id):
    """Admin get, edit or delete car."""
    car = get_object_or_404(Car, car_id=car_id)

    if request.method == 'GET':
        return JsonResponse({'success': True, 'car': _car_to_dict(car, request)})

    if request.method == 'DELETE':
        car.delete()
        return JsonResponse({'success': True, 'message': 'Vehicle removed from fleet.'})

    # PUT: Edit
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON body'}, status=400)

    car.brand = data.get('brand', car.brand)
    car.model = data.get('model', car.model)
    car.reg_no = data.get('reg_no', car.reg_no)
    car.vehicle_type = data.get('vehicle_type', car.vehicle_type)
    car.capacity = int(data.get('capacity', car.capacity))
    car.rent_per_day = Decimal(str(data.get('rent_per_day', car.rent_per_day)))
    car.status = data.get('status', car.status)
    if 'latitude' in data:
        car.latitude = Decimal(str(data['latitude']))
    if 'longitude' in data:
        car.longitude = Decimal(str(data['longitude']))
    car.save()

    return JsonResponse({'success': True, 'message': 'Vehicle updated.', 'car': _car_to_dict(car, request)})


@csrf_exempt
@require_http_methods(["POST"])
def api_admin_car_status(request, car_id):
    """Toggle or update car status."""
    car = get_object_or_404(Car, car_id=car_id)
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        data = {}

    new_status = data.get('status')
    if not new_status:
        # Toggle cycle: Available -> Booked -> Maintenance -> Available
        cycle = {'Available': 'Booked', 'Booked': 'Maintenance', 'Maintenance': 'Available'}
        new_status = cycle.get(car.status, 'Available')

    car.status = new_status
    car.save()
    return JsonResponse({'success': True, 'status': car.status, 'car': _car_to_dict(car, request)})


@csrf_exempt
@require_http_methods(["GET", "POST"])
def api_admin_bookings(request):
    """List all bookings or modify booking status."""
    if request.method == 'GET':
        bookings = Booking.objects.select_related('customer', 'car').all().order_by('-created_at')
        return JsonResponse({'success': True, 'bookings': [_booking_to_dict(b, request) for b in bookings]})

    # POST: Update booking payment_status
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON body'}, status=400)

    bid = data.get('booking_id')
    booking = get_object_or_404(Booking, booking_id=bid)
    if 'payment_status' in data:
        booking.payment_status = data['payment_status']
    if 'is_cancelled' in data:
        booking.is_cancelled = data['is_cancelled']
    booking.save()

    return JsonResponse({'success': True, 'message': 'Booking updated.', 'booking': _booking_to_dict(booking, request)})


@require_http_methods(["GET"])
def api_admin_customers(request):
    """List all registered drivers."""
    customers = Customer.objects.annotate(bookings_count=Count('booking')).all().order_by('-customer_id')
    data = []
    for c in customers:
        cd = _customer_to_dict(c)
        cd['bookings_count'] = c.bookings_count
        data.append(cd)
    return JsonResponse({'success': True, 'customers': data})


@require_http_methods(["GET"])
def api_admin_customer_detail(request, customer_id):
    """Get single customer profile with booking history."""
    customer = get_object_or_404(Customer, customer_id=customer_id)
    bookings = Booking.objects.select_related('car').filter(customer=customer).order_by('-created_at')
    return JsonResponse({
        'success': True,
        'customer': _customer_to_dict(customer),
        'bookings': [_booking_to_dict(b, request) for b in bookings]
    })


@require_http_methods(["GET"])
def api_admin_payments(request):
    """List payment transactions ledger."""
    payments = Payment.objects.select_related('booking', 'booking__customer', 'booking__car').all().order_by('-created_at')
    data = []
    for p in payments:
        data.append({
            'payment_id': p.payment_id,
            'booking_id': p.booking.booking_id if p.booking else None,
            'customer_name': p.booking.customer.name if p.booking and p.booking.customer else '',
            'vehicle': f"{p.booking.car.brand} {p.booking.car.model}" if p.booking and p.booking.car else '',
            'amount': float(p.amount),
            'method': p.method,
            'payment_date': p.payment_date.isoformat(),
            'created_at': p.created_at.isoformat() if p.created_at else None,
        })
    return JsonResponse({'success': True, 'payments': data})


@require_http_methods(["GET"])
def api_admin_reports(request):
    """Financial and fleet analytics summary."""
    today = timezone.now().date()
    total_rev = Payment.objects.aggregate(s=Sum('amount'))['s'] or Decimal('0')
    total_bookings = Booking.objects.filter(is_cancelled=False).count()
    cancelled_bookings = Booking.objects.filter(is_cancelled=True).count()
    
    # By vehicle type
    type_stats = Car.objects.values('vehicle_type').annotate(count=Count('car_id'))
    
    # By method
    method_stats = Payment.objects.values('method').annotate(total=Sum('amount'), count=Count('payment_id'))

    return JsonResponse({
        'success': True,
        'reports': {
            'total_revenue': float(total_rev),
            'total_bookings': total_bookings,
            'cancelled_bookings': cancelled_bookings,
            'fleet_by_type': list(type_stats),
            'payments_by_method': [{'method': m['method'], 'total': float(m['total'] or 0), 'count': m['count']} for m in method_stats],
        }
    })


@csrf_exempt
@require_http_methods(["GET", "POST"])
def api_admin_maintenance(request):
    """Garage and vehicle maintenance tracking."""
    if request.method == 'GET':
        records = VehicleMaintenance.objects.select_related('car').all().order_by('-scheduled_date')
        data = []
        for r in records:
            data.append({
                'id': r.id,
                'car_id': r.car.car_id,
                'vehicle': f"{r.car.brand} {r.car.model} ({r.car.reg_no})",
                'scheduled_date': r.scheduled_date.isoformat(),
                'completed_date': r.completed_date.isoformat() if r.completed_date else None,
                'description': r.description,
                'cost': float(r.cost) if r.cost else 0.0,
                'status': r.status,
            })
        return JsonResponse({'success': True, 'maintenance': data})

    # POST: Add record
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON body'}, status=400)

    car_id = data.get('car_id')
    car = get_object_or_404(Car, car_id=car_id)
    rec = VehicleMaintenance.objects.create(
        car=car,
        scheduled_date=date.fromisoformat(data['scheduled_date']),
        description=data.get('description', ''),
        cost=Decimal(str(data.get('cost', 0))),
        status=data.get('status', 'Scheduled')
    )
    # Automatically mark car as Maintenance if status is In Progress
    if rec.status == 'In Progress':
        car.status = 'Maintenance'
        car.save()

    return JsonResponse({'success': True, 'message': 'Service record added.', 'id': rec.id})


@require_http_methods(["GET"])
def api_admin_activity_logs(request):
    """System activity security audit trail."""
    logs = AdminActivityLog.objects.select_related('admin').all().order_by('-created_at')[:50]
    data = []
    for l in logs:
        data.append({
            'id': l.id,
            'admin': l.admin.username if l.admin else 'System',
            'action': l.action,
            'model_name': l.model_name,
            'details': l.details,
            'ip_address': l.ip_address,
            'created_at': l.created_at.isoformat() if l.created_at else None,
        })
    return JsonResponse({'success': True, 'logs': data})
