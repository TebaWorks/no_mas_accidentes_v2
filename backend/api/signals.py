from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.contrib.auth.models import User

from .models import UserProfile


@receiver(post_migrate)
def crear_usuarios_por_defecto(sender, **kwargs):
  """
  Crea usuarios admin por defecto si no existen:
  - admin / admin
  - admin_2 / admin_2
  Solo se ejecuta cuando se migran modelos de la app 'api'.
  """
  if sender.name != "api":
      return

  usuarios_admin = [
      ("admin", "admin"),
      ("admin_2", "admin_2"),
  ]

  for username, password in usuarios_admin:
      if not User.objects.filter(username=username).exists():
          user = User.objects.create_superuser(
              username=username,
              email=f"{username}@nomasaccidentes.local",
              password=password,
          )
          # Crear/actualizar perfil con rol ADMIN
          UserProfile.objects.update_or_create(
              user=user,
              defaults={"rol": "ADMIN"},
          )
          print(f"⚙️ Usuario admin creado: {username}")
