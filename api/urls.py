from .views import ModelViewSet
from .views import PropertyViewSet
from .views import ObjectViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'models', ModelViewSet, base_name='models')
router.register(r'properties', PropertyViewSet, base_name='properties')
router.register(r'objects', ObjectViewSet, base_name='objects')
urlpatterns = router.urls
