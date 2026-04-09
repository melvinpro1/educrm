from rest_framework import serializers
from .models import Curso


def _limpiar_texto(valor):
    if valor is None:
        return None
    valor = str(valor).strip()
    return valor if valor != "" else None


class CursoSerializer(serializers.ModelSerializer):
    profesor_nombre = serializers.CharField(source='id_profesor.nombre', read_only=True)

    class Meta:
        model = Curso
        fields = [
            'id_curso',
            'nombre',
            'nivel_grado',
            'año_lectivo',
            'horario',
            'estado',
            'id_profesor',
            'profesor_nombre',
            'fecha_creacion',
            'fecha_actualizacion'
        ]

    def validate(self, data):
        nombre = _limpiar_texto(data.get('nombre'))
        nivel_grado = _limpiar_texto(data.get('nivel_grado'))
        horario = _limpiar_texto(data.get('horario'))

        if nombre is None:
            raise serializers.ValidationError({
                'nombre': 'El nombre del curso es requerido.'
            })

        if nivel_grado is None:
            raise serializers.ValidationError({
                'nivel_grado': 'El nivel/grado es requerido.'
            })

        if horario is None:
            raise serializers.ValidationError({
                'horario': 'El horario es requerido.'
            })

        año_lectivo = data.get('año_lectivo')
        if año_lectivo is None or año_lectivo < 2000:
            raise serializers.ValidationError({
                'año_lectivo': 'El año lectivo debe ser válido.'
            })

        # Limpiar los datos
        data['nombre'] = nombre
        data['nivel_grado'] = nivel_grado
        data['horario'] = horario

        return data
