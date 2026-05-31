from rest_framework import serializers
from .models import Activo, Prestamo


class ActivoSerializer(serializers.ModelSerializer):
    prestamo_activo = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Activo
        fields = [
            'id_activo',
            'tipo',
            'nombre',
            'identificador',
            'estado',
            'fecha_creacion',
            'fecha_actualizacion',
            'prestamo_activo',
        ]

    def get_prestamo_activo(self, obj):
        prestamo = obj.prestamos.filter(estado_prestamo='activo').first()
        if prestamo:
            return {
                'id_prestamo': prestamo.id_prestamo,
                'estudiante_nombre': prestamo.id_estudiante.nombre,
                'estudiante_cedula': prestamo.id_estudiante.cedula,
                'fecha_prestamo': prestamo.fecha_prestamo,
                'fecha_retorno_esperada': prestamo.fecha_retorno_esperada,
            }
        return None

    def validate(self, data):
        nombre = (data.get('nombre') or '').strip()
        if not nombre:
            raise serializers.ValidationError({'nombre': 'El nombre del activo es requerido.'})
        data['nombre'] = nombre

        instance = self.instance
        if instance and data.get('estado') == 'en_mantenimiento':
            if instance.prestamos.filter(estado_prestamo='activo').exists():
                raise serializers.ValidationError(
                    'Este activo tiene un préstamo activo. '
                    'Registre la devolución antes de cambiar su estado.'
                )

        return data


class PrestamoSerializer(serializers.ModelSerializer):
    activo_nombre = serializers.CharField(source='id_activo.nombre', read_only=True)
    activo_tipo = serializers.CharField(source='id_activo.tipo', read_only=True)
    estudiante_nombre = serializers.CharField(source='id_estudiante.nombre', read_only=True)
    estudiante_cedula = serializers.CharField(source='id_estudiante.cedula', read_only=True)

    class Meta:
        model = Prestamo
        fields = [
            'id_prestamo',
            'id_activo',
            'activo_nombre',
            'activo_tipo',
            'id_estudiante',
            'estudiante_nombre',
            'estudiante_cedula',
            'fecha_prestamo',
            'fecha_retorno_esperada',
            'fecha_retorno_real',
            'estado_prestamo',
            'fecha_creacion',
            'fecha_actualizacion',
        ]

    def validate(self, data):
        if not self.instance:
            activo = data.get('id_activo')
            if activo and activo.estado != 'disponible':
                raise serializers.ValidationError(
                    'Solo se pueden prestar activos con estado disponible. '
                    'Activos en mantenimiento no se pueden prestar.'
                )

            fecha_prestamo = data.get('fecha_prestamo')
            fecha_retorno = data.get('fecha_retorno_esperada')
            if fecha_prestamo and fecha_retorno and fecha_retorno <= fecha_prestamo:
                raise serializers.ValidationError({
                    'fecha_retorno_esperada': 'La fecha de retorno debe ser posterior a la fecha de préstamo.'
                })

        return data

    def create(self, validated_data):
        prestamo = Prestamo.objects.create(**validated_data)
        activo = prestamo.id_activo
        activo.estado = 'prestado'
        activo.save()
        return prestamo
