from django.db import models
from django.utils import timezone


class Correo(models.Model):
    id_correo = models.AutoField(primary_key=True)

    asunto = models.CharField(max_length=150)
    contenido = models.TextField()  # NVARCHAR(MAX)
    fecha_envio = models.DateTimeField(default=timezone.now)
    tipo_correo = models.CharField(max_length=50, null=True, blank=True)
    segmento = models.CharField(max_length=20, null=True, blank=True)
    total_enviados = models.IntegerField(default=0)

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


class Adjunto(models.Model):
    id_adjunto = models.AutoField(primary_key=True)
    id_correo = models.ForeignKey(
        'Correo',
        on_delete=models.CASCADE,
        db_column='id_correo',
        related_name='adjuntos'
    )
    archivo = models.FileField(
        upload_to='comunicaciones/%Y/%m/%d/',
        help_text='Archivos permitidos: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, JPEG, GIF'
    )
    nombre_original = models.CharField(max_length=255)
    tipo_archivo = models.CharField(max_length=50)  # pdf, doc, docx, img, etc.
    fecha_subida = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.nombre_original} - Correo {self.id_correo_id}"

    class Meta:
        verbose_name = "Adjunto"
        verbose_name_plural = "Adjuntos"
