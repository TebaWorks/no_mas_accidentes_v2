from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .. import views  # importa views desde api.views


router = DefaultRouter()
router.register("usuarios", views.UserViewSet, basename="usuarios")
router.register("clientes", views.ClienteViewSet, basename="clientes")
router.register("profesionales", views.ProfesionalViewSet, basename="profesionales")
router.register("clases", views.ClaseViewSet, basename="clases")

urlpatterns = [
    # Ping de salud
    path("ping/", views.ping, name="ping"),

    # Auth JWT
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Usuario autenticado
    path("auth/me/", views.MeView.as_view(), name="auth_me"),

    # Registro público de clientes
    path(
        "auth/registro-cliente/",
        views.RegistroClienteView.as_view(),
        name="registro_cliente",
    ),
    path("config/", views.ConfigView.as_view(), name="config"),

    # Rutas del router (usuarios, clientes, profesionales, clases)
    path("", include(router.urls)),
]

