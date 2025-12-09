from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Cliente, Profesional, Clase


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ["rut", "telefono", "rol"]


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "email", "profile"]


class UserAdminSerializer(serializers.ModelSerializer):
    # Campos del perfil (UserProfile)
    rut = serializers.CharField(
        source="profile.rut",
        allow_blank=True,
        required=False,
    )
    telefono = serializers.CharField(
        source="profile.telefono",
        allow_blank=True,
        required=False,
    )
    direccion = serializers.CharField(
        source="profile.direccion",
        allow_blank=True,
        required=False,
    )
    rol = serializers.ChoiceField(
        source="profile.rol",
        choices=UserProfile.ROLE_CHOICES,
        required=False,
    )

    # Campo extra para crear/cambiar contraseña
    password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        min_length=4,
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "password",       # solo escritura
            "first_name",
            "last_name",
            "email",
            "is_active",
            "rut",
            "telefono",
            "direccion",
            "rol",
        ]
        read_only_fields = ["id", "username"]

    def create(self, validated_data):
        """
        Crea un usuario + UserProfile ligado, usando los campos de perfil.
        (OJO: si quisieras crear usuarios sueltos desde aquí).
        """
        profile_data = validated_data.pop("profile", {})
        password = validated_data.pop("password", None)

        user = User(**validated_data)

        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()

        UserProfile.objects.create(
          user=user,
          rut=profile_data.get("rut", ""),
          telefono=profile_data.get("telefono", ""),
          direccion=profile_data.get("direccion", ""),
          rol=profile_data.get("rol", "CLIENTE"),
        )

        return user

    def update(self, instance, validated_data):
        """
        Permite que el admin modifique:
        - first_name, last_name, email, is_active
        - profile.rut, telefono, direccion, rol
        - password (opcional)
        """
        profile_data = validated_data.pop("profile", {})
        password = validated_data.pop("password", None)

        # Campos de User
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()

        # Campos de UserProfile
        profile = getattr(instance, "profile", None)
        if profile:
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()

        return instance


class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = "__all__"


class ProfesionalSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    nombre_completo = serializers.SerializerMethodField()
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Profesional
        fields = [
            "id",
            "user",
            "username",
            "nombre_completo",
            "email",
            "especialidad",
            "registro_profesional",
            "disponible",
        ]
        read_only_fields = ["id", "user", "username", "nombre_completo", "email"]

    def get_nombre_completo(self, obj):
        nombre = obj.user.first_name or ""
        apellido = obj.user.last_name or ""
        full = (nombre + " " + apellido).strip()
        return full or obj.user.username


class ClaseSerializer(serializers.ModelSerializer):
    cliente_nombre = serializers.CharField(source="cliente.nombre", read_only=True)
    profesional_nombre = serializers.SerializerMethodField()
    solicitante_nombre = serializers.SerializerMethodField()

    # Para asignar profesional desde el frontend, enviamos solo el id
    profesional_asignado_id = serializers.PrimaryKeyRelatedField(
        source="profesional_asignado",
        queryset=Profesional.objects.all(),
        write_only=True,
        required=False,
        allow_null=True,
    )

    # Para indicar quién solicitó la clase (usuario)
    solicitada_por_id = serializers.PrimaryKeyRelatedField(
        source="solicitada_por",
        queryset=User.objects.all(),
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Clase
        fields = [
            "id",
            "titulo",
            "descripcion",
            "fecha_solicitada",
            "modalidad",
            "estado",
            "cliente",
            "cliente_nombre",
            "solicitada_por",
            "solicitada_por_id",
            "solicitante_nombre",
            "profesional_asignado",
            "profesional_asignado_id",
            "profesional_nombre",
            "creado_en",
            "actualizado_en",
        ]

    def get_profesional_nombre(self, obj):
        if obj.profesional_asignado and obj.profesional_asignado.user:
            u = obj.profesional_asignado.user
            nombre = u.get_full_name() or u.username
            return nombre
        return None

    def get_solicitante_nombre(self, obj):
        if obj.solicitada_por:
            return obj.solicitada_por.get_full_name() or obj.solicitada_por.username
        return None

class RegistroClienteSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=4)
    first_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    last_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Este nombre de usuario ya existe.")
        return value

    def create(self, validated_data):
        username = validated_data["username"]
        password = validated_data.pop("password")

        user = User(
            username=username,
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            email=validated_data.get("email", ""),
        )
        user.set_password(password)
        user.save()

        # Crear perfil con rol CLIENTE
        UserProfile.objects.create(
            user=user,
            rol="CLIENTE",
        )

        return user

