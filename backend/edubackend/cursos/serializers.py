from rest_framework import serializers
from .models import Curso
import re


def _limpiar_texto(valor):
    if valor is None:
        return None
    valor = str(valor).strip()
    return valor if valor != "" else None


def _limpiar_codigo(valor):
    if valor is None:
        return None
    valor = str(valor).strip().upper()
    return valor if valor != "" else None


class CursoSerializer(serializers.ModelSerializer):
    profesor_nombre = serializers.CharField(source='id_profesor.nombre', read_only=True)

    class Meta:
        model = Curso
        fields = [
            'id_curso',
            'nombre',
            'codigo',
            'descripcion',
            'nivel_grado',
            'seccion',
            'año_lectivo',
            'horario',
            'cantidad_cupos',
            'estado',
            'id_profesor',
            'profesor_nombre',
            'fecha_creacion',
            'fecha_actualizacion'
        ]

    def validate(self, data):
        nombre = _limpiar_texto(data.get('nombre'))
        codigo = _limpiar_codigo(data.get('codigo'))
        nivel_grado = _limpiar_texto(data.get('nivel_grado'))
        seccion = _limpiar_texto(data.get('seccion'))
        horario = _limpiar_texto(data.get('horario'))

        if nombre is None:
            raise serializers.ValidationError({
                'nombre': 'El nombre del curso es requerido.'
            })

        if codigo is None:
            raise serializers.ValidationError({
                'codigo': 'El código del curso es requerido.'
            })

        if nivel_grado is None:
            raise serializers.ValidationError({
                'nivel_grado': 'El nivel/grado es requerido.'
            })

        if seccion is None:
            raise serializers.ValidationError({
                'seccion': 'La sección es requerida.'
            })

        if horario is None:
            raise serializers.ValidationError({
                'horario': 'El horario es requerido.'
            })

        cantidad_cupos = data.get('cantidad_cupos')
        if cantidad_cupos is None or cantidad_cupos <= 0:
            raise serializers.ValidationError({
                'cantidad_cupos': 'La cantidad de cupos debe ser mayor a 0.'
            })

        año_lectivo = data.get('año_lectivo')
        if año_lectivo is None or año_lectivo < 2000:
            raise serializers.ValidationError({
                'año_lectivo': 'El año lectivo debe ser válido.'
            })

        # Limpiar los datos
        data['nombre'] = nombre
        data['codigo'] = codigo
        data['nivel_grado'] = nivel_grado
        data['seccion'] = seccion
        data['horario'] = horario

        return data
