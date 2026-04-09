from django.db import models
from profesores.models import Profesor
from django.utils import timezone


class Curso(models.Model):
    ESTADO_CHOICES = [
        ('activo', 'Activo'),
        ('inactivo', 'Inactivo'),
    ]

    id_curso = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=150)
    nivel_grado = models.CharField(max_length=20)  # Ej: Cuarto, Quinto
    año_lectivo = models.IntegerField()  # Ej: 2026
    horario = models.CharField(max_length=100)  # Ej: Lunes 8:00-9:40
    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default='activo'
    )

    # Relación con Profesor
    id_profesor = models.ForeignKey(
        Profesor,
        on_delete=models.PROTECT,
        related_name='cursos'
    )

    # Campos administrativos
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['nombre']
        verbose_name = 'Curso'
        verbose_name_plural = 'Cursos'

    def __str__(self):
        return f"{self.nombre} ({self.año_lectivo})"
