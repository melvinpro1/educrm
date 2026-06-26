from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from django.core.mail import EmailMessage
from django.conf import settings

from .models import Correo
from .serializers import EnviarCorreoSerializer, CorreoSerializer
from estudiantes.models import Estudiante, Encargado
from estudiantes.views import registrar_accion


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

        # Copiamos los datos ANTES de save(), porque create() hace pop()
        data = dict(serializer.validated_data)

        segmento = data.get("segmento", "estudiantes")
        tipo_email = data.get("tipo_email_estudiante", "personal")
        estudiantes_ids = data.get("estudiantes_ids", []) or []

        correo_obj = serializer.save()

        correos = []

        # Estudiantes
        if segmento in ["estudiantes", "todos"] and estudiantes_ids:
            qs_est = Estudiante.objects.filter(pk__in=estudiantes_ids, activo=True)

            if tipo_email == "institucional":
                correos_est = list(qs_est.values_list("correo_institucional", flat=True))
            elif tipo_email == "ambos":
                correos_est = (
                    list(qs_est.values_list("correo_institucional", flat=True)) +
                    list(qs_est.values_list("correo_personal", flat=True))
                )
            else:
                correos_est = list(qs_est.values_list("correo_personal", flat=True))

            correos += correos_est

        # Encargados
        if segmento in ["encargados", "todos"]:
            correos += list(Encargado.objects.filter(activo=True).values_list("correo", flat=True))

        correos = [c for c in correos if c]

        if not correos:
            return Response(
                {"detail": "No se encontraron correos para los destinatarios seleccionados."},
                status=status.HTTP_400_BAD_REQUEST
            )

        email = EmailMessage(
            subject=data["asunto"],
            body=data["contenido"],
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[],
            bcc=correos,
        )

        for adjunto in correo_obj.adjuntos.all():
            email.attach_file(adjunto.archivo.path)

        email.send(fail_silently=False)

        correo_obj.total_enviados = len(correos)
        correo_obj.save()

        return Response(CorreoSerializer(correo_obj).data, status=status.HTTP_201_CREATED)


class CorreoDetailDeleteView(APIView):
    permission_classes = [AllowAny]

    def get_object(self, pk):
        try:
            return Correo.objects.get(pk=pk)
        except Correo.DoesNotExist:
            return None

    def get(self, request, pk):
        correo = self.get_object(pk)
        if correo is None:
            return Response({"detail": "Correo no encontrado."}, status=status.HTTP_404_NOT_FOUND)
        return Response(CorreoSerializer(correo).data)

    def delete(self, request, pk):
        correo = self.get_object(pk)
        if correo is None:
            return Response({"detail": "Correo no encontrado."}, status=status.HTTP_404_NOT_FOUND)
        asunto = correo.asunto
        correo.delete()
        registrar_accion(
            usuario=str(request.user) if request.user.is_authenticated else "Sistema",
            tipo_accion="eliminar_comunicacion",
            descripcion=f"Eliminó comunicación: {asunto}",
        )
        return Response({"detail": "Comunicación eliminada correctamente."})
