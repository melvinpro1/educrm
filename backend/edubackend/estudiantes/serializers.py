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
from .models import Encargado, Estudiante, HistorialAccion
import re


class EncargadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Encargado
        fields = ['id_encargado', 'nombre', 'correo', 'telefono', 'activo']
        extra_kwargs = {
            # quitamos el validador de unique aquí para que no moleste en el anidado
            'correo': {'validators': []},
        }


def _limpiar_telefono(t):
    """Limpia formato de teléfono"""
    if t is None:
        return None
    t = str(t).strip()
    if t == "":
        return None
    # quitar espacios y guiones y otros separadores comunes
    return re.sub(r'[\s\-]+', '', t)


def _limpiar_correo(c):
    """Limpia formato de correo"""
    if c is None:
        return None
    c = str(c).strip()
    return c if c != "" else None


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
            'activo',
            'encargado',
        ]

    def validate(self, data):
        """Validación personalizada"""
        # Normalizar correos y teléfonos en data (para usar luego)
        correo_inst = _limpiar_correo(data.get('correo_institucional'))
        correo_pers = _limpiar_correo(data.get('correo_personal'))
        encargado_data = data.get('id_encargado')
        correo_enc = None
        telefono_enc = None

        if encargado_data:
            correo_enc = _limpiar_correo(encargado_data.get('correo'))
            telefono_enc = _limpiar_telefono(encargado_data.get('telefono'))

        # Reemplazamos en data los valores normalizados
        if correo_inst is not None:
            data['correo_institucional'] = correo_inst
        if correo_pers is not None:
            data['correo_personal'] = correo_pers
        if encargado_data and correo_enc is not None:
            encargado_data['correo'] = correo_enc
        if encargado_data:
            encargado_data['telefono'] = telefono_enc

        # Validar que los 3 correos no se repitan entre sí
        correos = [c for c in (correo_inst, correo_pers, correo_enc) if c]
        if len(correos) != len(set(correos)):
            raise serializers.ValidationError(
                "El correo institucional, el correo personal y el correo del encargado deben ser distintos entre sí."
            )

        # Teléfono encargado no igual al teléfono del estudiante
        telefono_est = _limpiar_telefono(data.get('telefono'))
        if telefono_est is not None:
            data['telefono'] = telefono_est

        if telefono_enc and telefono_est and telefono_enc == telefono_est:
            raise serializers.ValidationError(
                {"encargado": {"telefono": "El teléfono del encargado no puede ser igual al teléfono del estudiante."}}
            )

        # Validar teléfono encargado duplicado solo en modo UPDATE
        # En CREATE, permitimos que se reutilice por correo (get_or_create)
        if telefono_enc and self.instance:
            # Solo validar si estamos actualizando
            qs = Encargado.objects.filter(telefono=telefono_enc)
            if getattr(self.instance, "id_encargado", None):
                qs = qs.exclude(pk=self.instance.id_encargado.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    {"encargado": {"telefono": "Ya existe un encargado con este teléfono."}}
                )

        return data

    def create(self, validated_data):
        encargado_data = validated_data.pop('id_encargado', None)
        encargado = None

        if encargado_data:
            correo = encargado_data.get('correo')
            encargado, creado = Encargado.objects.get_or_create(
                correo=correo,
                defaults={
                    'nombre': encargado_data.get('nombre', ''),
                    'telefono': encargado_data.get('telefono', ''),
                    'activo': True,
                }
            )

            if not creado:
                # El correo ya existía: actualizar con los datos nuevos que ingresó el usuario
                encargado.nombre = encargado_data.get('nombre', encargado.nombre)
                encargado.telefono = encargado_data.get('telefono', encargado.telefono)
                encargado.activo = True
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

                if nombre is not None:
                    encargado_actual.nombre = nombre
                if correo is not None:
                    # OJO: si pones un correo que ya existe en otro encargado,
                    # aquí te va a tirar error de unique en la BD. Eso es correcto.
                    encargado_actual.correo = correo
                if telefono is not None:
                    encargado_actual.telefono = telefono

                encargado_actual.save()

        instance.save()
        return instance

    


class HistorialAccionSerializer(serializers.ModelSerializer):
    tipo_accion_display = serializers.CharField(source='get_tipo_accion_display', read_only=True)
    
    class Meta:
        model = HistorialAccion
        fields = ['id', 'usuario', 'tipo_accion', 'tipo_accion_display', 'descripcion', 'detalles', 'fecha_hora']
        read_only_fields = ['id', 'fecha_hora']
