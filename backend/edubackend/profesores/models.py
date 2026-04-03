from django.db import models

class Profesor(models.Model):
    id_profesor = models.AutoField(primary_key=True)
    cedula = models.CharField(max_length=20, unique=True)
    nombre = models.CharField(max_length=150)
    correo = models.EmailField(max_length=150, unique=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre