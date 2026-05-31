from datetime import date
from django.db.models import Q
from django.db import transaction
from django.http import HttpResponse
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Activo, Prestamo
from .serializers import ActivoSerializer, PrestamoSerializer
from .plantilla_generator import generar_plantilla_excel, generar_plantilla_info


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

    @action(detail=False, methods=['post'], url_path='upload-bulk')
    def upload_bulk(self, request):
        """
        Recibe una lista de activos (en JSON) y los crea.
        Maneja transacciones y devuelve resumen de errores por fila.
        """
        data = request.data
        if not isinstance(data, list):
            return Response(
                {"error": "Se esperaba una lista de objetos activo."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        created_count = 0
        errors = []

        with transaction.atomic():
            for index, item in enumerate(data):
                try:
                    # Validar campos obligatorios
                    nombre = str(item.get('nombre', '')).strip()
                    tipo = str(item.get('tipo', '')).strip().lower()
                    estado = str(item.get('estado', 'disponible')).strip().lower()
                    identificador = str(item.get('identificador', '')).strip()  # Opcional

                    if not nombre or len(nombre) < 3:
                        errors.append(f"Fila {index + 1}: El nombre es requerido (mínimo 3 caracteres).")
                        continue

                    if not tipo or tipo not in ['computadora', 'tablet', 'libro', 'proyector', 'otro']:
                        errors.append(f"Fila {index + 1}: Tipo inválido '{tipo}'. Debe ser: computadora, tablet, libro, proyector, otro")
                        continue

                    if estado not in ['disponible', 'prestado', 'en_mantenimiento']:
                        errors.append(f"Fila {index + 1}: Estado inválido '{estado}'. Debe ser: disponible, prestado, en_mantenimiento")
                        continue

                    # Crear el activo con identificador opcional
                    Activo.objects.create(
                        nombre=nombre,
                        tipo=tipo,
                        estado=estado,
                        identificador=identificador if identificador else None
                    )
                    created_count += 1

                except Exception as e:
                    errors.append(f"Fila {index + 1}: Error: {str(e)}")
        
        return Response({
            "success": True,
            "creados": created_count,
            "errores": errors,
            "total_procesados": created_count
        }, status=status.HTTP_200_OK if not errors else status.HTTP_207_MULTI_STATUS)

    @action(detail=False, methods=['get'], url_path='descargar-plantilla')
    def descargar_plantilla(self, request):
        """
        Descarga la plantilla Excel profesional para importar activos
        Incluye los tipos de activos existentes dinámicamente
        """
        # Obtener tipos únicos de activos que existen en la BD
        tipos_existentes = Activo.objects.values_list('tipo', flat=True).distinct()
        tipos_list = sorted(list(set(tipos_existentes)))
        
        # Si no hay tipos en la BD, usar los tipos por defecto
        if not tipos_list:
            tipos_list = ['computadora', 'tablet', 'libro', 'proyector', 'otro']
        
        # Generar plantilla con los tipos dinámicos
        plantilla_excel = generar_plantilla_excel(tipos_activos=tipos_list)
        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename="Plantilla_Activos_EduCRM.xlsx"'
        response.write(plantilla_excel)
        return response

    @action(detail=False, methods=['get'], url_path='info-plantilla')
    def info_plantilla(self, request):
        """
        Retorna información sobre la plantilla de importación
        """
        info = generar_plantilla_info()
        return Response(info, status=status.HTTP_200_OK)


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
