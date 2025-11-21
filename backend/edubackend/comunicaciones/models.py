from django.db import models

# Create your models here.

from django.utils import timezone


class Correo(models.Model):
    id_correo = models.AutoField(primary_key=True)

    asunto = models.CharField(max_length=150)
    contenido = models.TextField()  # NVARCHAR(MAX)
    fecha_envio = models.DateTimeField(default=timezone.now)
    tipo_correo = models.CharField(max_length=50, null=True, blank=True)

    # FK al usuario (profesor/director/administrativo)
    id_usuario = models.ForeignKey(
        'auth.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='correos_enviados'
    )

    
    # Relación N:M con estudiantes mediante la tabla intermedia
    estudiantes = models.ManyToManyField(
        'estudiantes.Estudiante',        # <– app.modelo
        through='CorreoEstudiante',
        related_name='correos'
    )

    def __str__(self):
        return f"{self.asunto} - {self.fecha_envio.date()}"


class CorreoEstudiante(models.Model):
    id_correo = models.ForeignKey(
        'Correo',
        on_delete=models.CASCADE,
        db_column='id_correo',
        related_name='correo_estudiante'
    )

    id_estudiante = models.ForeignKey(
        'estudiantes.Estudiante',        # <– app.modelo
        on_delete=models.CASCADE,
        db_column='id_estudiante',
        related_name='correo_estudiante'
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['id_correo', 'id_estudiante'],
                name='pk_correo_estudiante'
            )
        ]

    def __str__(self):
        return f"Correo {self.id_correo_id} → Estudiante {self.id_estudiante_id}"
