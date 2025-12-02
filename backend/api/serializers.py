from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Cliente, Profesional, Clase


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ["rut", "telefono", "rol"]


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer()

    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "email", "profile"]

    def create(self, validated_data):
        profile_data = validated_data.pop("profile", {})
        password = validated_data.pop("password", None)

        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()

        UserProfile.objects.create(user=user, **profile_data)
        return user

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("profile", {})
        profile = instance.profile

        for attr, value in validated_data.items():
            if attr == "password":
                instance.set_password(value)
            else:
                setattr(instance, attr, value)
        instance.save()

        for attr, value in profile_data.items():
            setattr(profile, attr, value)
        profile.save()

        return instance


class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = "__all__"


class ProfesionalSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Profesional
        fields = ["id", "user", "especialidad", "registro_profesional", "disponible"]


class ClaseSerializer(serializers.ModelSerializer):
    cliente_nombre = serializers.CharField(source="cliente.nombre", read_only=True)
    profesional_nombre = serializers.SerializerMethodField()
    solicitante_nombre = serializers.SerializerMethodField()

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
            "profesional_nombre",
            "creado_en",
            "actualizado_en",
        ]

    def get_profesional_nombre(self, obj):
        if obj.profesional_asignado:
            return obj.profesional_asignado.get_full_name() or obj.profesional_asignado.username
        return None

    def get_solicitante_nombre(self, obj):
        if obj.solicitada_por:
            return obj.solicitada_por.get_full_name() or obj.solicitada_por.username
        return None
