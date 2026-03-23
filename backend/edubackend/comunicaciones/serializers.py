from rest_framework import serializers
from .models import Correo, Adjunto
from estudiantes.models import Estudiante


class AdjuntoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Adjunto
        fields = ["id_adjunto", "archivo", "nombre_original", "tipo_archivo", "fecha_subida"]
        read_only_fields = ["id_adjunto", "fecha_subida"]


class EnviarCorreoSerializer(serializers.Serializer):
    asunto = serializers.CharField(max_length=150)
    contenido = serializers.CharField()
    tipo_correo = serializers.CharField(
        max_length=50,
        required=False,
        allow_blank=True,
        allow_null=True
    )
    # institucional | personal | ambos (para decidir qué correo usar)
    tipo_email_estudiante = serializers.CharField(
        max_length=20,
        required=False,
        allow_blank=True,
        allow_null=True
    )
    # estudiantes | encargados | todos
    segmento = serializers.CharField(
        max_length=20,
        required=False,
        allow_blank=True,
        allow_null=True
    )
    # ahora opcional, puede venir vacío cuando el segmento es "encargados"
    estudiantes_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        allow_empty=True
    )
    # NUEVO: archivos adjuntos (multipart/form-data)
    adjuntos = serializers.ListField(
        child=serializers.FileField(),
        required=False,
        allow_empty=True
    )

    def create(self, validated_data):
        estudiantes_ids = validated_data.pop("estudiantes_ids", [])
        adjuntos_files = validated_data.pop("adjuntos", [])

        # estos campos NO existen en el modelo Correo, son solo para la vista
        validated_data.pop("tipo_email_estudiante", None)
        validated_data.pop("segmento", None)

        request = self.context.get("request")
        if request and request.user.is_authenticated:
            validated_data["id_usuario"] = request.user

        # crear el registro de Correo
        correo = Correo.objects.create(**validated_data)

        # relacionar estudiantes (si vinieron)
        if estudiantes_ids:
            estudiantes = Estudiante.objects.filter(pk__in=estudiantes_ids)
            correo.estudiantes.set(estudiantes)

        # NUEVO: guardar adjuntos
        for archivo in adjuntos_files:
            tipo_ext = archivo.name.split('.')[-1].lower()
            Adjunto.objects.create(
                id_correo=correo,
                archivo=archivo,
                nombre_original=archivo.name,
                tipo_archivo=tipo_ext
            )

        return correo


class CorreoSerializer(serializers.ModelSerializer):
    # mapeos para que el front reciba los nombres que espera
    mensaje = serializers.CharField(source="contenido", read_only=True)
    fecha = serializers.DateTimeField(source="fecha_envio", read_only=True)
    estudiantes_ids = serializers.PrimaryKeyRelatedField(
        source="estudiantes",
        many=True,
        read_only=True
    )
    # NUEVO: adjuntos
    adjuntos = AdjuntoSerializer(many=True, read_only=True)
    estado = serializers.SerializerMethodField()
    enviados = serializers.SerializerMethodField()

    class Meta:
        model = Correo
        fields = [
            "id_correo",
            "asunto",
            "mensaje",
            "fecha",
            "tipo_correo",
            "estudiantes_ids",
            "adjuntos",
            "estado",
            "enviados",
        ]

    def get_estado(self, obj):
        # por ahora todo lo que está en BD lo marcamos como "enviado"
        return "enviado"

    def get_enviados(self, obj):
        return obj.estudiantes.count()
