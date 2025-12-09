from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Admin de Django
    path("admin/", admin.site.urls),

    # Toda la API (ping, usuarios, clientes, token, auth, etc.)
    path("api/", include("api.core.urls")),
]


