from rest_framework import viewsets, permissions
from django.contrib.auth.models import User
from .models import Cliente, Profesional, Clase
from .serializers import (
    UserSerializer,
    ClienteSerializer,
    ProfesionalSerializer,
    ClaseSerializer,
)
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(["GET"])
def ping(request):
    return Response({"message": "API NoMasAccidentes funcionando ✅"})


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    De momento solo lectura. Más adelante podemos permitir crear usuarios desde admin.
    """
    queryset = User.objects.all().select_related("profile")
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]


class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [permissions.AllowAny]  # luego lo ajustamos por rol


class ProfesionalViewSet(viewsets.ModelViewSet):
    queryset = Profesional.objects.select_related("user")
    serializer_class = ProfesionalSerializer
    permission_classes = [permissions.AllowAny]  # luego restringimos a admin


class ClaseViewSet(viewsets.ModelViewSet):
    queryset = Clase.objects.select_related(
        "cliente", "solicitada_por", "profesional_asignado"
    )
    serializer_class = ClaseSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        # En el futuro, cuando tengamos autenticación, aquí usaremos request.user
        return serializer.save()
