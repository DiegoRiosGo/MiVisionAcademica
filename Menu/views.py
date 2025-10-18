from django.shortcuts import render,redirect
# Create your views here.
from .decorators import login_requerido, solo_docente, solo_alumno
from django.utils.timezone import now
import uuid  # 👈 para nombres únicos
import hashlib

# conexión a Supabase
from django.contrib import messages
from .forms import RegistroForm, LoginForm
from .supabase_client import supabase  

#lectura de pdf
from django.http import JsonResponse
from datetime import datetime
import base64, fitz, re, json, traceback

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

    except Exception as e:
        print("Error al obtener usuario:", e)
        messages.error(request, "Hubo un problema al cargar tu información.")
        return redirect('Inicio')

    # 3 Verificar que exista el estudiante  
    try:
        estudiante_resp = supabase.table("estudiante").select("*").eq("usuario_id", usuario_id).execute()
        if not estudiante_resp.data:
            # Crear el estudiante si no existe
            supabase.table("estudiante").insert({
                "usuario_id": usuario_id,
                "semestre_actual": None  # Puedes cambiarlo por un valor si lo tienes
            }).execute()
            print(f"Estudiante con usuario_id={usuario_id} creado automáticamente.")
    except Exception as e:
        print("Error al verificar/crear estudiante:", e)

    # 4 Si se subió un archivo PDF
    if request.method == "POST" and 'pdfFile' in request.FILES:
        archivo = request.FILES['pdfFile']

        if not archivo.name.lower().endswith('.pdf'):
            messages.error(request, "Solo se permiten archivos PDF.")
            return redirect('inicio_alumno')

        try:
            contenido = archivo.read()  # bytes
            # calcular hash (SHA-256) para detectar duplicados
            file_hash = hashlib.sha256(contenido).hexdigest()

            # buscar si ya existe ese hash
            existing = supabase.table("pdf_notas").select("pdf_id").eq("file_hash", file_hash).execute()
            if existing.data:
                messages.info(request, "Este archivo ya fue subido anteriormente.")
                return redirect('inicio_alumno')

            # crear nombre único pero legible 
            nombre_unico = f"informe_{usuario_id}_{uuid.uuid4().hex[:8]}.pdf"

            contenido_base64 = base64.b64encode(contenido).decode('utf-8')

            supabase.table("pdf_notas").insert({
                "estudiante_id": usuario_id,
                "ruta_archivo": contenido_base64,
                "fecha_subida": now().isoformat(),
                "nombre_archivo": nombre_unico,
                "file_hash": file_hash
            }).execute()

            messages.success(request, "Archivo subido correctamente.")
            return redirect('inicio_alumno')
            
        except Exception as e:
            print("Error al subir archivo:", e)
            messages.error(request, "Ocurrió un error al subir el archivo.")
            return redirect('inicio_alumno')

    # 5 Obtener lista de archivos del usuario
    try:
        pdfs = supabase.table("pdf_notas").select("*").eq("estudiante_id", usuario_id).order("fecha_subida", desc=True).execute()
        lista_pdfs = pdfs.data or []
    except Exception as e:
        print("Error al obtener archivos:", e)
        lista_pdfs = []

    # 6 Renderizar plantilla
    contexto = {
        "nombre": usuario.get("nombre", ""),
        "apellido": usuario.get("apellido", ""),
        "foto": usuario.get("foto", None),
        "pdfs": lista_pdfs,
    }

    return render(request, 'Menu/vista_alumno/inicio_alumno.html', contexto)

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

