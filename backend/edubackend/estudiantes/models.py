from django.db import models

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