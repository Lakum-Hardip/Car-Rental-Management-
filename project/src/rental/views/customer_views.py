"""
Customer-facing views: Home, Search, Car listing, Booking, Payment, Receipt, Profile, Tracking.
"""
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.views.decorators.http import require_http_methods
from django.db.models import Q
from django.conf import settings
from django.utils import timezone
from datetime import date
from decimal import Decimal
import re
from functools import wraps

from rental.models import Customer, Car, Booking, Payment
from rental.forms import BookingForm, PaymentForm


def get_customer(request):
    """Return current customer from session or None."""
    if request.session.get('user_type') != 'customer':
        return None
    cid = request.session.get('customer_id')
    if not cid:
        return None
    try:
        return Customer.objects.get(customer_id=cid)
    except Customer.DoesNotExist:
        return None


def customer_required(view_func):
    """Decorator: require customer login."""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if get_customer(request) is None:
            messages.warning(request, 'Please log in to continue.')
            return redirect('rental:login')
        return view_func(request, *args, **kwargs)
    return wrapper


def home(request):
    """Landing page with car search and featured vehicles."""
    cars_featured = Car.objects.filter(status='Available')[:6]
    return render(request, 'rental/home.html', {'cars_featured': cars_featured})


def car_list(request):
    """Search available cars by location, date range, car type."""
    qs = Car.objects.filter(status='Available')
    location = request.GET.get('location', '').strip()
    start_date_s = request.GET.get('start_date', '')
    end_date_s = request.GET.get('end_date', '')
    car_type = request.GET.get('car_type', '').strip()  # brand or model filter

    # Basic city validation (so "invalid/typo" values don't break the search).
    # This uses a curated list of major Indian cities; extend it if you want more.
    valid_city_map = {
        'ahmedabad': 'Ahmedabad',
        'surat': 'Surat',
        'vadodara': 'Vadodara',
        'rajkot': 'Rajkot',
        'bengaluru': 'Bengaluru',
        'bangalore': 'Bengaluru',
        'mumbai': 'Mumbai',
        'pune': 'Pune',
        'nagpur': 'Nagpur',
        'indore': 'Indore',
        'bhopal': 'Bhopal',
        'jabalpur': 'Jabalpur',
        'jaipur': 'Jaipur',
        'delhi': 'Delhi',
        'new delhi': 'Delhi',
        'hyderabad': 'Hyderabad',
        'secunderabad': 'Hyderabad',
        'chennai': 'Chennai',
        'coimbatore': 'Coimbatore',
        'kochi': 'Kochi',
        'ernakulam': 'Kochi',
        'kolkata': 'Kolkata',
        'howrah': 'Kolkata',
        'lucknow': 'Lucknow',
        'kanpur': 'Kanpur',
        'allahabad': 'Prayagraj',
        'prayagraj': 'Prayagraj',
        'guwahati': 'Guwahati',
        'ranchi': 'Ranchi',
        'patna': 'Patna',
        'bhubaneswar': 'Bhubaneswar',
        'cuttack': 'Bhubaneswar',
        'visakhapatnam': 'Visakhapatnam',
        'vizag': 'Visakhapatnam',
        'agartala': 'Agartala',
        'chandigarh': 'Chandigarh',
        'mangaluru': 'Mangaluru',
        'mangalore': 'Mangaluru',
        'guntur': 'Guntur',
        'gaya': 'Gaya',
        'gorakhpur': 'Gorakhpur',
        'varanasi': 'Varanasi',
        'agra': 'Agra',
        'lucknow': 'Lucknow',
        'guhrugram': 'Gurugram',
        'gurugram': 'Gurugram',
        'gurgaon': 'Gurugram',
        'noida': 'Noida',
        'greater noida': 'Noida',
        'ghaziabad': 'Ghaziabad',
        'faridabad': 'Faridabad',
        'mathura': 'Mathura',
    }

    normalized_location = (location or '').lower().strip()
    normalized_location = re.sub(r'\s+', ' ', normalized_location)
    normalized_location = normalized_location.replace('.', '').replace(',', '')

    if normalized_location:
        # If it contains digits/symbols, reject (only letters and spaces expected).
        if not re.match(r'^[a-zA-Z ]+$', normalized_location):
            messages.warning(request, 'Please enter a valid city name (letters only).')
            location = ''
        elif normalized_location not in valid_city_map:
            messages.warning(request, 'Please enter a valid city from India.')
            location = ''
        else:
            location = valid_city_map[normalized_location]

    if start_date_s and end_date_s:
        try:
            start_d = date.fromisoformat(start_date_s)
            end_d = date.fromisoformat(end_date_s)
            # Exclude cars that have overlapping bookings
            booked_car_ids = Booking.objects.filter(
                is_cancelled=False,
                start_date__lte=end_d,
                end_date__gte=start_d
            ).values_list('car_id', flat=True)
            qs = qs.exclude(car_id__in=booked_car_ids)
        except ValueError:
            pass
    if car_type:
        qs = qs.filter(
            Q(brand__icontains=car_type) |
            Q(model__icontains=car_type) |
            Q(vehicle_type__icontains=car_type)
        )

    context = {
        'cars': qs,
        'location': location,
        'start_date': start_date_s,
        'end_date': end_date_s,
        'car_type': car_type,
        'google_maps_key': getattr(settings, 'GOOGLE_MAPS_API_KEY', ''),
    }
    return render(request, 'rental/car_list.html', context)


