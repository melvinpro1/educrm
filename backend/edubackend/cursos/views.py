from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Curso, EstudianteCurso
from .serializers import CursoSerializer, EstudianteCursoSerializer


class CursoViewSet(viewsets.ModelViewSet):
    serializer_class = CursoSerializer

    def get_queryset(self):
        estado = self.request.query_params.get('estado', 'activos')
        queryset = Curso.objects.all()

        if estado == 'inactivos':
            queryset = queryset.filter(estado='inactivo')
        elif estado == 'todos':
            pass
        else:
            queryset = queryset.filter(estado='activo')

        return queryset.order_by('nombre')

    def destroy(self, request, *args, **kwargs):
        curso = self.get_object()
        if curso.estado == 'activo':
            curso.estado = 'inactivo'
            curso.save()
            return Response({'mensaje': 'Curso inactivado correctamente.'}, status=status.HTTP_200_OK)
        curso.delete()
        return Response({'mensaje': 'Curso eliminado permanentemente.'}, status=status.HTTP_200_OK)

    # GET  /api/cursos/<pk>/estudiantes/
    # POST /api/cursos/<pk>/estudiantes/  body: { estudiantes_ids: [1, 2, 3] }
    @action(detail=True, methods=['get', 'post'], url_path='estudiantes')
    def estudiantes(self, request, pk=None):
        curso = self.get_object()

        if request.method == 'GET':
            inscritos = curso.estudiantes_inscritos.select_related('id_estudiante').order_by(
                'id_estudiante__nombre'
            )
            return Response(EstudianteCursoSerializer(inscritos, many=True).data)

        # POST — agregar estudiantes
        ids = request.data.get('estudiantes_ids', [])
        if not ids:
            return Response({'detail': 'Debe enviar estudiantes_ids.'}, status=400)

        agregados = 0
        for est_id in ids:
            _, created = EstudianteCurso.objects.get_or_create(
                id_estudiante_id=est_id,
                id_curso=curso,
            )
            if created:
                agregados += 1

        return Response(
            {'detail': f'{agregados} estudiante(s) agregado(s).'},
            status=status.HTTP_201_CREATED,
        )

    # PATCH  /api/cursos/<pk>/estudiantes/<est_pk>/  body: { nota: 8.5 }
    # DELETE /api/cursos/<pk>/estudiantes/<est_pk>/
    @action(
        detail=True,
        methods=['patch', 'delete'],
        url_path=r'estudiantes/(?P<est_pk>[^/.]+)',
    )
    def estudiante_individual(self, request, pk=None, est_pk=None):
        curso = self.get_object()
        try:
            inscripcion = EstudianteCurso.objects.get(id_curso=curso, id_estudiante_id=est_pk)
        except EstudianteCurso.DoesNotExist:
            return Response({'detail': 'Estudiante no inscrito en este curso.'}, status=404)

        if request.method == 'DELETE':
            inscripcion.delete()
            return Response({'detail': 'Estudiante removido del curso.'})

        # PATCH — actualizar nota
        nota = request.data.get('nota')
        if nota is not None and nota != '':
            inscripcion.nota = nota
        else:
            inscripcion.nota = None
        inscripcion.save()
        return Response(EstudianteCursoSerializer(inscripcion).data)
