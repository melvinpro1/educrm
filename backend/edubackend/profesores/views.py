from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Profesor
from .serializers import ProfesorSerializer


class ProfesorViewSet(viewsets.ModelViewSet):
    serializer_class = ProfesorSerializer

    def get_queryset(self):
        estado = self.request.query_params.get('estado', 'activos')

        if estado == 'inactivos':
            return Profesor.objects.filter(activo=False).order_by('nombre')
        elif estado == 'todos':
            return Profesor.objects.all().order_by('nombre')
        else:
            return Profesor.objects.filter(activo=True).order_by('nombre')

    def destroy(self, request, *args, **kwargs):
        profesor = self.get_object()

        if profesor.activo:
            profesor.activo = False
            profesor.save()
            return Response(
                {'mensaje': 'Profesor inactivado correctamente.'},
                status=status.HTTP_200_OK
            )

        profesor.delete()
        return Response(
            {'mensaje': 'Profesor eliminado permanentemente.'},
            status=status.HTTP_200_OK
        )