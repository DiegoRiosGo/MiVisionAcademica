from django import forms
from django.contrib.auth.hashers import make_password, check_password
import re
from .supabase_client import supabase

class RegistroForm(forms.Form):
    nombre = forms.CharField(max_length=100, label="Nombre")
    apellido = forms.CharField(max_length=100, label="Apellido")
    correo = forms.EmailField(label="Correo electrónico")
    contrasena = forms.CharField(widget=forms.PasswordInput(), label="Contraseña")
    confirmar_contrasena = forms.CharField(widget=forms.PasswordInput(), label="Confirmar contraseña")

    def clean(self):
        cleaned_data = super().clean()
        correo = cleaned_data.get('correo')
        contrasena = cleaned_data.get('contrasena')
        confirmar = cleaned_data.get('confirmar_contrasena')

        # Validar contraseñas iguales
        if contrasena != confirmar:
            raise forms.ValidationError("Las contraseñas no coinciden.")

         # ==========================
        # 2️⃣ Validar fuerza de contraseña
        # ==========================
        # Mínimo 8 caracteres
        if len(contrasena) < 8:
            raise forms.ValidationError("La contraseña debe tener al menos 8 caracteres.")

        # Debe contener al menos una mayúscula
        if not re.search(r"[A-Z]", contrasena):
            raise forms.ValidationError("La contraseña debe contener al menos una letra mayúscula.")

        # Debe contener al menos una minúscula
        if not re.search(r"[a-z]", contrasena):
            raise forms.ValidationError("La contraseña debe contener al menos una letra minúscula.")

        # Debe contener al menos un número
        if not re.search(r"[0-9]", contrasena):
            raise forms.ValidationError("La contraseña debe contener al menos un número.")

        if not re.search(r"[!@#$%^&*(),.?\":{}|<>_\-+=/;~]", contrasena):
            raise forms.ValidationError(
                "La contraseña debe contener al menos un carácter especial (por ejemplo, @, #, $, %, !, ? o -).")
        
        # Validar correo institucional
        if correo.endswith('@profesor.duoc.cl'):
            rol = 1
        elif correo.endswith('@duoc.cl'):
            rol = 1
        elif correo.endswith('@duocuc.cl'):
            rol = 2
        else:
            raise forms.ValidationError(
                "El correo debe ser institucional de Duoc UC que encontrara en el signo de pregunta al lado del formulario de correo electronico")

        # Validar si ya existe
        existing_user = supabase.table("usuario").select("*").eq("correo", correo).execute()
        if existing_user.data:
            raise forms.ValidationError("El correo ya está registrado.")

        # Guardar datos procesados
        cleaned_data['rol'] = rol
        cleaned_data['contrasena_hash'] = make_password(contrasena)
        return cleaned_data


class LoginForm(forms.Form):
    correo = forms.EmailField(label="Correo electrónico")
    contrasena = forms.CharField(widget=forms.PasswordInput(), label="Contraseña")

    def clean(self):
        cleaned_data = super().clean()
        correo = cleaned_data.get('correo')
        contrasena = cleaned_data.get('contrasena')

        # Buscar usuario en Supabase
        response = supabase.table("usuario").select("*").eq("correo", correo).execute()

        if not response.data:
            raise forms.ValidationError("Correo no registrado en el sistema.")

        usuario = response.data[0]
        if not check_password(contrasena, usuario["contrasena_hash"]):
            raise forms.ValidationError("Contraseña incorrecta.")

        cleaned_data['usuario'] = usuario
        return cleaned_data
