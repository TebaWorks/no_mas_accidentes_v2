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


class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = "__all__"


class ProfesionalSerializer(serializers.ModelSerializer):
    # Lectura
    user_data = UserSerializer(source="user", read_only=True)
    # Escritura: solo enviar el id del usuario
    user_id = serializers.PrimaryKeyRelatedField(
        source="user",
        queryset=User.objects.all(),
        write_only=True,
    )

    class Meta:
        model = Profesional
        fields = [
            "id",
            "user_data",
            "user_id",
            "especialidad",
            "registro_profesional",
            "disponible",
        ]


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

