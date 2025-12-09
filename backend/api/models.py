from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    """
    Perfil extendido para cualquier usuario del sistema.
    Aquí definimos el rol y datos básicos de contacto.
    """
    ROLE_CHOICES = [
        ("ADMIN", "Administrador"),
        ("CLIENTE", "Cliente / Usuario"),
        ("PROFESIONAL", "Profesional"),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile",
        verbose_name="Usuario",
    )
    rut = models.CharField("RUT", max_length=20, blank=True)
    telefono = models.CharField("Teléfono", max_length=20, blank=True)
    direccion = models.CharField("Dirección", max_length=255, blank=True)
    rol = models.CharField(
        "Rol",
        max_length=20,
        choices=ROLE_CHOICES,
        default="CLIENTE",
        help_text="Define el tipo de usuario dentro del sistema.",
    )

    class Meta:
        verbose_name = "Perfil de Usuario"
        verbose_name_plural = "Perfiles de Usuario"

    def __str__(self):
        return f"{self.user.username} - {self.get_rol_display()}"


class Cliente(models.Model):
    """
    Cliente del sistema (empresa que contrata las clases).
    Opcionalmente puede estar vinculado a un usuario responsable.
    """
    nombre = models.CharField("Nombre de la empresa", max_length=150)
    rut = models.CharField("RUT Empresa", max_length=20, unique=True)
    direccion = models.CharField("Dirección", max_length=255, blank=True)
    telefono = models.CharField("Teléfono", max_length=20, blank=True)
    email = models.EmailField("Correo electrónico", blank=True)

    # Usuario responsable (opcional)
    usuario = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="clientes",
        verbose_name="Usuario responsable",
        help_text="Usuario que gestiona este cliente en el sistema.",
    )

    activo = models.BooleanField("Activo", default=True)
    creado_en = models.DateTimeField("Creado en", auto_now_add=True)
    actualizado_en = models.DateTimeField("Actualizado en", auto_now=True)

    class Meta:
        verbose_name = "Cliente"
        verbose_name_plural = "Clientes"
        ordering = ["nombre"]

    def __str__(self):
        return self.nombre


class Profesional(models.Model):
    """
    Profesional que dicta clases.
    Siempre está asociado a un usuario del sistema con rol PROFESIONAL.
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profesional",
        verbose_name="Usuario",
    )
    especialidad = models.CharField(
        "Especialidad",
        max_length=150,
        blank=True,
        help_text="Ej: Prevención de riesgos, Ergonomía, Seguridad industrial, etc.",
    )
    registro_profesional = models.CharField(
        "Registro profesional",
        max_length=50,
        blank=True,
        help_text="Número de registro o certificación (si aplica).",
    )
    disponible = models.BooleanField("Disponible", default=True)

    class Meta:
        verbose_name = "Profesional"
        verbose_name_plural = "Profesionales"
        ordering = ["user__username"]

    def __str__(self):
        nombre = self.user.get_full_name() or self.user.username
        return f"{nombre} ({'Disponible' if self.disponible else 'No disponible'})"


class Clase(models.Model):
    """
    Solicitud de clase / capacitación.
    Está ligada a un cliente, puede tener usuario solicitante
    y un profesional asignado.
    """
    ESTADOS = [
        ("PENDIENTE", "Pendiente"),
        ("ASIGNADA", "Asignada"),
        ("ACEPTADA", "Aceptada"),
        ("RECHAZADA", "Rechazada"),
        ("COMPLETADA", "Completada"),
    ]

    titulo = models.CharField("Título", max_length=200)
    descripcion = models.TextField("Descripción")
    fecha_solicitada = models.DateField(
        "Fecha solicitada",
        null=True,
        blank=True,
        help_text="Fecha en que el cliente desea realizar la clase.",
    )
    modalidad = models.CharField(
        "Modalidad",
        max_length=50,
        blank=True,
        help_text="Ej: Presencial, Online, Mixta, etc.",
    )

    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.CASCADE,
        related_name="clases",
        verbose_name="Cliente",
    )

    # Usuario del sistema que crea la solicitud (cliente/usuario)
    solicitada_por = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="clases_solicitadas",
        verbose_name="Solicitada por",
        help_text="Usuario que registra esta solicitud en el sistema.",
    )

    # Profesional que atiende la clase (apunta a Profesional, no a User)
    profesional_asignado = models.ForeignKey(
        Profesional,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="clases_asignadas",
        verbose_name="Profesional asignado",
        help_text="Profesional responsable de esta clase.",
    )

    estado = models.CharField(
        "Estado",
        max_length=20,
        choices=ESTADOS,
        default="PENDIENTE",
    )
    creado_en = models.DateTimeField("Creado en", auto_now_add=True)
    actualizado_en = models.DateTimeField("Actualizado en", auto_now=True)

    class Meta:
        verbose_name = "Clase"
        verbose_name_plural = "Clases"
        ordering = ["-creado_en"]

    def __str__(self):
        return f"{self.titulo} ({self.get_estado_display()})"
