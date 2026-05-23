from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('estudiantes', '0006_encargado_activo'),
    ]

    operations = [
        migrations.CreateModel(
            name='Activo',
            fields=[
                ('id_activo', models.AutoField(primary_key=True, serialize=False)),
                ('tipo', models.CharField(
                    choices=[
                        ('computadora', 'Computadora'),
                        ('tablet', 'Tablet'),
                        ('libro', 'Libro'),
                        ('proyector', 'Proyector'),
                        ('otro', 'Otro'),
                    ],
                    max_length=50
                )),
                ('nombre', models.CharField(max_length=200)),
                ('estado', models.CharField(
                    choices=[
                        ('disponible', 'Disponible'),
                        ('prestado', 'Prestado'),
                        ('en_mantenimiento', 'En mantenimiento'),
                    ],
                    default='disponible',
                    max_length=30
                )),
                ('fecha_creacion', models.DateTimeField(auto_now_add=True)),
                ('fecha_actualizacion', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Activo',
                'verbose_name_plural': 'Activos',
                'ordering': ['nombre'],
            },
        ),
        migrations.CreateModel(
            name='Prestamo',
            fields=[
                ('id_prestamo', models.AutoField(primary_key=True, serialize=False)),
                ('id_activo', models.ForeignKey(
                    on_delete=django.db.models.deletion.PROTECT,
                    related_name='prestamos',
                    to='activos.activo'
                )),
                ('id_estudiante', models.ForeignKey(
                    on_delete=django.db.models.deletion.PROTECT,
                    related_name='prestamos',
                    to='estudiantes.estudiante'
                )),
                ('fecha_prestamo', models.DateField()),
                ('fecha_retorno_esperada', models.DateField()),
                ('fecha_retorno_real', models.DateField(blank=True, null=True)),
                ('estado_prestamo', models.CharField(
                    choices=[
                        ('activo', 'Activo'),
                        ('devuelto', 'Devuelto'),
                    ],
                    default='activo',
                    max_length=20
                )),
                ('fecha_creacion', models.DateTimeField(auto_now_add=True)),
                ('fecha_actualizacion', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Préstamo',
                'verbose_name_plural': 'Préstamos',
                'ordering': ['-fecha_prestamo'],
            },
        ),
    ]