# ---------------------------------------------------------------------
# procesar pdf y guardarlos en bbdd
# ---------------------------------------------------------------------
@login_requerido
@solo_alumno
def procesar_y_guardar_pdf(request):
    """
    1️⃣ Obtiene el último PDF subido por el estudiante desde Supabase
    2️⃣ Lee y extrae su texto
    3️⃣ Procesa las asignaturas y notas mediante regex
    4️⃣ Guarda la información en las tablas 'asignatura' y 'nota'
    5️⃣ Devuelve resumen de guardado
    """
    usuario_id = request.session.get('usuario_id')
    if not usuario_id:
        return JsonResponse({"error": "Sesión inválida."}, status=403)

    try:
        # --- 1️⃣ Obtener el último PDF subido por el estudiante ---
        pdfs = supabase.table("pdf_notas").select("*").eq("estudiante_id", usuario_id).order("fecha_subida", desc=True).limit(1).execute()
        if not pdfs.data:
            return JsonResponse({"error": "No se encontró ningún PDF subido."}, status=404)

        pdf_data = pdfs.data[0]["ruta_archivo"]
        pdf_bytes = base64.b64decode(pdf_data)

        # --- 2️⃣ Extraer texto del PDF ---
        texto = ""
        with fitz.open(stream=pdf_bytes, filetype="pdf") as doc:
            for page in doc:
                texto += page.get_text("text")

        if not texto.strip():
            return JsonResponse({"error": "El PDF está vacío o no se pudo leer."}, status=422)

        # --- 3️⃣ Procesar el contenido con regex ---
        patron = re.compile(
            r"([A-Z]{3,4}\d{3,4})\s+\d+\s+([A-ZÁÉÍÓÚÑÜ0-9 ,\-/]+)\s+(\d+(?:,\d+)?)\s+[A-Z]\s+(\d)\s+(20\d{2})"
        )

        resultados = []
        for match in patron.finditer(texto):
            sigla = match.group(1)
            nombre = match.group(2).strip()
            nota = match.group(3).replace(",", ".")
            semestre = match.group(4)
            anio = match.group(5)

            resultados.append({
                "sigla": sigla,
                "nombre_asignatura": nombre.title(),
                "nota": float(nota) if nota.replace(".", "", 1).isdigit() else None,
                "semestre": int(semestre),
                "anio": int(anio)
            })

        if not resultados:
            return JsonResponse({"error": "No se pudieron extraer asignaturas del PDF."}, status=422)

        # --- 4️⃣ Guardar los resultados en Supabase ---
        guardados = 0
        duplicados = 0
        errores = []

        for r in resultados:
            nombre_asig = r["nombre_asignatura"]
            sigla = r["sigla"]
            nota = r["nota"]
            semestre = r["semestre"]
            anio = r["anio"]

            if not nombre_asig or nota is None:
                errores.append(f"Datos incompletos: {nombre_asig}")
                continue

            try:
                # Verificar o crear la asignatura
                asignatura_exist = supabase.table("asignatura").select("asignatura_id").eq("nombre_asignatura", nombre_asig).execute()
                if asignatura_exist.data:
                    asignatura_id = asignatura_exist.data[0]["asignatura_id"]
                else:
                    nueva_asig = {"nombre_asignatura": nombre_asig, "area": None}
                    nueva = supabase.table("asignatura").insert(nueva_asig).execute()
                    asignatura_id = nueva.data[0]["asignatura_id"]

                # Verificar si ya existe la nota
                existe_nota = supabase.table("nota").select("nota_id").eq("estudiante_id", usuario_id)\
                    .eq("asignatura_id", asignatura_id)\
                    .eq("semestre", semestre)\
                    .eq("acno", anio).execute()

                if existe_nota.data:
                    duplicados += 1
                    continue

                # Insertar la nota
                nueva_nota = {
                    "estudiante_id": usuario_id,
                    "asignatura_id": asignatura_id,
                    "semestre": semestre,
                    "acno": anio,
                    "calificacion": nota,
                    "sigla": sigla,
                    "fecha_registro": datetime.now().isoformat()
                }

                resultado = supabase.table("nota").insert(nueva_nota).execute()
                if resultado.data:
                    guardados += 1
                else:
                    errores.append(f"No se pudo guardar nota de {nombre_asig}")

            except Exception as e:
                errores.append(f"Error al guardar {nombre_asig}: {str(e)}")

        # --- 5️⃣ Respuesta final ---
        mensaje = f"✅ Guardados {guardados} nuevos registros. ⚠️ {duplicados} ya existían."
        if errores:
            mensaje += f" ❌ {len(errores)} con errores."

        return JsonResponse({
            "success": True,
            "mensaje": mensaje,
            "detalles": {
                "guardados": guardados,
                "duplicados": duplicados,
                "errores": errores
            },
            "data": resultados
        })

    except Exception as e:
        print("ERROR en procesar_y_guardar_pdf:", traceback.format_exc())
        return JsonResponse({"error": "Ocurrió un error interno al procesar y guardar el PDF."}, status=500)


