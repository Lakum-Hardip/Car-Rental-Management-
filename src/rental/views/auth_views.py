"""
Authentication views: Registration, Customer Login, Admin Login.
Session-based authentication with password encryption.
"""
from django.shortcuts import render, redirect
from django.contrib import messages
from django.views.decorators.http import require_http_methods
from django.urls import reverse
from django.core.mail import send_mail
from django.core.signing import BadSignature, SignatureExpired, TimestampSigner
from django.conf import settings
from rental.forms import (
    CustomerRegistrationForm,
    CustomerLoginForm,
    AdminLoginForm,
    PasswordResetRequestForm,
    PasswordResetConfirmForm,
)
from rental.models import Customer, AdminUser

_reset_signer = TimestampSigner(salt='rental.password_reset')


def _build_reset_link(request, token: str) -> str:
    return request.build_absolute_uri(reverse('rental:password_reset_confirm', args=[token]))


def _send_reset_email(to_email: str, subject: str, reset_link: str):
    body = (
        "You requested a password reset.\n\n"
        f"Reset your password using this link:\n{reset_link}\n\n"
        "If you did not request this, you can ignore this email."
    )
    send_mail(
        subject,
        body,
        getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@example.com'),
        [to_email],
        fail_silently=True,
    )


@require_http_methods(["GET", "POST"])
def customer_password_reset_request(request):
    """Customer password reset request (email)."""
    if request.method == 'POST':
        form = PasswordResetRequestForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            customer = Customer.objects.filter(email=email).first()
            if customer:
                token = _reset_signer.sign(f"customer:{customer.customer_id}")
                _send_reset_email(
                    to_email=customer.email,
                    subject="My Car - Customer password reset",
                    reset_link=_build_reset_link(request, token),
                )
            messages.success(request, 'If this email exists, a reset link has been sent.')
            return redirect('rental:login')
        messages.error(request, 'Please correct the errors below.')
    else:
        form = PasswordResetRequestForm()
    return render(request, 'rental/password_reset_request.html', {
        'form': form,
        'panel': 'customer',
    })


@require_http_methods(["GET", "POST"])
def admin_password_reset_request(request):
    """Admin password reset request (email)."""
    if request.method == 'POST':
        form = PasswordResetRequestForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            admin_user = AdminUser.objects.filter(email=email).first()
            if admin_user and admin_user.email:
                token = _reset_signer.sign(f"admin:{admin_user.admin_id}")
                _send_reset_email(
                    to_email=admin_user.email,
                    subject="My Car - Admin password reset",
                    reset_link=_build_reset_link(request, token),
                )
            messages.success(request, 'If this email exists, a reset link has been sent.')
            return redirect('rental:admin_login')
        messages.error(request, 'Please correct the errors below.')
    else:
        form = PasswordResetRequestForm()
    return render(request, 'rental/password_reset_request.html', {
        'form': form,
        'panel': 'admin',
    })


@require_http_methods(["GET", "POST"])
def password_reset_confirm(request, token: str):
    """Password reset confirm (set new password)."""
    try:
        value = _reset_signer.unsign(token, max_age=60 * 60)  # 1 hour
        kind, ident = value.split(':', 1)
    except SignatureExpired:
        messages.error(request, 'Reset link expired. Please request a new one.')
        return redirect('rental:login')
    except (BadSignature, ValueError):
        messages.error(request, 'Invalid reset link. Please request a new one.')
        return redirect('rental:login')

    if kind == 'customer':
        user = Customer.objects.filter(customer_id=int(ident)).first()
        login_name = 'rental:login'
    elif kind == 'admin':
        user = AdminUser.objects.filter(admin_id=int(ident)).first()
        login_name = 'rental:admin_login'
    else:
        user = None
        login_name = 'rental:login'

    if not user:
        messages.error(request, 'Invalid reset link. Please request a new one.')
        return redirect(login_name)

    if request.method == 'POST':
        form = PasswordResetConfirmForm(request.POST)
        if form.is_valid():
            user.set_password(form.cleaned_data['new_password'])
            user.save()
            messages.success(request, 'Password updated. Please log in.')
            return redirect(login_name)
        messages.error(request, 'Please correct the errors below.')
    else:
        form = PasswordResetConfirmForm()

    return render(request, 'rental/password_reset_confirm.html', {
        'form': form,
        'kind': kind,
    })


@require_http_methods(["GET", "POST"])
def register(request):
    """User registration page - creates new customer with hashed password."""
    if request.method == 'POST':
        form = CustomerRegistrationForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Registration successful. Please log in.')
            return redirect('rental:login')
        messages.error(request, 'Please correct the errors below.')
    else:
        form = CustomerRegistrationForm()
    return render(request, 'rental/register.html', {'form': form})


@require_http_methods(["GET", "POST"])
def login(request):
    """Customer login page - session-based auth."""
    if request.method == 'POST':
        form = CustomerLoginForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']
            try:
                customer = Customer.objects.get(email=email)
                if customer.check_password(password):
                    request.session['customer_id'] = customer.customer_id
                    request.session['user_type'] = 'customer'
                    messages.success(request, f'Welcome back, {customer.name}!')
                    return redirect('rental:dashboard')
            except Customer.DoesNotExist:
                pass
            form.add_error(None, 'Invalid email or password.')
        if not form.is_valid():
            messages.error(request, 'Please correct the errors below.')
    else:
        form = CustomerLoginForm()
    return render(request, 'rental/login.html', {'form': form})


@require_http_methods(["GET", "POST"])
def admin_login(request):
    """Admin login page - Manager / Staff."""
    if request.method == 'POST':
        form = AdminLoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            try:
                admin_user = AdminUser.objects.get(username=username)
                if admin_user.check_password(password):
                    request.session['admin_id'] = admin_user.admin_id
                    request.session['user_type'] = 'admin'
                    request.session['admin_role'] = admin_user.role
                    messages.success(request, f'Welcome, {admin_user.username}.')
                    return redirect('rental:admin_dashboard')
            except AdminUser.DoesNotExist:
                pass
            form.add_error(None, 'Invalid username or password.')
        if not form.is_valid():
            messages.error(request, 'Please correct the errors below.')
    else:
        form = AdminLoginForm()
    return render(request, 'rental/admin_login.html', {'form': form})


def logout_view(request):
    """Logout - clear session for customer or admin."""
    request.session.flush()
    messages.success(request, 'You have been logged out.')
    return redirect('rental:home')
