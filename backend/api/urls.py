from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ping,
    UserViewSet,
    ClienteViewSet,
    ProfesionalViewSet,
    ClaseViewSet,
)

router = DefaultRouter()
router.register(r"usuarios", UserViewSet, basename="usuarios")
router.register(r"clientes", ClienteViewSet, basename="clientes")
router.register(r"profesionales", ProfesionalViewSet, basename="profesionales")
router.register(r"clases", ClaseViewSet, basename="clases")

urlpatterns = [
    path("ping/", ping, name="ping"),
    path("", include(router.urls)),
]
