from django.db import models
from django.utils import timezone

# Create your models here.

class Encargado(models.Model):
    id_encargado = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=150)
    correo = models.EmailField(max_length=150, unique=True)
    telefono = models.CharField(max_length=20)

    def __str__(self):
        return self.nombre


class Estudiante(models.Model):
    id_estudiante = models.AutoField(primary_key=True)
    cedula = models.CharField(max_length=20, unique=True)
    nombre = models.CharField(max_length=150)
    correo_institucional = models.EmailField(max_length=150)
    correo_personal = models.EmailField(max_length=150, blank=True, null=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    colegio_procedencia = models.CharField(max_length=200, blank=True, null=True)
    grado = models.CharField(max_length=50)
    direccion_domicilio = models.CharField(max_length=255, blank=True, null=True)

    # FK a Encargado
    id_encargado = models.ForeignKey(
        Encargado,
        on_delete=models.PROTECT,
        related_name='estudiantes'
    )

    def __str__(self):
        return self.nombre


class HistorialAccion(models.Model):
    """
    Modelo para registrar todas las acciones realizadas en el sistema
    """
    TIPO_ACCION_CHOICES = [
        ('crear_estudiante', 'Creó estudiante'),
        ('editar_estudiante', 'Editó estudiante'),
        ('eliminar_estudiante', 'Eliminó estudiante'),
        ('crear_encargado', 'Creó encargado'),
        ('editar_encargado', 'Editó encargado'),
        ('eliminar_encargado', 'Eliminó encargado'),
        ('enviar_comunicacion', 'Envió comunicación'),
        ('eliminar_comunicacion', 'Eliminó comunicación'),
    ]
    
    usuario = models.CharField(max_length=100)
    tipo_accion = models.CharField(max_length=50, choices=TIPO_ACCION_CHOICES)
    descripcion = models.CharField(max_length=255)
    detalles = models.TextField(blank=True, null=True)
    fecha_hora = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['-fecha_hora']
        verbose_name = 'Historial de Acción'
        verbose_name_plural = 'Historial de Acciones'
    
    def __str__(self):
        return f"{self.usuario} - {self.get_tipo_accion_display()} - {self.fecha_hora.strftime('%d/%m/%Y %H:%M')}"
