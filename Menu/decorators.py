from django.shortcuts import redirect
from django.contrib import messages

# --- Decorador para verificar inicio de sesión ---
def login_requerido(view_func):
    def wrapper(request, *args, **kwargs):
        if 'usuario_id' not in request.session:
            messages.warning(request, "Debes iniciar sesión para acceder a esta página.")
            return redirect('Inicio')
        return view_func(request, *args, **kwargs)
    return wrapper


# --- Decorador para permitir solo docentes ---
def solo_docente(view_func):
    def wrapper(request, *args, **kwargs):
        if request.session.get('usuario_rol') != 1:
            messages.error(request, "No tienes permisos para acceder a esta sección (solo docentes).")
            return redirect('inicio_alumno')
        return view_func(request, *args, **kwargs)
    return wrapper


# --- Decorador para permitir solo alumnos ---
def solo_alumno(view_func):
    def wrapper(request, *args, **kwargs):
        if request.session.get('usuario_rol') != 2:
            messages.error(request, "No tienes permisos para acceder a esta sección (solo estudiantes).")
            return redirect('InicioDocente')
        return view_func(request, *args, **kwargs)
    return wrapper