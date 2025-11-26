from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


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
    
    usuario = models.CharField(max_length=100)  # Nombre del usuario que realizó la acción
    tipo_accion = models.CharField(max_length=50, choices=TIPO_ACCION_CHOICES)
    descripcion = models.CharField(max_length=255)  # Descripción breve de la acción
    detalles = models.TextField(blank=True, null=True)  # Detalles adicionales (opcional)
    fecha_hora = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['-fecha_hora']  # Más recientes primero
        verbose_name = 'Historial de Acción'
        verbose_name_plural = 'Historial de Acciones'
    
    def __str__(self):
        return f"{self.usuario} - {self.get_tipo_accion_display()} - {self.fecha_hora.strftime('%d/%m/%Y %H:%M')}"
