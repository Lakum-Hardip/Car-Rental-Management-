"""
WSGI config for Car Rental Management System.
"""
import os
import sys
from pathlib import Path
from django.core.wsgi import get_wsgi_application

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT_DIR / 'src'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'car_rental.settings')
application = get_wsgi_application()
