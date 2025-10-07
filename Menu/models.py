from django.db import models

# Create your models here.
from django.db import models
from django.utils import timezone
from django.contrib.auth.hashers import make_password, check_password

class Usuario(models.Model):
    ROLES = (
        (1, "Docente"),
        (2, "Estudiante"),
    )

    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    correo = models.EmailField(unique=True)
    contrasena_hash = models.CharField(max_length=255)
    rol = models.IntegerField(choices=ROLES, null=True, blank=True)
    foto = models.ImageField(upload_to='fotos_perfil/', null=True, blank=True)
    fecha_creacion = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.nombre} {self.apellido} ({self.get_rol_display()})"
    
    class Meta:
        db_table = 'usuario'
        managed = False
    
