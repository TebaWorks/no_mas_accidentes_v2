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
    serializer_class = ClaseSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        """
        Permite filtrar:
        - ?cliente_id=<id>
        - ?profesional_id=<id>
        - ?estado=<ESTADO>
        """
        qs = Clase.objects.select_related(
            "cliente", "solicitada_por", "profesional_asignado"
        )

        cliente_id = self.request.query_params.get("cliente_id")
        profesional_id = self.request.query_params.get("profesional_id")
        estado = self.request.query_params.get("estado")

        if cliente_id:
            qs = qs.filter(cliente_id=cliente_id)

        if profesional_id:
            qs = qs.filter(profesional_asignado_id=profesional_id)

        if estado:
            qs = qs.filter(estado=estado)

        return qs

    def perform_create(self, serializer):
        # Más adelante, cuando haya autenticación, aquí usaremos self.request.user
        return serializer.save()

