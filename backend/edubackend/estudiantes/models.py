from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

ROLES = [
    ('admin', 'Administrador General'),
    ('director', 'Director'),
    ('administrador', 'Administrador'),
    ('profesor', 'Profesor'),
    ('encargado', 'Encargado'),
]

VISTAS_DISPONIBLES = [
    'home', 'estudiantes', 'encargados', 'profesores', 'cursos',
    'comunicaciones', 'activos', 'prestamos', 'usuarios', 'permisos',
    'notas',
]

PERMISOS_DEFAULT = {
    'admin': VISTAS_DISPONIBLES[:],
    'director': ['home', 'estudiantes', 'encargados', 'profesores', 'cursos', 'comunicaciones', 'activos', 'prestamos', 'usuarios'],
    'administrador': ['home', 'estudiantes', 'encargados', 'cursos', 'comunicaciones', 'activos', 'prestamos'],
    'profesor': ['home', 'cursos', 'comunicaciones'],
    'encargado': ['home', 'notas'],
}

# Create your models here.

class Encargado(models.Model):
    id_encargado = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=150)
    correo = models.EmailField(max_length=150, unique=True)
    telefono = models.CharField(max_length=20)
    activo = models.BooleanField(default=True)

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

    activo = models.BooleanField(default=True)

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


class PerfilUsuario(models.Model):
    usuario = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    rol = models.CharField(max_length=20, choices=ROLES, default='profesor')
    aprobado = models.BooleanField(default=False)
    aprobado_por = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='aprobaciones_dadas'
    )
    encargado_ref = models.ForeignKey(
        'Encargado', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='usuarios_vinculados',
    )
    fecha_aprobacion = models.DateTimeField(null=True, blank=True)
    fecha_registro = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name = 'Perfil de Usuario'
        verbose_name_plural = 'Perfiles de Usuarios'

    def __str__(self):
        estado = 'Aprobado' if self.aprobado else 'Pendiente'
        return f"{self.usuario.username} - {self.rol} - {estado}"


class PermisoRol(models.Model):
    rol = models.CharField(max_length=20, choices=ROLES)
    vista = models.CharField(max_length=50)
    puede_ver = models.BooleanField(default=False)

    class Meta:
        unique_together = ('rol', 'vista')
        verbose_name = 'Permiso por Rol'
        verbose_name_plural = 'Permisos por Rol'

    def __str__(self):
        return f"{self.rol} - {self.vista}: {'Sí' if self.puede_ver else 'No'}"
