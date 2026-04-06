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
    serializer_class = EncargadoSerializer

    def get_queryset(self):
        estado = self.request.query_params.get('estado', 'activos')
        if estado == 'inactivos':
            return Encargado.objects.filter(activo=False).order_by('nombre')
        elif estado == 'todos':
            return Encargado.objects.all().order_by('nombre')
        else:
            return Encargado.objects.filter(activo=True).order_by('nombre')

    def destroy(self, request, *args, **kwargs):
        """Soft delete del encargado."""
        instance: Encargado = Encargado.objects.get(pk=kwargs['pk'])

        instance.activo = False
        instance.save()

        registrar_accion(
            usuario='Sistema',
            tipo_accion='eliminar_encargado',
            descripcion=f'Inactivó encargado: {instance.nombre}',
            detalles=f'Correo: {instance.correo}'
        )

        return Response(
            {'mensaje': 'Encargado inactivado correctamente.'},
            status=status.HTTP_200_OK
        )


class EstudianteViewSet(viewsets.ModelViewSet):
    serializer_class = EstudianteSerializer

    def get_queryset(self):
        estado = self.request.query_params.get('estado', 'activos')
        if estado == 'inactivos':
            return Estudiante.objects.filter(activo=False).order_by('nombre')
        elif estado == 'todos':
            return Estudiante.objects.all().order_by('nombre')
        else:
            return Estudiante.objects.filter(activo=True).order_by('nombre')

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
        instance = Estudiante.objects.get(pk=kwargs['pk'])
        response = super().update(request, *args, **kwargs)
        if response.status_code == status.HTTP_200_OK:
            nombre_estudiante = response.data.get('nombre', 'Desconocido')
            registrar_accion(
                usuario='Sistema',
                tipo_accion='editar_estudiante',
                descripcion=f'Editó estudiante: {nombre_estudiante}',
                detalles=f'Cédula: {response.data.get("cedula", "N/A")}'
            )
            # Si se reactivó el estudiante, reactivar también al encargado
            if response.data.get('activo') is True:
                encargado = instance.id_encargado
                if encargado and not encargado.activo:
                    encargado.activo = True
                    encargado.save()
        return response

    def destroy(self, request, *args, **kwargs):
        """
        Soft delete del estudiante.
        Si todos los estudiantes del encargado quedan inactivos, también se inactiva el encargado.
        """
        instance: Estudiante = Estudiante.objects.get(pk=kwargs['pk'])

        instance.activo = False
        instance.save()

        registrar_accion(
            usuario='Sistema',
            tipo_accion='eliminar_estudiante',
            descripcion=f'Inactivó estudiante: {instance.nombre}',
            detalles=f'Cédula: {instance.cedula}, Grado: {instance.grado}'
        )

        # Si todos los estudiantes del encargado están inactivos, inactivar encargado también
        encargado = instance.id_encargado
        if encargado and not encargado.estudiantes.filter(activo=True).exists():
            encargado.activo = False
            encargado.save()

        return Response(
            {'mensaje': 'Estudiante inactivado correctamente.'},
            status=status.HTTP_200_OK
        )

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
