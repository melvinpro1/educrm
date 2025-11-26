'''
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
'''
'''
from rest_framework import serializers
from .models import Encargado, Estudiante


class EncargadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Encargado
        fields = ['id_encargado', 'nombre', 'correo', 'telefono', 'estado']
        extra_kwargs = {
            # quitamos la validación de unique aquí, la manejamos nosotros
            'correo': {'validators': []},
        }


class EstudianteSerializer(serializers.ModelSerializer):
    # lo dejamos opcional para PATCH
    encargado = EncargadoSerializer(source='id_encargado', required=False)

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

    def _obtener_o_actualizar_encargado(self, encargado_data):
        """
        Reusa el encargado por correo. Si ya existe, ACTUALIZA sus datos.
        Si no existe, lo crea.
        """
        correo_encargado = encargado_data.get('correo')

        encargado, creado = Encargado.objects.get_or_create(
            correo=correo_encargado,
            defaults={
                'nombre': encargado_data.get('nombre', ''),
                'telefono': encargado_data.get('telefono', ''),
            }
        )

        # si NO se creó (o sea, ya existía), actualizamos los campos que vinieron
        if not creado:
            nombre_nuevo = encargado_data.get('nombre')
            telefono_nuevo = encargado_data.get('telefono')

            if nombre_nuevo is not None:
                encargado.nombre = nombre_nuevo
            if telefono_nuevo is not None:
                encargado.telefono = telefono_nuevo

        # si estaba inactivo, lo activamos
        if not encargado.estado:
            encargado.estado = True

        encargado.save()
        return encargado

    def create(self, validated_data):
        encargado_data = validated_data.pop('id_encargado', None)

        encargado = None
        if encargado_data:
            encargado = self._obtener_o_actualizar_encargado(encargado_data)

        estudiante = Estudiante.objects.create(
            id_encargado=encargado,
            **validated_data
        )
        return estudiante

    def update(self, instance, validated_data):
        encargado_data = validated_data.pop('id_encargado', None)

        # actualizar campos del estudiante
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if encargado_data:
            encargado = self._obtener_o_actualizar_encargado(encargado_data)
            instance.id_encargado = encargado

        instance.save()
        return instance
'''
from rest_framework import serializers
from .models import Encargado, Estudiante


class EncargadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Encargado
        fields = ['id_encargado', 'nombre', 'correo', 'telefono', 'estado']
        extra_kwargs = {
            # quitamos el validador de unique aquí para que no moleste en el anidado
            'correo': {'validators': []},
        }


class EstudianteSerializer(serializers.ModelSerializer):
    # este es el bloque anidado que llega como "encargado": {...}
    encargado = EncargadoSerializer(source='id_encargado', required=False)

    class Meta:
        model = Estudiante
        fields = [
            'id_estudiante',
            'cedula',
            'nombre',
            'correo_institucional',
            'correo_personal',
            'telefono',
            'colegio_procedencia',
            'grado',
            'direccion_domicilio',
            'estado',
            'encargado',
        ]

    # ========== CREATE ==========
    def create(self, validated_data):
        encargado_data = validated_data.pop('id_encargado', None)
        encargado = None

        if encargado_data:
            correo = encargado_data.get('correo')
            # aquí SÍ queremos reusar por correo
            encargado, creado = Encargado.objects.get_or_create(
                correo=correo,
                defaults={
                    'nombre': encargado_data.get('nombre', ''),
                    'telefono': encargado_data.get('telefono', ''),
                }
            )
            if not encargado.estado:
                encargado.estado = True
                encargado.save()

        estudiante = Estudiante.objects.create(
            id_encargado=encargado,
            **validated_data
        )
        return estudiante

    # ========== UPDATE ==========
    def update(self, instance, validated_data):
        """
        Aquí NO vamos a crear encargados nuevos.
        Solo actualizamos el encargado que YA tiene este estudiante.
        Así todos los estudiantes que lo compartan ven el cambio.
        """
        encargado_data = validated_data.pop('id_encargado', None)

        # 1. Actualizar los campos del estudiante
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # 2. Actualizar el encargado actual (si vino en el body)
        if encargado_data is not None:
            encargado_actual = instance.id_encargado  # el mismo que comparten

            # por si acaso no tiene (no debería pasar, pero bueno)
            if encargado_actual is not None:
                # actualizamos SOLO los campos que vinieron
                nombre = encargado_data.get('nombre')
                correo = encargado_data.get('correo')
                telefono = encargado_data.get('telefono')
                estado = encargado_data.get('estado')

                if nombre is not None:
                    encargado_actual.nombre = nombre
                if correo is not None:
                    # OJO: si pones un correo que ya existe en otro encargado,
                    # aquí te va a tirar error de unique en la BD. Eso es correcto.
                    encargado_actual.correo = correo
                if telefono is not None:
                    encargado_actual.telefono = telefono
                if estado is not None:
                    encargado_actual.estado = estado
                else:
                    # si estaba inactivo y lo estás usando otra vez, lo activamos
                    if not encargado_actual.estado:
                        encargado_actual.estado = True

                encargado_actual.save()

        instance.save()
        return instance

    