# ---------------------------------------------------------------------
# crear gráficos
# ---------------------------------------------------------------------
@login_requerido
@solo_alumno
def estadisticas_notas_alumno(request):
    try:
        estudiante_id = request.GET.get("estudiante_id")
        if not estudiante_id:
            return JsonResponse({"error": "Falta el ID del estudiante"}, status=400)

        response = supabase.table("nota")\
            .select("acno, semestre, calificacion, nombre_asignatura, area")\
            .eq("estudiante_id", estudiante_id).execute()

        datos = response.data
        if not datos:
            return JsonResponse({"error": "No se encontraron notas"}, status=404)

        # --- Promedio por semestre ---
        promedios_semestre = {}
        for d in datos:
            clave = f"{d['acno']}-S{d['semestre']}"
            promedios_semestre.setdefault(clave, []).append(float(d["calificacion"]))
        promedios_semestre = {k: round(sum(v)/len(v), 2) for k, v in promedios_semestre.items()}

        # --- Promedio por área ---
        promedios_area = {}
        for d in datos:
            area = d["area"] or "Sin área"
            promedios_area.setdefault(area, []).append(float(d["calificacion"]))
        promedios_area = {k: round(sum(v)/len(v), 2) for k, v in promedios_area.items()}

        # --- Promedio por área y año ---
        area_anio = {}
        for d in datos:
            clave = (d["acno"], d["area"] or "Sin área")
            area_anio.setdefault(clave, []).append(float(d["calificacion"]))
        area_anio = {
            f"{anio}-{area}": round(sum(v)/len(v), 2)
            for (anio, area), v in area_anio.items()
        }

        return JsonResponse({
            "promedios_semestre": promedios_semestre,
            "promedios_area": promedios_area,
            "promedios_area_anio": area_anio
        })

    except Exception as e:
        print("Error en estadisticas_asignatura_alumno:", e)
        return JsonResponse({"error": str(e)}, status=500)


def api_estadisticas_alumno(request):
    try:
        usuario_id = request.session.get('usuario_id')
        if not usuario_id:
            return JsonResponse({"error": "Falta el ID del estudiante"}, status=400)

        response = supabase.table("nota")\
            .select("acno, semestre, calificacion, asignatura(nombre_asignatura, area)")\
            .eq("estudiante_id", usuario_id).execute()

        datos = response.data
        if not datos:
            return JsonResponse({"error": "No se encontraron notas"}, status=404)

        promedios_semestre = {}
        for d in datos:
            clave = f"{d['acno']}-S{d['semestre']}"
            promedios_semestre.setdefault(clave, []).append(float(d["calificacion"]))
        promedios_semestre = {k: round(sum(v)/len(v), 2) for k, v in promedios_semestre.items()}

        promedios_area = {}
        for d in datos:
            area = d["asignatura"]["area"] if d["asignatura"] else "Sin área"
            promedios_area.setdefault(area, []).append(float(d["calificacion"]))
        promedios_area = {k: round(sum(v)/len(v), 2) for k, v in promedios_area.items()}

        area_anio = {}
        for d in datos:
            area = d["asignatura"]["area"] if d["asignatura"] else "Sin área"
            clave = (d["acno"], area)
            area_anio.setdefault(clave, []).append(float(d["calificacion"]))
        area_anio = {
            f"{anio}-{area}": round(sum(v)/len(v), 2)
            for (anio, area), v in area_anio.items()
        }

        return JsonResponse({
            "promedios_semestre": promedios_semestre,
            "promedios_area": promedios_area,
            "promedios_area_anio": area_anio
        })
    except Exception as e:
        print("Error en api_estadisticas_alumno:", e)
        return JsonResponse({"error": str(e)}, status=500)
