def car_detail(request, car_id):
    """View car details - images, brand, model, capacity, rent, availability."""
    car = get_object_or_404(Car, car_id=car_id)
    context = {
        'car': car,
        'google_maps_key': getattr(settings, 'GOOGLE_MAPS_API_KEY', ''),
    }
    return render(request, 'rental/car_detail.html', context)


@customer_required
@require_http_methods(["GET", "POST"])
def booking_create(request, car_id):
    """Online booking - dates and contract acceptance."""
    car = get_object_or_404(Car, car_id=car_id)
    if car.status != 'Available':
        messages.error(request, 'This car is not available for booking.')
        return redirect('rental:car_list')
    customer = get_customer(request)
    start_s = request.GET.get('start_date', '')
    end_s = request.GET.get('end_date', '')

    if request.method == 'POST':
        form = BookingForm(request.POST)
        if form.is_valid() and form.cleaned_data.get('accept_contract'):
            start_d = form.cleaned_data['start_date']
            end_d = form.cleaned_data['end_date']
            overlapping = Booking.objects.filter(
                car=car,
                is_cancelled=False,
                start_date__lte=end_d,
                end_date__gte=start_d,
            ).exists()
            if overlapping:
                form.add_error(None, 'This car is already booked for the selected dates.')
            else:
                days = (end_d - start_d).days + 1
                total = car.rent_per_day * days
                booking = Booking.objects.create(
                    customer=customer,
                    car=car,
                    start_date=start_d,
                    end_date=end_d,
                    total_amount=total,
                    payment_status='Unpaid',
                    contract_accepted=True,
                )
                request.session['pending_booking_id'] = booking.booking_id
                messages.success(request, 'Booking created. Please complete payment.')
                return redirect('rental:payment', booking_id=booking.booking_id)
        messages.error(request, 'Please accept the rental agreement and correct any errors.')
    else:
        initial = {}
        if start_s and end_s:
            try:
                initial['start_date'] = date.fromisoformat(start_s)
                initial['end_date'] = date.fromisoformat(end_s)
            except ValueError:
                pass
        form = BookingForm(initial=initial)
    context = {'form': form, 'car': car}
    return render(request, 'rental/booking.html', context)


@customer_required
@require_http_methods(["GET", "POST"])
def payment_view(request, booking_id):
    """Payment page - Credit Card, Debit Card, Online/UPI (simulation)."""
    booking = get_object_or_404(Booking, booking_id=booking_id)
    customer = get_customer(request)
    if booking.customer_id != customer.customer_id:
        messages.error(request, 'Invalid booking.')
        return redirect('rental:dashboard')
    if booking.payment_status == 'Paid':
        messages.info(request, 'This booking is already paid.')
        return redirect('rental:receipt', booking_id=booking_id)

    if request.method == 'POST':
        form = PaymentForm(request.POST)
        if form.is_valid():
            method = form.cleaned_data['method']
            Payment.objects.create(
                booking=booking,
                amount=booking.total_amount,
                method=method,
            )
            booking.payment_status = 'Paid'
            booking.save(update_fields=['payment_status'])
            if 'pending_booking_id' in request.session:
                del request.session['pending_booking_id']
            # Notify (console email if configured)
            try:
                from django.core.mail import send_mail
                send_mail(
                    'Booking Payment Confirmed',
                    f'Your payment of {booking.total_amount} for Booking #{booking.booking_id} has been received.',
                    settings.DEFAULT_FROM_EMAIL,
                    [customer.email],
                    fail_silently=True,
                )
            except Exception:
                pass
            messages.success(request, 'Payment successful!')
            return redirect('rental:receipt', booking_id=booking_id)
        messages.error(request, 'Please correct the payment details.')
    else:
        form = PaymentForm()
    return render(request, 'rental/payment.html', {'form': form, 'booking': booking})


