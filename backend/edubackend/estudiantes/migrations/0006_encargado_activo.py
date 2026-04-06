from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('estudiantes', '0005_estudiante_activo'),
    ]

    operations = [
        migrations.AddField(
            model_name='encargado',
            name='activo',
            field=models.BooleanField(default=True),
        ),
    ]
