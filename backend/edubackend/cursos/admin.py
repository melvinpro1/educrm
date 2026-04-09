from django.contrib import admin
from .models import Curso


@admin.register(Curso)
class CursoAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'nivel_grado', 'id_profesor', 'estado', 'año_lectivo']
    list_filter = ['estado', 'año_lectivo', 'nivel_grado']
    search_fields = ['nombre']
    ordering = ['nombre']
