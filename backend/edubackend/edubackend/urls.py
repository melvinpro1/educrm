"""
URL configuration for edubackend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include 
from rest_framework.routers import DefaultRouter
from estudiantes.views import EncargadoViewSet, EstudianteViewSet
from estudiantes.auth_views import login_view, logout_view, register_view
from profesores.views import ProfesorViewSet
from django.conf import settings
from django.conf.urls.static import static

router = DefaultRouter()
router.register(r'encargados', EncargadoViewSet)
router.register(r'estudiantes', EstudianteViewSet)
router.register(r'profesores', ProfesorViewSet, basename='profesores')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/comunicaciones/', include('comunicaciones.urls')),
    path('api/auth/login/', login_view, name='login'),
    path('api/auth/logout/', logout_view, name='logout'),
    path('api/auth/register/', register_view, name='register'),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
