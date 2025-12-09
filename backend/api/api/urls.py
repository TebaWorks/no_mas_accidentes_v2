from django.urls import path
from .views import ping
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views


urlpatterns = [
    path("", include(router.urls)),
    path("ping/", views.ping, name="ping"),

    # Auth JWT
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Información del usuario autenticado
    path("auth/me/", views.MeView.as_view(), name="auth_me"),
]

