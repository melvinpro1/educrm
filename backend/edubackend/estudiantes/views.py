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

    def get_queryset(self):
        # solo activos por defecto
        return Encargado.objects.filter(estado=True)

    '''def destroy(self, request, *args, **kwargs):
        # soft delete del encargado
        instance = self.get_object()
        instance.estado = False
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)'''
    
    def destroy(self, request, *args, **kwargs):
        """
        Soft delete del encargado SOLO si no tiene estudiantes activos.
        """
        instance: Encargado = self.get_object()

        # asumiendo related_name='estudiantes' en Estudiante.id_encargado
        tiene_estudiantes_activos = instance.estudiantes.filter(estado=True).exists()

        if tiene_estudiantes_activos:
            return Response(
                {
                    "detail": "No se puede desactivar este encargado porque aún tiene estudiantes activos."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # si no tiene estudiantes activos, lo desactivamos
        instance.estado = False
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class EstudianteViewSet(viewsets.ModelViewSet):
    queryset = Estudiante.objects.all()
    serializer_class = EstudianteSerializer

    def get_queryset(self):
        # solo activos por defecto
        return Estudiante.objects.filter(estado=True)

    def destroy(self, request, *args, **kwargs):
        # soft delete del estudiante
        instance: Estudiante = self.get_object()
        encargado = instance.id_encargado

        # desactivar estudiante
        instance.estado = False
        instance.save()

        # revisar si ese encargado tiene otros estudiantes activos
        tiene_otro_estudiante_activo = encargado.estudiantes.filter(estado=True).exists()

        if not tiene_otro_estudiante_activo:
            # si no tiene, desactivamos también al encargado
            encargado.estado = False
            encargado.save()

        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'], url_path='dashboard-stats')
    def dashboard_stats(self, request):
        """
        Endpoint para obtener estadísticas del dashboard
        """
        # Contar estudiantes activos e inactivos
        estudiantes_activos = Estudiante.objects.filter(estado=True).count()
        estudiantes_totales = Estudiante.objects.count()
        
        # Contar encargados activos
        encargados_totales = Encargado.objects.filter(estado=True).count()
        
        # Contar correos enviados
        correos_enviados = Correo.objects.count()
        
        # Calcular correos totales (suma de todas las relaciones correo-estudiante)
        from comunicaciones.models import CorreoEstudiante
        correos_totales = CorreoEstudiante.objects.count()
        
        # Estudiantes por nivel (solo activos)
        estudiantes_por_nivel = (
            Estudiante.objects.filter(estado=True)
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
            'estudiantes_activos': estudiantes_activos,
            'estudiantes_totales': estudiantes_totales,
            'encargados_totales': encargados_totales,
            'comunicaciones_enviadas': correos_enviados,
            'correos_totales': correos_totales,
            'estudiantes_por_nivel': niveles_data,
        })

# Create your views here.
