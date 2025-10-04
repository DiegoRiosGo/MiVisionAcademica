from django import forms
from django.contrib.auth.hashers import make_password, check_password
from .models import Usuario

class RegistroForm(forms.ModelForm):
    confirmar_contrasena = forms.CharField(
        widget=forms.PasswordInput(),
        label="Confirmar contraseña"
    )

    class Meta:
        model = Usuario
        fields = ['nombre', 'apellido', 'correo', 'contrasena_hash']
        widgets = {
            'contrasena_hash': forms.PasswordInput(),
        }
        labels = {
            'contrasena_hash': 'Contraseña',
        }

    def clean(self):
        cleaned_data = super().clean()
        correo = cleaned_data.get('correo')
        contrasena = cleaned_data.get('contrasena_hash')
        confirmar = self.cleaned_data.get('confirmar_contrasena')

        # ✅ Validar contraseñas iguales
        if contrasena != confirmar:
            raise forms.ValidationError("Las contraseñas no coinciden.")

        # ✅ Validar correo institucional y asignar rol
        if correo.endswith('@profesor.duoc.cl'):
            cleaned_data['rol'] = 1  # Docente
        elif correo.endswith('@duocuc.cl'):
            cleaned_data['rol'] = 2  # Estudiante
        else:
            raise forms.ValidationError("El correo debe ser institucional Duoc UC (@duocuc.cl o @profesor.duoc.cl).")

        # ✅ Encriptar la contraseña antes de guardar
        cleaned_data['contrasena_hash'] = make_password(contrasena)

        return cleaned_data

    def save(self, commit=True):
        usuario = super().save(commit=False)
        usuario.contrasena_hash = self.cleaned_data['contrasena_hash']
        usuario.rol = self.cleaned_data['rol']
        if commit:
            usuario.save()
        return usuario

#comentario abajo
class LoginForm(forms.Form):
    correo = forms.EmailField(label="Correo electrónico")
    contrasena = forms.CharField(widget=forms.PasswordInput(), label="Contraseña")

    def clean(self):
        cleaned_data = super().clean()
        correo = cleaned_data.get('correo')
        contrasena = cleaned_data.get('contrasena')

        try:
            usuario = Usuario.objects.get(correo=correo)
        except Usuario.DoesNotExist:
            raise forms.ValidationError("Correo no registrado en el sistema.")

        if not check_password(contrasena, usuario.contrasena_hash):
            raise forms.ValidationError("Contraseña incorrecta.")

        cleaned_data['usuario'] = usuario
        return cleaned_data
