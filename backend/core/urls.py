from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from api import views

router = DefaultRouter()
router.register("usuarios", views.UserViewSet, basename="usuarios")
router.register("clientes", views.ClienteViewSet, basename="clientes")
router.register("profesionales", views.ProfesionalViewSet, basename="profesionales")
router.register("clases", views.ClaseViewSet, basename="clases")

urlpatterns = [
    path("admin/", admin.site.urls),

    # Salud de la API
    path("api/ping/", views.ping, name="ping"),

    # Auth JWT
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Usuario autenticado
    path("api/auth/me/", views.MeView.as_view(), name="auth_me"),

    # Registro público de clientes
    path(
        "api/auth/registro-cliente/",
        views.RegistroClienteView.as_view(),
        name="registro_cliente",
    ),

    # Configuración del sistema
    path("api/config/", views.ConfigView.as_view(), name="system_config"),

    # Rutas del router (usuarios, clientes, profesionales, clases)
    path("api/", include(router.urls)),
]
