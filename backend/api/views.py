from rest_framework import viewsets, permissions, decorators, response, status, generics
from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework.exceptions import PermissionDenied, ValidationError
from .models import UserProfile, Cliente, Profesional, Clase, SystemConfig
from .serializers import (
    UserSerializer,
    UserAdminSerializer,
    ClienteSerializer,
    ProfesionalSerializer,
    ClaseSerializer,
    RegistroClienteSerializer,
    ProfesionalAdminCreateSerializer,
    ProfesionalDetalleSerializer,
    SystemConfigSerializer
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


class UserViewSet(viewsets.ModelViewSet):
    """
    Vista para gestión de usuarios.

    - Para admin: CRUD completo + reset password.
    - Para otros: idealmente solo lectura limitada (pero ya tienes /auth/me para eso).
    """
    queryset = User.objects.all().select_related("profile")

    def get_permissions(self):
        # Solo admin puede listar, crear, editar, borrar usuarios
        if self.action in [
            "list",
            "retrieve",
            "create",
            "update",
            "partial_update",
            "destroy",
            "reset_password",
        ]:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        # Admin usa el serializer extendido
        if self.request and self.request.user.is_staff:
            return UserAdminSerializer
        # Para otros casos (si algún día los usas)
        return UserSerializer

    @decorators.action(detail=True, methods=["post"], url_path="reset-password")
    def reset_password(self, request, pk=None):
        """
        POST /api/usuarios/<id>/reset-password/
        Body: { "new_password": "xxxx" }
        """
        new_password = request.data.get("new_password")
        if not new_password:
            return response.Response(
                {"detail": "new_password es obligatorio."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(new_password) < 4:
            return response.Response(
                {"detail": "La contraseña debe tener al menos 4 caracteres."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = self.get_object()
        user.set_password(new_password)
        user.save()
        return response.Response(
            {"detail": "Contraseña actualizada correctamente."},
            status=status.HTTP_200_OK,
        )



class ClaseViewSet(viewsets.ModelViewSet):
    """
    Vista para gestionar clases/capacitaciones.

    Reglas:
    - ADMIN: ve y crea/edita/baja todas las clases.
    - CLIENTE: solo ve sus propias clases y al crear se fuerza su Cliente asociado.
    - PROFESIONAL: solo ve las clases donde él está asignado.
    """
    queryset = Clase.objects.all().select_related(
        "cliente",
        "profesional_asignado__user",
        "solicitada_por",
    )
    serializer_class = ClaseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Clase.objects.none()

        # Si es superuser o rol ADMIN -> todo
        perfil = getattr(user, "profile", None)
        rol = getattr(perfil, "rol", None)

        if user.is_superuser or rol == "ADMIN":
            return self.queryset

        # Rol CLIENTE -> solo clases ligadas a su usuario
        if rol == "CLIENTE":
            return self.queryset.filter(
                Q(solicitada_por=user) | Q(cliente__usuario=user)
            ).distinct()

        # Rol PROFESIONAL -> solo clases donde está asignado
        if rol == "PROFESIONAL":
            profesional = getattr(user, "profesional", None)
            if profesional:
                return self.queryset.filter(profesional_asignado=profesional)
            return Clase.objects.none()

        # Cualquier otro rol, nada
        return Clase.objects.none()

    def perform_create(self, serializer):
        """
        Forzamos lógica según rol:
        - CLIENTE: se toma automáticamente el Cliente asociado a su usuario,
          se ignora cualquier 'cliente' enviado desde el frontend.
        - ADMIN: puede crear clases indicando el cliente que quiera.
        - Otros roles: no pueden crear clases.
        """
        user = self.request.user
        perfil = getattr(user, "profile", None)
        rol = getattr(perfil, "rol", None)

        if rol == "CLIENTE":
            # Buscar el cliente asociado al usuario
            cliente = (
                Cliente.objects.filter(usuario=user, activo=True).first()
            )
            if not cliente:
                raise ValidationError(
                    "No tienes un cliente asociado. "
                    "Contacta al administrador para que vincule tu usuario a una empresa."
                )

            serializer.save(
                cliente=cliente,
                solicitada_por=user,
                estado="PENDIENTE",
            )
            return

        if rol == "ADMIN" or user.is_superuser:
            # Admin puede crear con los datos que lleguen (incluyendo 'cliente')
            serializer.save()
            return

        # PROFs u otros no deberían crear clases
        raise PermissionDenied("Solo clientes o administradores pueden crear clases.")



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
    
class ConfigView(generics.RetrieveUpdateAPIView):
    """
    Devuelve y permite actualizar la configuración global del sistema.
    - GET /api/config/  -> obtiene la configuración
    - PUT /api/config/  -> actualiza todo
    - PATCH /api/config/ -> actualiza campos puntuales
    Solo ADMIN (is_staff) puede editar. Otros podrían ser solo lectura si quisieras.
    """

    serializer_class = SystemConfigSerializer

    def get_object(self):
        # Siempre devolvemos el único registro de configuración.
        config, _ = SystemConfig.objects.get_or_create(id=1)
        return config

    def get_permissions(self):
        # GET: cualquier usuario autenticado puede leer (si quieres)
        # PUT/PATCH: solo admin
        if self.request.method in ["PUT", "PATCH"]:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]