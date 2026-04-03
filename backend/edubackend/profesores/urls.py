from rest_framework.routers import DefaultRouter
from .views import ProfesorViewSet

router = DefaultRouter()
router.register(r'profesores', ProfesorViewSet, basename='profesores')

urlpatterns = router.urls