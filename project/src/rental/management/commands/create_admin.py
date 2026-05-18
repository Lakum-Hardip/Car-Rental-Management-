"""
Management command: Create an admin user (Manager/Staff) for the Car Rental System.
Usage: python manage.py create_admin --username admin --password admin123 --role Manager
"""
from django.core.management.base import BaseCommand
from rental.models import AdminUser


class Command(BaseCommand):
    help = 'Create an admin user for the Car Rental System (Manager or Staff).'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, required=True, help='Admin username')
        parser.add_argument('--password', type=str, required=True, help='Admin password')
        parser.add_argument('--role', type=str, default='Manager', choices=['Manager', 'Staff'], help='Role: Manager or Staff')
        parser.add_argument('--email', type=str, required=False, help='Admin email (optional, used for password reset)')

    def handle(self, *args, **options):
        username = options['username']
        password = options['password']
        role = options['role']
        email = (options.get('email') or '').strip().lower() or None
        if AdminUser.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING(f'Admin user "{username}" already exists.'))
            return
        if email and AdminUser.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING(f'Admin email "{email}" is already in use.'))
            return
        admin = AdminUser(username=username, role=role)
        if email:
            admin.email = email
        admin.set_password(password)
        admin.save()
        self.stdout.write(self.style.SUCCESS(f'Admin user "{username}" ({role}) created successfully.'))
