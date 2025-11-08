from rest_framework import serializers
from .models import Encargado, Estudiante


class EncargadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Encargado
        fields = ['id_encargado', 'nombre', 'correo', 'telefono', 'estado']
        extra_kwargs = {
            # quitamos la validación de unicidad aquí,
            # porque la vamos a manejar con get_or_create en el estudiante
            'correo': {'validators': []},
        }


class EstudianteSerializer(serializers.ModelSerializer):
    encargado = EncargadoSerializer(source='id_encargado') #required=False

    class Meta:
        model = Estudiante
        fields = [
            'id_estudiante',
            'cedula',
            'nombre',
            'correo_institucional',
            'correo_personal',
            'grado',
            'direccion_domicilio',
            'estado',
            'encargado',
        ]

    def create(self, validated_data):
        encargado_data = validated_data.pop('id_encargado')
        correo_encargado = encargado_data.get('correo')

        encargado, creado = Encargado.objects.get_or_create(
            correo=correo_encargado,
            defaults={
                'nombre': encargado_data.get('nombre', ''),
                'telefono': encargado_data.get('telefono', ''),
            }
        )

        # si el encargado existía pero estaba inactivo, lo reactivamos
        if not encargado.estado:
            encargado.estado = True
            encargado.save()

        estudiante = Estudiante.objects.create(
            id_encargado=encargado,
            **validated_data
        )
        return estudiante

    def update(self, instance, validated_data):
        encargado_data = validated_data.pop('id_encargado', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if encargado_data:
            correo_encargado = encargado_data.get('correo')
            encargado, creado = Encargado.objects.get_or_create(
                correo=correo_encargado,
                defaults={
                    'nombre': encargado_data.get('nombre', ''),
                    'telefono': encargado_data.get('telefono', ''),
                }
            )
            if not encargado.estado:
                encargado.estado = True
                encargado.save()
            instance.id_encargado = encargado

        instance.save()
        return instance
