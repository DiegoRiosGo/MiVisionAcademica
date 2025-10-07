from django.shortcuts import render,redirect
from .supabase_client import supabase
# Create your views here.

from django.http import HttpResponse
from django.template import loader

def Inicio(request):
    registro_form = RegistroForm()
    login_form = LoginForm()
    return render(request, 'Menu/Inicio.html', {
        'registro_form': registro_form,
        'login_form': login_form
    })

# Vistas del alumno
def InicioAlumno(request):
    return render(request, 'Menu/vista_alumno/inicio_alumno.html')

def PerfilAlumno(request):
    return render(request, 'Menu/vista_alumno/perfil_alumno.html')

def EstadisticasAsignaturaAlumno(request):
    return render(request, 'Menu/vista_alumno/estadisticas_asignatura_alumno.html')

def TestInterestAlumno(request):
    return render(request, 'Menu/vista_alumno/test_interest_alumno.html')

def InformeAlumno(request):
    return render(request, 'Menu/vista_alumno/informe_alumno.html')

# Vistas de docente
def InicioDocente(request):
    return render(request, 'Menu/vista_docente/inicio_docente.html')

def PerfilDocente(request):
    return render(request, 'Menu/vista_docente/perfil_docente.html')

def RetroalimentacionDocente(request):
    return render(request, 'Menu/vista_docente/retroalimentacion_docente.html')


#=================================================
#Programación inicio
# Página de inicio con login y registro
from django.contrib import messages
from django.contrib.auth import login, logout
from .forms import RegistroForm, LoginForm
from .supabase_client import supabase  # conexión a Supabase

# ---------------------------------------------------------------------
# Página principal (vista base con los formularios)
# ---------------------------------------------------------------------
# ---------------------------------------------------------------------
# Registro de usuario
# ---------------------------------------------------------------------
def registrar_usuario(request):
    if request.method == 'POST':
        print(request.POST)  # 👈 esto mostrará los nombres exactos que llegan desde el HTML
        form = RegistroForm(request.POST)
        if form.is_valid():
            data = form.cleaned_data

            # Guardar en Supabase
            nuevo_usuario = {
                "nombre": data["nombre"],
                "apellido": data["apellido"],
                "correo": data["correo"],
                "contrasena_hash": data["contrasena_hash"],
                "rol": data["rol"]
            }

            supabase.table("usuario").insert(nuevo_usuario).execute()
            messages.success(request, "✅ Registro exitoso. Ya puedes iniciar sesión.")
            return redirect('Inicio')
        else:
            for error in form.errors.values():
                messages.error(request, error)
            return redirect('Inicio')
    else:
        messages.error(request, "Método no permitido.")
        return redirect('Inicio')


# ---------------------------------------------------------------------
# Inicio de sesión
# ---------------------------------------------------------------------
def iniciar_sesion(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            usuario = form.cleaned_data['usuario']

            # Guardar datos en sesión
            request.session['usuario_id'] = usuario['usuario_id']
            request.session['usuario_nombre'] = usuario['nombre']
            request.session['usuario_rol'] = usuario['rol']

            # Redirección según rol
            if usuario['rol'] == 1:
                messages.success(request, f"Bienvenido docente {usuario['nombre']}")
                return redirect('InicioDocente')
            elif usuario['rol'] == 2:
                messages.success(request, f"Bienvenido estudiante {usuario['nombre']}")
                return redirect('inicio_alumno')
            else:
                messages.warning(request, "Rol no identificado. Acceso limitado.")
                return redirect('Inicio')
        else:
            for error in form.errors.values():
                messages.error(request, error)
            return redirect('Inicio')
    else:
        return redirect('Inicio')


# ---------------------------------------------------------------------
# Cerrar sesión
# ---------------------------------------------------------------------
def cerrar_sesion(request):
    request.session.flush()
    messages.info(request, "Has cerrado sesión correctamente.")
    return redirect('Inicio')


















































