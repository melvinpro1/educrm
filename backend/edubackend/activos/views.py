from datetime import date
from django.db.models import Q
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Activo, Prestamo
from .serializers import ActivoSerializer, PrestamoSerializer


class ActivoViewSet(viewsets.ModelViewSet):
    serializer_class = ActivoSerializer

    def get_queryset(self):
        queryset = Activo.objects.prefetch_related('prestamos__id_estudiante').all()
        busqueda = self.request.query_params.get('busqueda', '').strip()
        estado = self.request.query_params.get('estado', '').strip()
        tipo = self.request.query_params.get('tipo', '').strip()

        if busqueda:
            queryset = queryset.filter(
                Q(nombre__icontains=busqueda) | Q(tipo__icontains=busqueda)
            )
        if estado:
            queryset = queryset.filter(estado=estado)
        if tipo:
            queryset = queryset.filter(tipo=tipo)

        return queryset.order_by('nombre')

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        if response.status_code == status.HTTP_200_OK:
            response.data['mensaje'] = 'Activo actualizado exitosamente.'
        return response

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        activo = self.get_object()
        if activo.prestamos.filter(estado_prestamo='activo').exists():
            return Response(
                {'detail': 'Este activo tiene un préstamo activo. Registre la devolución antes de eliminarlo.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        activo.delete()
        return Response(
            {'mensaje': 'Activo eliminado exitosamente.'},
            status=status.HTTP_200_OK
        )


class PrestamoViewSet(viewsets.ModelViewSet):
    serializer_class = PrestamoSerializer
    http_method_names = ['get', 'post', 'patch', 'head', 'options']

    def get_queryset(self):
        queryset = Prestamo.objects.select_related('id_activo', 'id_estudiante').all()
        activo_id = self.request.query_params.get('activo', '').strip()
        estudiante_id = self.request.query_params.get('estudiante', '').strip()
        estado = self.request.query_params.get('estado', '').strip()

        if activo_id:
            queryset = queryset.filter(id_activo=activo_id)
        if estudiante_id:
            queryset = queryset.filter(id_estudiante=estudiante_id)
        if estado:
            queryset = queryset.filter(estado_prestamo=estado)

        return queryset.order_by('-fecha_prestamo')

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        if response.status_code == status.HTTP_201_CREATED:
            response.data['mensaje'] = 'Préstamo registrado exitosamente.'
        return response

    @action(detail=True, methods=['patch'], url_path='devolver')
    def devolver(self, request, pk=None):
        prestamo = self.get_object()
        if prestamo.estado_prestamo == 'devuelto':
            return Response(
                {'detail': 'Este préstamo ya fue registrado como devuelto.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        prestamo.estado_prestamo = 'devuelto'
        prestamo.fecha_retorno_real = request.data.get('fecha_retorno_real') or date.today().isoformat()
        prestamo.save()

        activo = prestamo.id_activo
        activo.estado = 'disponible'
        activo.save()

        serializer = self.get_serializer(prestamo)
        data = dict(serializer.data)
        data['mensaje'] = 'Devolución registrada exitosamente.'
        return Response(data, status=status.HTTP_200_OK)
