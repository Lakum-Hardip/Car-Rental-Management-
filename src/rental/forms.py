"""
Car Rental Management System - Form definitions with validation.
"""
import re
from django import forms
from .models import Customer, Car, AdminUser, Booking, Payment, VehicleMaintenance
from django.core.exceptions import ValidationError
from datetime import date, timedelta


class CustomerRegistrationForm(forms.ModelForm):
    """Customer registration with password confirmation and full validation."""
    password_confirm = forms.CharField(
        widget=forms.PasswordInput(attrs={'autocomplete': 'new-password'}),
        label='Confirm Password',
        min_length=8,
        max_length=128,
    )

    class Meta:
        model = Customer
        fields = ('name', 'address', 'phone_no', 'email', 'license_no', 'password')
        widgets = {
            'name': forms.TextInput(attrs={'minlength': '2', 'maxlength': '255', 'pattern': "[A-Za-z\\s\\.\\-' ]+", 'title': 'Only letters, spaces, dots, hyphens and apostrophes'}),
            'address': forms.Textarea(attrs={'rows': 3, 'maxlength': '500'}),
            'phone_no': forms.TextInput(attrs={'pattern': '^[0-9]{10,15}$', 'title': '10-15 digits only'}),
            'email': forms.EmailInput(attrs={'required': True}),
            'license_no': forms.TextInput(attrs={'minlength': '5', 'maxlength': '50', 'pattern': '[A-Za-z0-9\\-\\s]+'}),
            'password': forms.PasswordInput(attrs={'minlength': '8', 'autocomplete': 'new-password'}),
        }

    def clean_name(self):
        name = self.cleaned_data.get('name', '').strip()
        if len(name) < 2:
            raise ValidationError('Name must be at least 2 characters.')
        if not re.match(r"^[A-Za-z\s\.\-']+$", name):
            raise ValidationError('Name can only contain letters, spaces, dots, hyphens and apostrophes.')
        return name

    def clean_phone_no(self):
        phone = self.cleaned_data.get('phone_no', '').strip()
        if not re.match(r'^[0-9]{10,15}$', phone):
            raise ValidationError('Phone must be 10-15 digits only.')
        return phone

    def clean_email(self):
        email = (self.cleaned_data.get('email') or '').strip().lower()
        if not email:
            raise ValidationError('Email is required.')
        if Customer.objects.filter(email=email).exists():
            raise ValidationError('A customer with this email already exists.')
        return email

    def clean_license_no(self):
        license_no = (self.cleaned_data.get('license_no') or '').strip()
        if len(license_no) < 5:
            raise ValidationError('License number must be at least 5 characters.')
        if not re.match(r'^[A-Za-z0-9\-\s]+$', license_no):
            raise ValidationError('License number can only contain letters, numbers, hyphens and spaces.')
        return license_no

    def clean_password(self):
        password = self.cleaned_data.get('password') or ''
        if len(password) < 8:
            raise ValidationError('Password must be at least 8 characters.')
        if not re.search(r'[A-Z]', password):
            raise ValidationError('Password must contain at least one uppercase letter.')
        if not re.search(r'[a-z]', password):
            raise ValidationError('Password must contain at least one lowercase letter.')
        if not re.search(r'[0-9]', password):
            raise ValidationError('Password must contain at least one digit.')
        return password

    def clean(self):
        data = super().clean()
        password = data.get('password')
        password_confirm = data.get('password_confirm')
        if password and password_confirm and password != password_confirm:
            raise ValidationError({'password_confirm': 'Passwords do not match.'})
        return data

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data['password'])
        if commit:
            user.save()
        return user


class CustomerLoginForm(forms.Form):
    """Customer login form with validation."""
    email = forms.EmailField(
        widget=forms.EmailInput(attrs={'required': True}),
        max_length=254,
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'required': True}),
        strip=False,
    )

    def clean_email(self):
        email = (self.cleaned_data.get('email') or '').strip().lower()
        if not email:
            raise ValidationError('Email is required.')
        return email

    def clean_password(self):
        password = self.cleaned_data.get('password') or ''
        if not password.strip():
            raise ValidationError('Password is required.')
        return password


class AdminLoginForm(forms.Form):
    """Admin login form with validation."""
    username = forms.CharField(
        max_length=100,
        widget=forms.TextInput(attrs={'required': True}),
        strip=True,
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'required': True}),
        strip=False,
    )

    def clean_username(self):
        username = (self.cleaned_data.get('username') or '').strip()
        if not username:
            raise ValidationError('Username is required.')
        if len(username) < 2:
            raise ValidationError('Username must be at least 2 characters.')
        return username

    def clean_password(self):
        password = self.cleaned_data.get('password') or ''
        if not password.strip():
            raise ValidationError('Password is required.')
        return password


class PasswordResetRequestForm(forms.Form):
    """Password reset request (by email)."""
    email = forms.EmailField(max_length=254)

    def clean_email(self):
        email = (self.cleaned_data.get('email') or '').strip().lower()
        if not email:
            raise ValidationError('Email is required.')
        return email


