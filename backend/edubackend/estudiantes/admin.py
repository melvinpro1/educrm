from django.contrib import admin
from .models import Encargado, Estudiante, HistorialAccion

# Register your models here.
admin.site.register(Encargado)
admin.site.register(Estudiante)


@admin.register(HistorialAccion)
class HistorialAccionAdmin(admin.ModelAdmin):
    list_display = ['usuario', 'tipo_accion', 'descripcion', 'fecha_hora']
    list_filter = ['tipo_accion', 'fecha_hora']
    search_fields = ['usuario', 'descripcion']
    readonly_fields = ['fecha_hora']
