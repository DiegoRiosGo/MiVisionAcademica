from django.shortcuts import render,redirect
# Create your views here.
import base64
import os
from datetime import datetime
from django.conf import settings
from .decorators import login_requerido, solo_docente, solo_alumno


def Inicio(request):
    # Si existe sesión previa, se limpia
    if 'usuario_id' in request.session:
        request.session.flush()

    registro_form = RegistroForm()
    login_form = LoginForm()
    return render(request, 'Menu/Inicio.html', {
        'registro_form': registro_form,
        'login_form': login_form
    })


# ---------------------------------------------------------------------
# Vistas del alumno
# ---------------------------------------------------------------------
@login_requerido
@solo_alumno
def InicioAlumno(request):
    # 1 Obtener el ID del usuario desde la sesión
    usuario_id = request.session.get('usuario_id')

    # 2 Buscar la información completa del usuario en Supabase
    try:
        response = supabase.table("usuario").select("*").eq("usuario_id", usuario_id).execute()
        if not response.data:
            messages.error(request, "No se encontró la información del usuario.")
            return redirect('Inicio')

        usuario = response.data[0]

        # ======== SUBIR ARCHIVO PDF ========
        if request.method == "POST" and 'pdfFile' in request.FILES:
            pdf_file = request.FILES['pdfFile']

            # Validar extensión del archivo
            if not pdf_file.name.lower().endswith('.pdf'):
                messages.error(request, "Solo se permiten archivos en formato PDF.")
                return redirect('inicio_alumno')

            # Crear carpeta local de subida (si no existe)
            upload_dir = os.path.join(settings.MEDIA_ROOT, 'pdf_notas')
            os.makedirs(upload_dir, exist_ok=True)

            # Crear nombre único con timestamp
            filename = f"{usuario_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}.pdf"
            file_path = os.path.join(upload_dir, filename)

            # Guardar archivo localmente
            with open(file_path, 'wb+') as destination:
                for chunk in pdf_file.chunks():
                    destination.write(chunk)

            # Guardar en Supabase
            ruta_guardada = f"pdf_notas/{filename}"
            fecha_subida = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

            supabase.table("pdf_notas").insert({
                "estudiante_id": usuario_id,
                "ruta_archivo": ruta_guardada,
                "fecha_subida": fecha_subida
            }).execute()

            messages.success(request, "Archivo PDF subido correctamente.")
            return redirect('inicio_alumno')

        # ======== CONSULTAR ARCHIVOS EXISTENTES ========
        pdfs_response = supabase.table("pdf_notas").select("*").eq("estudiante_id", usuario_id).order("fecha_subida", desc=True).execute()
        pdfs = pdfs_response.data if pdfs_response.data else []

        # ======== CONTEXTO ========
        contexto = {
            "nombre": usuario.get("nombre", ""),
            "apellido": usuario.get("apellido", ""),
            "foto": usuario.get("foto", None),
            "pdfs": pdfs,
        }

        return render(request, 'Menu/vista_alumno/inicio_alumno.html', contexto)

    except Exception as e:
        print("Error al cargar InicioAlumno:", e)
        messages.error(request, "Hubo un problema al cargar tu información.")
        return redirect('Inicio')