class PasswordResetConfirmForm(forms.Form):
    """Set a new password."""
    new_password = forms.CharField(
        widget=forms.PasswordInput(attrs={'autocomplete': 'new-password'}),
        min_length=8,
        max_length=128,
        strip=False,
        label='New password',
    )
    confirm_password = forms.CharField(
        widget=forms.PasswordInput(attrs={'autocomplete': 'new-password'}),
        min_length=8,
        max_length=128,
        strip=False,
        label='Confirm password',
    )

    def clean_new_password(self):
        password = self.cleaned_data.get('new_password') or ''
        if len(password) < 8:
            raise ValidationError('Password must be at least 8 characters.')
        if not re.search(r'[A-Z]', password):
            raise ValidationError('Password must contain at least one uppercase letter.')
        if not re.search(r'[a-z]', password):
            raise ValidationError('Password must contain at least one lowercase letter.')
        if not re.search(r'[0-9]', password):
            raise ValidationError('Password must contain at least one digit.')
        return password

    def clean(self):
        data = super().clean()
        p1 = data.get('new_password')
        p2 = data.get('confirm_password')
        if p1 and p2 and p1 != p2:
            raise ValidationError({'confirm_password': 'Passwords do not match.'})
        return data


class CarForm(forms.ModelForm):
    """Add/Edit vehicle (Admin)."""
    class Meta:
        model = Car
        fields = (
            'model', 'brand', 'reg_no', 'vehicle_type', 'capacity',
            'rent_per_day', 'status', 'image', 'latitude', 'longitude'
        )
        widgets = {
            'latitude': forms.NumberInput(attrs={'step': 'any'}),
            'longitude': forms.NumberInput(attrs={'step': 'any'}),
        }

    def clean_reg_no(self):
        reg = self.cleaned_data.get('reg_no')
        qs = Car.objects.filter(reg_no=reg)
        if self.instance and self.instance.pk:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise ValidationError('A car with this registration number already exists.')
        return reg


class BookingForm(forms.ModelForm):
    """Booking form - start_date, end_date, contract acceptance."""
    accept_contract = forms.BooleanField(required=True, label='I accept the rental agreement terms')

    MAX_ADVANCE_DAYS = 10  # next 10 days (inclusive)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Limit what the browser calendar shows (extra protection; server-side checks are still enforced in clean()).
        today = date.today()
        max_date = today + timedelta(days=self.MAX_ADVANCE_DAYS - 1)
        start_widget = self.fields['start_date'].widget
        end_widget = self.fields['end_date'].widget
        start_widget.attrs.update({'min': today.isoformat(), 'max': max_date.isoformat()})
        end_widget.attrs.update({'min': today.isoformat(), 'max': max_date.isoformat()})

    class Meta:
        model = Booking
        fields = ('start_date', 'end_date')
        widgets = {
            'start_date': forms.DateInput(attrs={'type': 'date'}),
            'end_date': forms.DateInput(attrs={'type': 'date'}),
        }

    def clean(self):
        data = super().clean()
        start = data.get('start_date')
        end = data.get('end_date')
        today = date.today()
        max_start = today + timedelta(days=self.MAX_ADVANCE_DAYS - 1)
        if start and start < today:
            raise ValidationError({'start_date': 'Start date cannot be in the past.'})
        if start and start > max_start:
            raise ValidationError({
                'start_date': f'Start date must be within the next {self.MAX_ADVANCE_DAYS} days.'
            })
        if start and end:
            if end < start:
                raise ValidationError({'end_date': 'End date must be on or after start date.'})
            if end > max_start:
                raise ValidationError({
                    'end_date': f'End date must be within the next {self.MAX_ADVANCE_DAYS} days.'
                })
            max_days = 90
            if (end - start).days > max_days:
                raise ValidationError({'end_date': f'Maximum rental period is {max_days} days.'})
        return data


class PaymentForm(forms.Form):
    """Payment method selection (simulation)."""
    METHOD_CHOICES = [
        ('Card', 'Credit / Debit Card'),
        ('Online', 'Online Wallet / UPI'),
        ('Cash', 'Cash (at pickup)'),
    ]
    method = forms.ChoiceField(choices=METHOD_CHOICES, widget=forms.RadioSelect)
    # Simulated card/UPI details (not stored as real)
    card_last_four = forms.CharField(max_length=4, required=False, label='Last 4 digits (simulation)')
    transaction_id = forms.CharField(max_length=50, required=False, label='Transaction ID (simulation)')


class MaintenanceForm(forms.ModelForm):
    """Vehicle maintenance scheduler with date validation."""
    class Meta:
        model = VehicleMaintenance
        fields = ('car', 'scheduled_date', 'description', 'cost', 'status')
        widgets = {
            'scheduled_date': forms.DateInput(attrs={'type': 'date'}),
            'description': forms.Textarea(attrs={'rows': 3, 'required': True}),
        }

    def clean_scheduled_date(self):
        d = self.cleaned_data.get('scheduled_date')
        if not d:
            raise ValidationError('Scheduled date is required.')
        today = date.today()
        min_date = today - timedelta(days=365)   # Allow up to 1 year past
        max_date = today + timedelta(days=730)   # Allow up to 2 years future
        if d < min_date:
            raise ValidationError('Scheduled date cannot be more than 1 year in the past.')
        if d > max_date:
            raise ValidationError('Scheduled date cannot be more than 2 years in the future.')
        return d

    def clean_description(self):
        desc = (self.cleaned_data.get('description') or '').strip()
        if len(desc) < 5:
            raise ValidationError('Description must be at least 5 characters.')
        return desc
