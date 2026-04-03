from rest_framework import serializers
from .models import Profesor
import re


def _limpiar_texto(valor):
    if valor is None:
        return None
    valor = str(valor).strip()
    return valor if valor != "" else None


def _limpiar_telefono(valor):
    if valor is None:
        return None
    valor = str(valor).strip()
    if valor == "":
        return None
    return re.sub(r'[\s\-]+', '', valor)


def _limpiar_cedula(valor):
    if valor is None:
        return None
    valor = str(valor).strip()
    if valor == "":
        return None
    return re.sub(r'[\s\-]+', '', valor)


def _limpiar_correo(valor):
    if valor is None:
        return None
    valor = str(valor).strip().lower()
    return valor if valor != "" else None


class ProfesorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profesor
        fields = ['id_profesor', 'cedula', 'nombre', 'correo', 'telefono', 'activo']

    def validate(self, data):
        cedula = _limpiar_cedula(data.get('cedula'))
        nombre = _limpiar_texto(data.get('nombre'))
        correo = _limpiar_correo(data.get('correo'))
        telefono = _limpiar_telefono(data.get('telefono'))

        if cedula is None:
            raise serializers.ValidationError({
                'cedula': 'La cédula es obligatoria.'
            })

        if nombre is None:
            raise serializers.ValidationError({
                'nombre': 'El nombre es obligatorio.'
            })

        if correo is None:
            raise serializers.ValidationError({
                'correo': 'El correo es obligatorio.'
            })

        if telefono is not None and not telefono.isdigit():
            raise serializers.ValidationError({
                'telefono': 'El teléfono solo debe contener números.'
            })

        data['cedula'] = cedula
        data['nombre'] = nombre
        data['correo'] = correo
        data['telefono'] = telefono

        return data