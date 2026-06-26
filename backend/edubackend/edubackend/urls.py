from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from estudiantes.views import EncargadoViewSet, EstudianteViewSet
from estudiantes.auth_views import (
    login_view, logout_view, register_view, recuperar_view,
    UsuarioListCreateView, UsuarioDetailView,
    AprobarUsuarioView, UsuariosPendientesView, PermisoRolView,
    NotasEncargadoView,
)
from profesores.views import ProfesorViewSet
from cursos.views import CursoViewSet
from activos.views import ActivoViewSet, PrestamoViewSet
from django.conf import settings
from django.conf.urls.static import static

router = DefaultRouter()
router.register(r'encargados', EncargadoViewSet, basename='encargados')
router.register(r'estudiantes', EstudianteViewSet, basename='estudiantes')
router.register(r'profesores', ProfesorViewSet, basename='profesores')
router.register(r'cursos', CursoViewSet, basename='cursos')
router.register(r'activos', ActivoViewSet, basename='activos')
router.register(r'prestamos', PrestamoViewSet, basename='prestamos')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/comunicaciones/', include('comunicaciones.urls')),

    # Auth
    path('api/auth/login/', login_view, name='login'),
    path('api/auth/logout/', logout_view, name='logout'),
    path('api/auth/register/', register_view, name='register'),
    path('api/auth/recuperar/', recuperar_view, name='recuperar-password'),

    # Usuarios
    path('api/auth/usuarios/', UsuarioListCreateView.as_view(), name='usuarios-list'),
    path('api/auth/usuarios/pendientes/', UsuariosPendientesView.as_view(), name='usuarios-pendientes'),
    path('api/auth/usuarios/<int:pk>/', UsuarioDetailView.as_view(), name='usuarios-detail'),
    path('api/auth/usuarios/<int:pk>/aprobar/', AprobarUsuarioView.as_view(), name='aprobar-usuario'),

    # Permisos por rol
    path('api/auth/permisos-rol/', PermisoRolView.as_view(), name='permisos-rol'),

    # Notas para encargado autenticado
    path('api/auth/notas-encargado/', NotasEncargadoView.as_view(), name='notas-encargado'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