@login_requerido
@solo_alumno
def PerfilAlumno(request):
    # 1 Obtener el ID del usuario desde la sesión
    usuario_id = request.session.get('usuario_id')

    # 2 Si viene un archivo (actualización de foto)
    if request.method == 'POST' and 'foto_perfil' in request.FILES:
        foto_file = request.FILES['foto_perfil']
        try:
            # Leer bytes y convertir a base64
            file_bytes = foto_file.read()
            foto_base64 = base64.b64encode(file_bytes).decode('utf-8')

            # Guardar en Supabase (en columna foto)
            supabase.table("usuario").update({"foto": foto_base64}).eq("usuario_id", usuario_id).execute()

            messages.success(request, "Tu foto de perfil fue actualizada correctamente.")
            return redirect('perfil_alumno')

        except Exception as e:
            print("❌ Error al guardar la foto:", e)
            messages.error(request, "Hubo un problema al actualizar la foto. Intenta nuevamente.")
            
    # 3 Obtener los datos del usuario
    try:
        response = supabase.table("usuario").select("*").eq("usuario_id", usuario_id).execute()
        if not response.data:
            messages.error(request, "No se encontró la información del usuario.")
            return redirect('Inicio')

        usuario = response.data[0]

        contexto = {
            "nombre": usuario.get("nombre", ""),
            "apellido": usuario.get("apellido", ""),
            "correo": usuario.get("correo", ""),
            "foto": usuario.get("foto", None),
        }
        return render(request, 'Menu/vista_alumno/perfil_alumno.html', contexto)
    
    except Exception as e:
        print("Error al obtener usuario:", e)
        messages.error(request, "Hubo un error al cargar tu perfil.")
        return redirect('Inicio')

@login_requerido
@solo_alumno
def EstadisticasAsignaturaAlumno(request):
    # 1 Obtener el ID del usuario desde la sesión
    usuario_id = request.session.get('usuario_id')

    # 2 Buscar la información completa del usuario en Supabase
    try:
        response = supabase.table("usuario").select("*").eq("usuario_id", usuario_id).execute()
        if not response.data:
            messages.error(request, "No se encontró la información del usuario.")
            return redirect('Inicio')

        usuario = response.data[0]

        # 3 Preparar los datos para el template
        contexto = {
            "nombre": usuario.get("nombre", ""),
            "apellido": usuario.get("apellido", ""),
            "foto": usuario.get("foto", None),  # puede ser None si no tiene imagen
        }

        return render(request, 'Menu/vista_alumno/estadisticas_asignatura_alumno.html', contexto)

    except Exception as e:
        print("Error al obtener usuario:", e)
        messages.error(request, "Hubo un problema al cargar tu información.")
        return redirect('Inicio')

@login_requerido
@solo_alumno
def TestInterestAlumno(request):
    # 1 Obtener el ID del usuario desde la sesión
    usuario_id = request.session.get('usuario_id')

    # 2 Buscar la información completa del usuario en Supabase
    try:
        response = supabase.table("usuario").select("*").eq("usuario_id", usuario_id).execute()
        if not response.data:
            messages.error(request, "No se encontró la información del usuario.")
            return redirect('Inicio')

        usuario = response.data[0]

        # 3 Preparar los datos para el template
        contexto = {
            "nombre": usuario.get("nombre", ""),
            "apellido": usuario.get("apellido", ""),
            "foto": usuario.get("foto", None),  # puede ser None si no tiene imagen
        }

        return render(request, 'Menu/vista_alumno/test_interest_alumno.html', contexto)

    except Exception as e:
        print("Error al obtener usuario:", e)
        messages.error(request, "Hubo un problema al cargar tu información.")
        return redirect('Inicio')

@login_requerido
@solo_alumno
def InformeAlumno(request):
    # 1 Obtener el ID del usuario desde la sesión
    usuario_id = request.session.get('usuario_id')

    # 2 Buscar la información completa del usuario en Supabase
    try:
        response = supabase.table("usuario").select("*").eq("usuario_id", usuario_id).execute()
        if not response.data:
            messages.error(request, "No se encontró la información del usuario.")
            return redirect('Inicio')

        usuario = response.data[0]

        # 3 Preparar los datos para el template
        contexto = {
            "nombre": usuario.get("nombre", ""),
            "apellido": usuario.get("apellido", ""),
            "foto": usuario.get("foto", None),  # puede ser None si no tiene imagen
        }

        return render(request, 'Menu/vista_alumno/informe_alumno.html', contexto)

    except Exception as e:
        print("Error al obtener usuario:", e)
        messages.error(request, "Hubo un problema al cargar tu información.")
        return redirect('Inicio')


