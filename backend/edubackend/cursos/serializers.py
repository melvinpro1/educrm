from rest_framework import serializers
from .models import Curso, EstudianteCurso


def _limpiar_texto(valor):
    if valor is None:
        return None
    valor = str(valor).strip()
    return valor if valor != "" else None


class EstudianteCursoSerializer(serializers.ModelSerializer):
    id_estudiante_pk = serializers.IntegerField(source='id_estudiante.id_estudiante', read_only=True)
    nombre = serializers.CharField(source='id_estudiante.nombre', read_only=True)
    cedula = serializers.CharField(source='id_estudiante.cedula', read_only=True)

    class Meta:
        model = EstudianteCurso
        fields = ['id_estudiante_pk', 'nombre', 'cedula', 'nota', 'fecha_inscripcion']


class CursoSerializer(serializers.ModelSerializer):
    profesor_nombre = serializers.CharField(source='id_profesor.nombre', read_only=True)
    total_estudiantes = serializers.IntegerField(source='estudiantes_inscritos.count', read_only=True)

    class Meta:
        model = Curso
        fields = [
            'id_curso', 'nombre', 'nivel_grado', 'horario', 'estado',
            'id_profesor', 'profesor_nombre', 'total_estudiantes',
            'fecha_creacion', 'fecha_actualizacion',
        ]

    def validate(self, data):
        nombre = _limpiar_texto(data.get('nombre'))
        nivel_grado = _limpiar_texto(data.get('nivel_grado'))
        horario = _limpiar_texto(data.get('horario'))

        if nombre is None:
            raise serializers.ValidationError({'nombre': 'El nombre del curso es requerido.'})
        if nivel_grado is None:
            raise serializers.ValidationError({'nivel_grado': 'El nivel/grado es requerido.'})
        if horario is None:
            raise serializers.ValidationError({'horario': 'El horario es requerido.'})

        data['nombre'] = nombre
        data['nivel_grado'] = nivel_grado
        data['horario'] = horario
        return data