class ProfesionalAdminCreateSerializer(serializers.Serializer):
    # 🔹 Datos para CREAR (solo entrada, no se leen desde el modelo)
    username = serializers.CharField(max_length=150, write_only=True)
    password = serializers.CharField(write_only=True, min_length=4)
    first_name = serializers.CharField(max_length=150, write_only=True)
    last_name = serializers.CharField(max_length=150, write_only=True)
    email = serializers.EmailField(write_only=True)

    rut = serializers.CharField(
        max_length=20,
        allow_blank=True,
        required=False,
        write_only=True,
    )
    telefono = serializers.CharField(
        max_length=20,
        allow_blank=True,
        required=False,
        write_only=True,
    )
    direccion = serializers.CharField(
        max_length=255,
        allow_blank=True,
        required=False,
        write_only=True,
    )

    especialidad = serializers.CharField(
        max_length=150,
        allow_blank=True,
        required=False,
    )
    registro_profesional = serializers.CharField(
        max_length=50,
        allow_blank=True,
        required=False,
    )
    disponible = serializers.BooleanField(default=True)

    # 🔹 Datos SOLO LECTURA para la respuesta
    profesional_id = serializers.IntegerField(read_only=True, source="id")
    profesional_username = serializers.CharField(
        read_only=True, source="user.username"
    )

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Este nombre de usuario ya existe.")
        return value

    def create(self, validated_data):
        # Separar bloques de datos
        username = validated_data.pop("username")
        password = validated_data.pop("password")

        first_name = validated_data.pop("first_name", "")
        last_name = validated_data.pop("last_name", "")
        email = validated_data.pop("email", "")

        rut = validated_data.pop("rut", "")
        telefono = validated_data.pop("telefono", "")
        direccion = validated_data.pop("direccion", "")

        especialidad = validated_data.pop("especialidad", "")
        registro_profesional = validated_data.pop("registro_profesional", "")
        disponible = validated_data.pop("disponible", True)

        # 1) Crear usuario
        user = User(
            username=username,
            first_name=first_name,
            last_name=last_name,
            email=email,
        )
        user.set_password(password)
        user.save()

        # 2) Crear perfil con rol PROFESIONAL
        UserProfile.objects.create(
            user=user,
            rut=rut,
            telefono=telefono,
            direccion=direccion,
            rol="PROFESIONAL",
        )

        # 3) Crear registro Profesional
        profesional = Profesional.objects.create(
            user=user,
            especialidad=especialidad,
            registro_profesional=registro_profesional,
            disponible=disponible,
        )

        return profesional

    
class ProfesionalDetalleSerializer(serializers.ModelSerializer):
    # Campos del usuario
    username = serializers.CharField(source="user.username", read_only=True)
    first_name = serializers.CharField(source="user.first_name", required=False)
    last_name = serializers.CharField(source="user.last_name", required=False)
    email = serializers.EmailField(source="user.email", required=False)

    # Campos del perfil (UserProfile)
    rut = serializers.CharField(
        source="user.profile.rut",
        allow_blank=True,
        required=False,
    )
    telefono = serializers.CharField(
        source="user.profile.telefono",
        allow_blank=True,
        required=False,
    )
    direccion = serializers.CharField(
        source="user.profile.direccion",
        allow_blank=True,
        required=False,
    )

    class Meta:
        model = Profesional
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "rut",
            "telefono",
            "direccion",
            "especialidad",
            "registro_profesional",
            "disponible",
        ]

    def update(self, instance, validated_data):
        """
        Actualiza:
        - user.first_name, user.last_name, user.email
        - user.profile.rut, telefono, direccion
        - profesional.especialidad, registro_profesional, disponible
        """
        user_data = validated_data.pop("user", {})
        profile_data = user_data.pop("profile", {})

        user = instance.user

        # Actualizar datos de User
        for attr, value in user_data.items():
            setattr(user, attr, value)
        user.save()

        # Actualizar datos de UserProfile
        profile = getattr(user, "profile", None)
        if profile and profile_data:
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()

        # Actualizar campos del modelo Profesional
        return super().update(instance, validated_data)


