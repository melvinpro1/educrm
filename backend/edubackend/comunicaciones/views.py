'''from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import EmailMessage
from django.conf import settings

from estudiantes.models import Estudiante
from .models import Correo, CorreoEstudiante
from .serializers import EnviarCorreoSerializer


class EnviarCorreoView(APIView):

    def post(self, request):
        serializer = EnviarCorreoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        asunto = serializer.validated_data["asunto"]
        contenido = serializer.validated_data["contenido"]
        ids = serializer.validated_data["estudiantes_ids"] #Cambiar segun lo que tenga estudiante

        # Obtener correos de estudiantes
        correos = list(
            Estudiante.objects.filter(id_estudiante__in=ids)
            .values_list("correo_personal", flat=True)
        )

        if not correos:
            return Response({"detail": "No se encontraron estudiantes."},
                            status=status.HTTP_400_BAD_REQUEST)

        # Guardar el correo en la BD
        correo_obj = Correo.objects.create(
            asunto=asunto,
            contenido=contenido,
            id_usuario=request.user if request.user.is_authenticated else None
        )

        # Guardar relaciones N:M
        for id_est in ids:
            CorreoEstudiante.objects.create(
                id_correo=correo_obj,
                id_estudiante_id=id_est
            )

        # Enviar correo usando SMTP Gmail (BCC masivo)
        email = EmailMessage(
            subject=asunto,
            body=contenido,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[],
            bcc=correos
        )

        email.send(fail_silently=False)

        return Response({"detail": "Correo enviado correctamente."},
                        status=status.HTTP_200_OK)
# Create your views here.'''

from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.core.mail import EmailMessage
from django.conf import settings

from .models import Correo
from .serializers import EnviarCorreoSerializer, CorreoSerializer
from estudiantes.models import Estudiante


class CorreoListAPIView(generics.ListAPIView):
    queryset = Correo.objects.all().order_by('-fecha_envio')
    serializer_class = CorreoSerializer
    permission_classes = [permissions.IsAuthenticated]



class EnviarCorreoView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Validar datos del front
        serializer = EnviarCorreoSerializer(
            data=request.data,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        # Crear Correo + relaciones N:M usando el create() del serializer
        correo_obj = serializer.save()

        # IDs de estudiantes que vinieron en el body
        ids = serializer.validated_data["estudiantes_ids"]

        # Correos electrónicos de esos estudiantes
        correos = list(
            Estudiante.objects.filter(pk__in=ids)
            .values_list("correo_personal", flat=True)
        )

        if not correos:
            return Response(
                {"detail": "No se encontraron estudiantes."},
                status=status.HTTP_400_BAD_REQUEST
            )

        asunto = serializer.validated_data["asunto"]
        contenido = serializer.validated_data["contenido"]

        # Enviar correo masivo por BCC
        email = EmailMessage(
            subject=asunto,
            body=contenido,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[],
            bcc=correos
        )
        email.send(fail_silently=False)

        # Devolvemos el correo creado (para que el front lo pueda agregar a la tabla si quiere)
        return Response(
            CorreoSerializer(correo_obj).data,
            status=status.HTTP_201_CREATED
        )

