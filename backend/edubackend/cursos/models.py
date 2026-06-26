from django.db import models
from profesores.models import Profesor


class Curso(models.Model):
    ESTADO_CHOICES = [
        ('activo', 'Activo'),
        ('inactivo', 'Inactivo'),
    ]

    id_curso = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=150)
    nivel_grado = models.CharField(max_length=20)
    horario = models.CharField(max_length=100)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='activo')
    id_profesor = models.ForeignKey(Profesor, on_delete=models.PROTECT, related_name='cursos')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['nombre']
        verbose_name = 'Curso'
        verbose_name_plural = 'Cursos'

    def __str__(self):
        return self.nombre


class EstudianteCurso(models.Model):
    id_estudiante = models.ForeignKey(
        'estudiantes.Estudiante',
        on_delete=models.CASCADE,
        related_name='cursos_inscritos',
    )
    id_curso = models.ForeignKey(
        Curso,
        on_delete=models.CASCADE,
        related_name='estudiantes_inscritos',
    )
    nota = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    fecha_inscripcion = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('id_estudiante', 'id_curso')
        verbose_name = 'Estudiante en Curso'
        verbose_name_plural = 'Estudiantes en Cursos'

    def __str__(self):
        return f"{self.id_estudiante.nombre} — {self.id_curso.nombre}"
