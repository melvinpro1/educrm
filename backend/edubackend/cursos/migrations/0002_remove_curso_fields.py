# Generated migration to remove unnecessary fields from Curso model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cursos', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='curso',
            name='codigo',
        ),
        migrations.RemoveField(
            model_name='curso',
            name='descripcion',
        ),
        migrations.RemoveField(
            model_name='curso',
            name='seccion',
        ),
        migrations.RemoveField(
            model_name='curso',
            name='cantidad_cupos',
        ),
    ]
