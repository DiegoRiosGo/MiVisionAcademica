from django.shortcuts import render,redirect

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
from .models import Usuario
from .forms import RegistroForm, LoginForm

# ---------------------------------------------------------------------
# Página principal (vista base con los formularios)
# ---------------------------------------------------------------------

# ---------------------------------------------------------------------
# Registro de usuario
# ---------------------------------------------------------------------
def registrar_usuario(request):
    if request.method == 'POST':
        form = RegistroForm(request.POST)
        if form.is_valid():
            form.save()
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
            request.session['usuario_id'] = usuario.id
            request.session['usuario_nombre'] = usuario.nombre
            request.session['usuario_rol'] = usuario.rol

            # Redirección según rol
            if usuario.rol == 1:
                messages.success(request, f"Bienvenido docente {usuario.nombre}")
                return redirect('InicioDocente')  # Cambia según tu vista real
            elif usuario.rol == 2:
                messages.success(request, f"Bienvenido estudiante {usuario.nombre}")
                return redirect('inicio_alumno')  # Cambia según tu vista real
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
    request.session.flush()  # Borra todos los datos de sesión
    messages.info(request, "Has cerrado sesión correctamente.")
    return redirect('Inicio')
