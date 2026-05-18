from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("rental", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="adminuser",
            name="email",
            field=models.EmailField(blank=True, max_length=254, null=True, unique=True),
        ),
    ]

