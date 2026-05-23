from django.db import models


class Activo(models.Model):
    TIPO_CHOICES = [
        ('computadora', 'Computadora'),
        ('tablet', 'Tablet'),
        ('libro', 'Libro'),
        ('proyector', 'Proyector'),
        ('otro', 'Otro'),
    ]
    ESTADO_CHOICES = [
        ('disponible', 'Disponible'),
        ('prestado', 'Prestado'),
        ('en_mantenimiento', 'En mantenimiento'),
    ]

    id_activo = models.AutoField(primary_key=True)
    tipo = models.CharField(max_length=50, choices=TIPO_CHOICES)
    nombre = models.CharField(max_length=200)
    estado = models.CharField(max_length=30, choices=ESTADO_CHOICES, default='disponible')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['nombre']
        verbose_name = 'Activo'
        verbose_name_plural = 'Activos'

    def __str__(self):
        return f"{self.nombre} ({self.tipo})"


class Prestamo(models.Model):
    ESTADO_PRESTAMO_CHOICES = [
        ('activo', 'Activo'),
        ('devuelto', 'Devuelto'),
    ]

    id_prestamo = models.AutoField(primary_key=True)
    id_activo = models.ForeignKey(
        Activo,
        on_delete=models.PROTECT,
        related_name='prestamos'
    )
    id_estudiante = models.ForeignKey(
        'estudiantes.Estudiante',
        on_delete=models.PROTECT,
        related_name='prestamos'
    )
    fecha_prestamo = models.DateField()
    fecha_retorno_esperada = models.DateField()
    fecha_retorno_real = models.DateField(null=True, blank=True)
    estado_prestamo = models.CharField(
        max_length=20,
        choices=ESTADO_PRESTAMO_CHOICES,
        default='activo'
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-fecha_prestamo']
        verbose_name = 'Préstamo'
        verbose_name_plural = 'Préstamos'

    def __str__(self):
        return f"Préstamo de {self.id_activo} a {self.id_estudiante}"
