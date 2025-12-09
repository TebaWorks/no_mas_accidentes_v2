from rest_framework import viewsets, permissions, status
from django.contrib.auth.models import User
from .models import Cliente, Profesional, Clase
from .serializers import (
    UserSerializer,
    ClienteSerializer,
    ProfesionalSerializer,
    ClaseSerializer,
    RegistroClienteSerializer,
    ProfesionalAdminCreateSerializer,
    ProfesionalDetalleSerializer
)
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response


@api_view(["GET"])
def ping(request):
    return Response({"message": "API NoMasAccidentes funcionando ✅"})


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    De momento solo lectura.
    Permite filtrar por rol del perfil:
    - /api/usuarios/?rol=CLIENTE
    - /api/usuarios/?rol=PROFESIONAL
    - /api/usuarios/?rol=ADMIN
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = User.objects.all().select_related("profile")
        rol = self.request.query_params.get("rol")  # CLIENTE, PROFESIONAL, ADMIN

        if rol:
            qs = qs.filter(profile__rol=rol)

        return qs



class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [permissions.AllowAny]  # luego lo ajustamos por rol


class ProfesionalViewSet(viewsets.ModelViewSet):
    queryset = Profesional.objects.select_related("user", "user__profile").all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        # Crear profesional (admin)
        if self.action == "create":
            return ProfesionalAdminCreateSerializer
        # Perfil del propio profesional
        if self.action == "me":
            return ProfesionalDetalleSerializer
        # Listado / detalle general
        return ProfesionalSerializer

    @action(
        detail=False,
        methods=["get", "patch"],
        url_path="me",
        permission_classes=[permissions.IsAuthenticated],
    )
    def me(self, request):
        """
        GET  /api/profesionales/me/   -> ver mis datos
        PATCH /api/profesionales/me/  -> actualizar mis datos
        """
        # ¿Tiene perfil de usuario?
        profile = getattr(request.user, "profile", None)
        rol = getattr(profile, "rol", None)

        # Si no es profesional, no hay nada que hacer aquí
        if rol != "PROFESIONAL" and not request.user.is_staff:
            return Response(
                {"detail": "Tu usuario no tiene un perfil de profesional asociado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Intentar obtener el Profesional existente
        try:
            profesional = Profesional.objects.select_related(
                "user", "user__profile"
            ).get(user=request.user)
        except Profesional.DoesNotExist:
            # Si el rol es PROFESIONAL pero aún no hay registro, lo creamos
            if rol == "PROFESIONAL":
                profesional = Profesional.objects.create(
                    user=request.user,
                    especialidad="",
                    registro_profesional="",
                    disponible=True,
                )
            else:
                return Response(
                    {"detail": "Tu usuario no tiene un perfil de profesional asociado."},
                    status=status.HTTP_404_NOT_FOUND,
                )

        if request.method == "GET":
            serializer = ProfesionalDetalleSerializer(profesional)
            return Response(serializer.data)

        # PATCH
        serializer = ProfesionalDetalleSerializer(
            profesional, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        """
        DELETE /api/profesionales/{id}/
        Elimina el Profesional y también el User asociado.
        Solo permitido para admin (rol ADMIN o is_staff).
        """
        profesional = self.get_object()
        user = profesional.user

        profile = getattr(request.user, "profile", None)
        es_admin = request.user.is_staff or (
            profile is not None and getattr(profile, "rol", None) == "ADMIN"
        )

        if not es_admin:
            return Response(
                {"detail": "No tienes permiso para eliminar profesionales."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Primero borramos el Profesional (para que DRF sea feliz)
        response = super().destroy(request, *args, **kwargs)
        # Luego borramos el usuario asociado
        user.delete()
        return response



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
    
class MeView(APIView):
    """
    Devuelve la info del usuario autenticado + su perfil.
    GET /api/auth/me/
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class RegistroClienteView(APIView):
    """
    Registro público de clientes.
    Crea un usuario con rol CLIENTE.
    POST /api/auth/registro-cliente/
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegistroClienteSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            data = UserSerializer(user).data
            return Response(data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

