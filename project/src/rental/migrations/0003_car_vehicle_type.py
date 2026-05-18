from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('rental', '0002_adminuser_email'),
    ]

    operations = [
        migrations.AddField(
            model_name='car',
            name='vehicle_type',
            field=models.CharField(
                choices=[('CNG', 'CNG'), ('Petrol', 'Petrol'), ('Diesel', 'Diesel'), ('Electric', 'Electric')],
                default='Petrol',
                max_length=20,
            ),
        ),
    ]