# ---------------------------------------------------------------------
# Vistas de docente
# ---------------------------------------------------------------------

@login_requerido
@solo_docente
def InicioDocente(request):
    # 1 Obtener el ID del usuario desde la sesión
    usuario_id = request.session.get('usuario_id')

    # 2 Buscar la información completa del usuario en Supabase
    try:
        response = supabase.table("usuario").select("*").eq("usuario_id", usuario_id).execute()
        if not response.data:
            messages.error(request, "No se encontró la información del usuario.")
            return redirect('Inicio')

        usuario = response.data[0]

        # 3 Preparar los datos para el template
        contexto = {
            "nombre": usuario.get("nombre", ""),
            "apellido": usuario.get("apellido", ""),
            "foto": usuario.get("foto", None),  # puede ser None si no tiene imagen
        }

        return render(request, 'Menu/vista_docente/inicio_docente.html', contexto)

    except Exception as e:
        print("Error al obtener usuario:", e)
        messages.error(request, "Hubo un problema al cargar tu información.")
        return redirect('Inicio')


@login_requerido
@solo_docente
def PerfilDocente(request):
    # 1 Obtener el ID del usuario desde la sesión
    usuario_id = request.session.get('usuario_id')

    # 2 Si viene un archivo (actualización de foto)
    if request.method == 'POST' and 'foto_perfil' in request.FILES:
        foto_file = request.FILES['foto_perfil']
        try:
            # Leer bytes y convertir a base64
            file_bytes = foto_file.read()
            foto_base64 = base64.b64encode(file_bytes).decode('utf-8')

            # Guardar en Supabase (en columna foto)
            supabase.table("usuario").update({"foto": foto_base64}).eq("usuario_id", usuario_id).execute()

            messages.success(request, "Tu foto de perfil fue actualizada correctamente.")
            return redirect('perfil_alumno')

        except Exception as e:
            print("❌ Error al guardar la foto:", e)
            messages.error(request, "Hubo un problema al actualizar la foto. Intenta nuevamente.")
            
    # 3 Obtener los datos del usuario
    try:
        response = supabase.table("usuario").select("*").eq("usuario_id", usuario_id).execute()
        if not response.data:
            messages.error(request, "No se encontró la información del usuario.")
            return redirect('Inicio')

        usuario = response.data[0]

        contexto = {
            "nombre": usuario.get("nombre", ""),
            "apellido": usuario.get("apellido", ""),
            "correo": usuario.get("correo", ""),
            "foto": usuario.get("foto", None),
        }
        return render(request, 'Menu/vista_docente/perfil_docente.html', contexto)
    
    except Exception as e:
        print("Error al obtener usuario:", e)
        messages.error(request, "Hubo un error al cargar tu perfil.")
        return redirect('Inicio')

@login_requerido
@solo_docente
def RetroalimentacionDocente(request):
    # 1 Obtener el ID del usuario desde la sesión
    usuario_id = request.session.get('usuario_id')

    # 2 Buscar la información completa del usuario en Supabase
    try:
        response = supabase.table("usuario").select("*").eq("usuario_id", usuario_id).execute()
        if not response.data:
            messages.error(request, "No se encontró la información del usuario.")
            return redirect('Inicio')

        usuario = response.data[0]

        # 3 Preparar los datos para el template
        contexto = {
            "nombre": usuario.get("nombre", ""),
            "apellido": usuario.get("apellido", ""),
            "foto": usuario.get("foto", None),  # puede ser None si no tiene imagen
        }

        return render(request, 'Menu/vista_docente/retroalimentacion_docente.html', contexto)

    except Exception as e:
        print("Error al obtener usuario:", e)
        messages.error(request, "Hubo un problema al cargar tu información.")
        return redirect('Inicio')


#=================================================
#Programación inicio
# Página de inicio con login y registro
from django.contrib import messages
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


















































