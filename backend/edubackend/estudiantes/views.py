from django.shortcuts import render
from django.db.models import Count, Q
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Encargado, Estudiante, HistorialAccion
from .serializers import EncargadoSerializer, EstudianteSerializer, HistorialAccionSerializer
from comunicaciones.models import Correo


def registrar_accion(usuario, tipo_accion, descripcion, detalles=''):
    """
    Helper para registrar acciones en el historial
    """
    HistorialAccion.objects.create(
        usuario=usuario,
        tipo_accion=tipo_accion,
        descripcion=descripcion,
        detalles=detalles
    )


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

        # Registrar acción
        registrar_accion(
            usuario='Sistema',
            tipo_accion='eliminar_encargado',
            descripcion=f'Eliminó encargado: {instance.nombre}',
            detalles=f'Correo: {instance.correo}'
        )
        
        # Hard delete
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class EstudianteViewSet(viewsets.ModelViewSet):
    queryset = Estudiante.objects.all()
    serializer_class = EstudianteSerializer

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        if response.status_code == status.HTTP_201_CREATED:
            nombre_estudiante = response.data.get('nombre', 'Desconocido')
            registrar_accion(
                usuario='Sistema',
                tipo_accion='crear_estudiante',
                descripcion=f'Creó estudiante: {nombre_estudiante}',
                detalles=f'Cédula: {response.data.get("cedula", "N/A")}'
            )
        return response

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        if response.status_code == status.HTTP_200_OK:
            nombre_estudiante = response.data.get('nombre', 'Desconocido')
            registrar_accion(
                usuario='Sistema',
                tipo_accion='editar_estudiante',
                descripcion=f'Editó estudiante: {nombre_estudiante}',
                detalles=f'Cédula: {response.data.get("cedula", "N/A")}'
            )
        return response

    def destroy(self, request, *args, **kwargs):
        """
        Hard delete del estudiante.
        Si el encargado no tiene más estudiantes, también se elimina.
        """
        instance: Estudiante = self.get_object()
        encargado = instance.id_encargado
        
        # Registrar acción antes de eliminar
        registrar_accion(
            usuario='Sistema',
            tipo_accion='eliminar_estudiante',
            descripcion=f'Eliminó estudiante: {instance.nombre}',
            detalles=f'Cédula: {instance.cedula}, Grado: {instance.grado}'
        )

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

    @action(detail=False, methods=['get'])
    def historial(self, request):
        """
        Obtiene las últimas 20 acciones del historial
        """
        acciones = HistorialAccion.objects.all()[:20]
        serializer = HistorialAccionSerializer(acciones, many=True)
        return Response(serializer.data)

# Create your views here.
