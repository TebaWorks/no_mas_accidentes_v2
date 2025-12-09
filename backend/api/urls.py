from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

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
    path("", include(router.urls)),
    path("ping/", views.ping, name="ping"),

    # Auth JWT
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Información del usuario autenticado
    path("auth/me/", views.MeView.as_view(), name="auth_me"),
]

