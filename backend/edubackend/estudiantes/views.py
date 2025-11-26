from django.shortcuts import render
from django.db.models import Count, Q
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Encargado, Estudiante
from .serializers import EncargadoSerializer, EstudianteSerializer
from comunicaciones.models import Correo


class EncargadoViewSet(viewsets.ModelViewSet):
    queryset = Encargado.objects.all()
    serializer_class = EncargadoSerializer

    def destroy(self, request, *args, **kwargs):
        """
        Hard delete del encargado SOLO si no tiene estudiantes activos.
        """
        instance: Encargado = self.get_object()

        # Verificar si tiene estudiantes asociados
        tiene_estudiantes = instance.estudiantes.exists()

        if tiene_estudiantes:
            return Response(
                {
                    "detail": "No se puede eliminar este encargado porque aún tiene estudiantes asociados."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Hard delete
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class EstudianteViewSet(viewsets.ModelViewSet):
    queryset = Estudiante.objects.all()
    serializer_class = EstudianteSerializer

    def destroy(self, request, *args, **kwargs):
        """
        Hard delete del estudiante.
        Si el encargado no tiene más estudiantes, también se elimina.
        """
        instance: Estudiante = self.get_object()
        encargado = instance.id_encargado

        # Eliminar estudiante (hard delete)
        instance.delete()

        # Revisar si ese encargado tiene otros estudiantes
        if encargado and not encargado.estudiantes.exists():
            # Si no tiene más estudiantes, eliminamos también al encargado
            encargado.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'], url_path='dashboard-stats')
    def dashboard_stats(self, request):
        """
        Endpoint para obtener estadísticas del dashboard
        """
        # Contar estudiantes totales
        estudiantes_totales = Estudiante.objects.count()
        
        # Contar encargados totales
        encargados_totales = Encargado.objects.count()
        
        # Contar correos enviados
        correos_enviados = Correo.objects.count()
        
        # Calcular correos totales (suma de todas las relaciones correo-estudiante)
        from comunicaciones.models import CorreoEstudiante
        correos_totales = CorreoEstudiante.objects.count()
        
        # Estudiantes por nivel
        estudiantes_por_nivel = (
            Estudiante.objects.all()
            .values('grado')
            .annotate(cantidad=Count('id_estudiante'))
            .order_by('grado')
        )
        
        # Formatear datos para el frontend
        niveles_data = [
            {
                'nombre': item['grado'],
                'valor': item['cantidad']
            }
            for item in estudiantes_por_nivel
        ]
        
        return Response({
            'estudiantes_activos': estudiantes_totales,
            'estudiantes_totales': estudiantes_totales,
            'encargados_totales': encargados_totales,
            'comunicaciones_enviadas': correos_enviados,
            'correos_totales': correos_totales,
            'estudiantes_por_nivel': niveles_data,
        })

# Create your views here.