@customer_required
def receipt(request, booking_id):
    """Receipt page - on-screen and PDF download."""
    booking = get_object_or_404(Booking, booking_id=booking_id)
    customer = get_customer(request)
    if booking.customer_id != customer.customer_id:
        messages.error(request, 'Invalid booking.')
        return redirect('rental:dashboard')
    payment = Payment.objects.filter(booking=booking).first()
    context = {'booking': booking, 'customer': customer, 'payment': payment}
    return render(request, 'rental/receipt.html', context)


@customer_required
def receipt_pdf(request, booking_id):
    """Generate PDF receipt."""
    from django.http import HttpResponse
    from reportlab.lib.pagesizes import A4
    from reportlab.pdfgen import canvas
    from reportlab.lib.units import inch
    import io

    booking = get_object_or_404(Booking, booking_id=booking_id)
    customer = get_customer(request)
    if booking.customer_id != customer.customer_id:
        return redirect('rental:dashboard')
    payment = Payment.objects.filter(booking=booking).first()

    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    y = height - 50
    p.setFont("Helvetica-Bold", 16)
    p.drawString(50, y, "My Car - Booking Receipt")
    y -= 30
    p.setFont("Helvetica", 10)
    p.drawString(50, y, f"Booking ID: {booking.booking_id}")
    y -= 20
    p.drawString(50, y, f"Customer: {customer.name} | Email: {customer.email}")
    y -= 20
    p.drawString(50, y, f"Car: {booking.car.brand} {booking.car.model} ({booking.car.reg_no})")
    y -= 20
    p.drawString(50, y, f"Period: {booking.start_date} to {booking.end_date}")
    y -= 20
    p.drawString(50, y, f"Total Amount: {booking.total_amount}")
    if payment:
        p.drawString(50, y - 20, f"Payment: {payment.method} on {payment.payment_date}")
    p.showPage()
    p.save()
    buffer.seek(0)
    response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="receipt_booking_{booking_id}.pdf"'
    return response


@customer_required
def dashboard(request):
    """Customer dashboard - booking history, profile link."""
    customer = get_customer(request)
    bookings = Booking.objects.filter(customer=customer, is_cancelled=False).select_related('car').order_by('-created_at')[:20]
    context = {'customer': customer, 'bookings': bookings}
    return render(request, 'rental/dashboard.html', context)


@customer_required
def profile(request):
    """Profile management - view and edit (simplified edit)."""
    customer = get_customer(request)
    if request.method == 'POST':
        customer.name = request.POST.get('name', customer.name)
        customer.address = request.POST.get('address', customer.address)
        customer.phone_no = request.POST.get('phone_no', customer.phone_no)
        customer.save()
        messages.success(request, 'Profile updated.')
        return redirect('rental:profile')
    return render(request, 'rental/profile.html', {'customer': customer})


@customer_required
def booking_cancel(request, booking_id):
    """Cancel booking with refund logic (full refund if before start)."""
    booking = get_object_or_404(Booking, booking_id=booking_id)
    customer = get_customer(request)
    if booking.customer_id != customer.customer_id:
        messages.error(request, 'Invalid booking.')
        return redirect('rental:dashboard')
    if booking.is_cancelled:
        messages.info(request, 'Booking was already cancelled.')
        return redirect('rental:dashboard')
    from django.utils import timezone
    today = timezone.now().date()
    refund = Decimal('0')
    if today < booking.start_date:
        refund = booking.total_amount  # Full refund
    elif booking.payment_status == 'Paid':
        # Partial: e.g. 50% if within 2 days of start
        days_before = (booking.start_date - today).days
        if days_before >= 2:
            refund = booking.total_amount * Decimal('0.5')
    booking.is_cancelled = True
    booking.cancelled_at = timezone.now()
    booking.refund_amount = refund
    booking.save(update_fields=['is_cancelled', 'cancelled_at', 'refund_amount'])
    messages.success(request, f'Booking cancelled. Refund: {refund}.')
    return redirect('rental:dashboard')


def tracking(request, booking_id):
    """Real-time vehicle tracking using Google Maps."""
    booking = get_object_or_404(Booking, booking_id=booking_id)
    customer = get_customer(request)
    if not customer or booking.customer_id != customer.customer_id:
        messages.warning(request, 'Please log in to view tracking.')
        return redirect('rental:login')
    car = booking.car
    context = {
        'booking': booking,
        'car': car,
        'google_maps_key': getattr(settings, 'GOOGLE_MAPS_API_KEY', ''),
    }
    return render(request, 'rental/tracking.html', context)
