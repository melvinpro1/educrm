'''from django.urls import path
from .views import EnviarCorreoView

urlpatterns = [
    path("enviar/", EnviarCorreoView.as_view(), name="enviar-correo"),
]'''

from django.urls import path
from .views import CorreoListAPIView, EnviarCorreoView, CorreoDetailDeleteView

urlpatterns = [
    path("correos/", CorreoListAPIView.as_view(), name="correos-list"),
    path("correos/enviar/", EnviarCorreoView.as_view(), name="correos-enviar"),
    path("correos/<int:pk>/", CorreoDetailDeleteView.as_view(), name="correos-detail"),
]
