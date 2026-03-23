from django.contrib import admin
from .models import Correo, CorreoEstudiante, Adjunto


class AdjuntoInline(admin.TabularInline):
    model = Adjunto
    extra = 1


class CorreoAdmin(admin.ModelAdmin):
    list_display = ['id_correo', 'asunto', 'fecha_envio', 'id_usuario']
    list_filter = ['fecha_envio', 'tipo_correo']
    search_fields = ['asunto', 'contenido']
    inlines = [AdjuntoInline]


admin.site.register(Correo, CorreoAdmin)
admin.site.register(Adjunto)
