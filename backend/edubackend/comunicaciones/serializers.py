from rest_framework import serializers

class EnviarCorreoSerializer(serializers.Serializer):
    asunto = serializers.CharField(max_length=150)
    contenido = serializers.CharField()
    estudiantes_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False
    )