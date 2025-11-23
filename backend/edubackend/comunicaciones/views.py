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

''' Funcional sin encargados
from rest_framework import generics, status, permissions
from rest_framework.permissions import AllowAny   # 👈 agrega esto
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
    permission_classes = [AllowAny]   # 👈 antes era IsAuthenticated


class EnviarCorreoView(APIView):
    permission_classes = [AllowAny]   # 👈 antes era IsAuthenticated

    def post(self, request):
        serializer = EnviarCorreoSerializer(
            data=request.data,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        correo_obj = serializer.save()

        ids = serializer.validated_data["estudiantes_ids"]
        tipo_email = serializer.validated_data.get(
            "tipo_email_estudiante",
            "personal"
        )

        qs = Estudiante.objects.filter(pk__in=ids)

        correos = []

        if tipo_email == "institucional":
            correos = list(qs.values_list("correo_institucional", flat=True))
        elif tipo_email == "personal":
            correos = list(qs.values_list("correo_personal", flat=True))
        elif tipo_email == "ambos":
            correos_institucional = list(
                qs.values_list("correo_institucional", flat=True)
            )
            correos_personal = list(
                qs.values_list("correo_personal", flat=True)
            )
            correos = correos_institucional + correos_personal
        else:
            correos = list(qs.values_list("correo_personal", flat=True))

        correos = [c for c in correos if c]

        if not correos:
            return Response(
                {"detail": "No se encontraron correos para los estudiantes seleccionados."},
                status=status.HTTP_400_BAD_REQUEST
            )

        asunto = serializer.validated_data["asunto"]
        contenido = serializer.validated_data["contenido"]

        email = EmailMessage(
            subject=asunto,
            body=contenido,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[],
            bcc=correos
        )
        email.send(fail_silently=False)

        return Response(
            CorreoSerializer(correo_obj).data,
            status=status.HTTP_201_CREATED
        )
'''

from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from django.core.mail import EmailMessage
from django.conf import settings

from .models import Correo
from .serializers import EnviarCorreoSerializer, CorreoSerializer
from estudiantes.models import Estudiante, Encargado   # 👈 IMPORTANTE


class CorreoListAPIView(generics.ListAPIView):
    queryset = Correo.objects.all().order_by('-fecha_envio')
    serializer_class = CorreoSerializer
    permission_classes = [AllowAny]


class EnviarCorreoView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = EnviarCorreoSerializer(
            data=request.data,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        # ⚠️ Copiamos los datos ANTES de save(), porque create() hace pop()
        data = dict(serializer.validated_data)

        segmento = data.get("segmento", "estudiantes")  # estudiantes | encargados | todos
        tipo_email = data.get("tipo_email_estudiante", "personal")
        estudiantes_ids = data.get("estudiantes_ids", []) or []

        # Creamos el Correo + relaciones con estudiantes (si aplica)
        correo_obj = serializer.save()

        correos = []

        # ========== ESTUDIANTES ==========
        if segmento in ["estudiantes", "todos"] and estudiantes_ids:
            qs_est = Estudiante.objects.filter(pk__in=estudiantes_ids)

            if tipo_email == "institucional":
                correos_est = list(
                    qs_est.values_list("correo_institucional", flat=True)
                )
            elif tipo_email == "personal":
                correos_est = list(
                    qs_est.values_list("correo_personal", flat=True)
                )
            elif tipo_email == "ambos":
                correos_inst = list(
                    qs_est.values_list("correo_institucional", flat=True)
                )
                correos_pers = list(
                    qs_est.values_list("correo_personal", flat=True)
                )
                correos_est = correos_inst + correos_pers
            else:
                correos_est = list(
                    qs_est.values_list("correo_personal", flat=True)
                )

            correos += correos_est

        # ========== ENCARGADOS ==========
        if segmento in ["encargados", "todos"]:
            qs_enc = Encargado.objects.all()
            correos_enc = list(qs_enc.values_list("correo", flat=True))
            correos += correos_enc

        # limpiar vacíos
        correos = [c for c in correos if c]

        if not correos:
            return Response(
                {"detail": "No se encontraron correos para los destinatarios seleccionados."},
                status=status.HTTP_400_BAD_REQUEST
            )

        asunto = data["asunto"]
        contenido = data["contenido"]

        email = EmailMessage(
            subject=asunto,
            body=contenido,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[],
            bcc=correos
        )
        email.send(fail_silently=False)

        return Response(
            CorreoSerializer(correo_obj).data,
            status=status.HTTP_201_CREATED
        )
