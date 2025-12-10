from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .. import views

router = DefaultRouter()
router.register("usuarios", views.UserViewSet, basename="usuarios")
router.register("clientes", views.ClienteViewSet, basename="clientes")
router.register("profesionales", views.ProfesionalViewSet, basename="profesionales")
router.register("clases", views.ClaseViewSet, basename="clases")

urlpatterns = [
    path("ping/", views.ping, name="ping"),
    path("auth/me/", views.MeView.as_view(), name="auth_me"),
    path("auth/registro-cliente/", views.RegistroClienteView.as_view(), name="registro_cliente"),

    # 🔹 NUEVO: configuración del sistema
    path("config/", views.ConfigView.as_view(), name="config"),

    path("", include(router.urls)),
]
