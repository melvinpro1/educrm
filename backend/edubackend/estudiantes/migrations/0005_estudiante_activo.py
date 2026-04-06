from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('estudiantes', '0004_historialaccion'),
    ]

    operations = [
        migrations.AddField(
            model_name='estudiante',
            name='activo',
            field=models.BooleanField(default=True),
        ),
    ]
