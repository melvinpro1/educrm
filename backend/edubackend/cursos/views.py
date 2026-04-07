from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Curso
from .serializers import CursoSerializer


class CursoViewSet(viewsets.ModelViewSet):
    serializer_class = CursoSerializer

    def get_queryset(self):
        estado = self.request.query_params.get('estado', 'activos')
        año = self.request.query_params.get('año')

        queryset = Curso.objects.all()

        if año:
            queryset = queryset.filter(año_lectivo=año)

        if estado == 'inactivos':
            queryset = queryset.filter(estado='inactivo')
        elif estado == 'todos':
            pass  # Retorna todos sin filtrar
        else:
            queryset = queryset.filter(estado='activo')

        return queryset.order_by('nombre', 'seccion')

    def destroy(self, request, *args, **kwargs):
        curso = self.get_object()

        if curso.estado == 'activo':
            curso.estado = 'inactivo'
            curso.save()
            return Response(
                {'mensaje': 'Curso inactivado correctamente.'},
                status=status.HTTP_200_OK
            )

        curso.delete()
        return Response(
            {'mensaje': 'Curso eliminado permanentemente.'},
            status=status.HTTP_200_OK
        )
