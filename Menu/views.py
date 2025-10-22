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

def api_estadisticas_alumno(request):
    try:
        usuario_id = request.session.get('usuario_id')
        if not usuario_id:
            return JsonResponse({"error": "Falta el ID del estudiante"}, status=400)

        # 🔹 Captura de filtros opcionales
        filtro_anio = request.GET.get("anio")
        filtro_area = request.GET.get("area")

        query = supabase.table("nota")\
            .select("acno, semestre, calificacion, asignatura(nombre_asignatura, area)")\
            .eq("estudiante_id", usuario_id)

        # 🔹 Aplicar filtros si existen
        if filtro_anio:
            query = query.eq("acno", int(filtro_anio))
        if filtro_area and filtro_area.lower() != "todas":
            query = query.eq("asignatura.area", filtro_area)

        response = query.execute()
        datos = response.data
        if not datos:
            return JsonResponse({"error": "No se encontraron notas"}, status=404)

        # 🔹 Listado dinámico de años y áreas disponibles
        anios_disponibles = sorted(list({d["acno"] for d in datos}))
        areas_disponibles = sorted(list({d["asignatura"]["area"] for d in datos if d["asignatura"]}))

        # 🔹 Cálculos de promedios
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
            "promedios_area_anio": area_anio,
            "anios": anios_disponibles,
            "areas": areas_disponibles
        })
    except Exception as e:
        print("Error en api_estadisticas_alumno:", e)
        return JsonResponse({"error": str(e)}, status=500)


import os
import json
import requests
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .decorators import login_requerido, solo_alumno
from datetime import datetime
from django.utils.timezone import now

@csrf_exempt
@login_requerido
@solo_alumno
def analizar_perfil_ia_free(request):
    usuario_id = request.session.get("usuario_id")
    if not usuario_id:
        return JsonResponse({"error": "Sesión inválida."}, status=403)

    # Obtener notas (igual que antes) …
    resp = supabase.table("nota") \
        .select("calificacion,semestre,acno,asignatura(nombre_asignatura,area),sigla") \
        .eq("estudiante_id", usuario_id).order("acno", desc=False).execute()
    notas = resp.data or []
    if not notas:
        return JsonResponse({"error": "No hay notas registradas."}, status=400)

    resumen_texto = "\n".join([
        f"{n.get('acno')} S{n.get('semestre')} | {n.get('sigla')} | "
        f"{n.get('asignatura', {}).get('nombre_asignatura','Desconocida')} | "
        f"area: {n.get('asignatura', {}).get('area','Sin área')} | nota: {n.get('calificacion')}"
        for n in notas
    ])

    # Construir prompt
    system_instruction = (
        "Eres un analista educativo. Analiza las notas del estudiante y responde **solo con un JSON válido**, sin explicaciones, sin comentarios, sin formato Markdown ni texto adicional. "
        "Usa este formato exacto: "
        "{\"fortalezas\":[],\"debilidades\":[],\"recomendaciones\":[],\"recomendaciones_laborales\":[],\"herramietas_de_mejora\":[],\"resumen_corto\":\"\",\"recomendaciones_recursos\":[]}"
    )
    user_prompt = (
        f"Historial académico:\n{resumen_texto}\n\n"
        "Analiza y devuelve en JSON exactamente como: "
        '{"fortalezas":[],"debilidades":[],"recomendaciones":[],"recomendaciones_laborales":[],"herramietas_de_mejora":[],"resumen_corto":"","recomendaciones_recursos":[]}'
    )

    # Llamar OpenRouter
    OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")
    if not OPENROUTER_API_KEY:
        return JsonResponse({"error": "OPENROUTER_API_KEY no configurada."}, status=500)

    url = "https://openrouter.ai/api/v1/chat/completions"
    payload = {
        "model": "mistralai/mistral-7b-instruct:free",  # ejemplo de modelo free
        "messages": [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.3,
        "max_tokens": 500
    }
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    try:
        r = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=30
        )
        r.raise_for_status()

        print("🟢 Respuesta completa IA:", r.text[:1000])  # 👈 muestra primeros 1000 caracteres

        data = r.json()
        content = data["choices"][0]["message"]["content"].strip()
        print("📄 Contenido IA:", content[:300])

        # 🧩 Limpieza del texto antes de intentar leer el JSON
        import re

        # Elimina tokens extra del modelo (como <s>, [/INST], ```json, ``` etc.)
        def extract_json_from_text(s):
            # Primero eliminar tokens comunes
            s = re.sub(r'(<s>|</s>|\[/?INST\]|```json|```|\\n\\n|\\n)', '', s)
            s = s.strip()
            # buscar primer '{' y hacer balance de llaves para extraer bloque JSON completo
            start = s.find('{')
            if start == -1:
                return None
            depth = 0
            for i in range(start, len(s)):
                if s[i] == '{':
                    depth += 1
                elif s[i] == '}':
                    depth -= 1
                    if depth == 0:
                        candidate = s[start:i+1]
                        try:
                            return json.loads(candidate)
                        except Exception:
                            # si falla, continuar buscando (por si hay otro bloque más adelante)
                            continue
            return None

        # use extractor
        content_raw = content if isinstance(content, str) else str(content)
        result_json = extract_json_from_text(content_raw)

        if result_json is None:
            # fallback heurístico: si el modelo devolvió algo legible, lo ponemos en resumen_corto
            cleaned = re.sub(r'\s+', ' ', content_raw).strip()
            result_json = {
                "fortalezas": [],
                "debilidades": [],
                "recomendaciones": [],
                "recomendaciones_laborales": [],
                "herramietas_de_mejora": [],
                "resumen_corto": cleaned,
                "recomendaciones_recursos": []
            }

    except Exception as e:
        print("❌ Error al llamar IA gratuita:", e)
        return JsonResponse({"error": "Error al generar análisis IA."}, status=500)

    # Devolver resultado al front sin guardar aún
    return JsonResponse({"success": True, "analisis": result_json})


from io import BytesIO
from django.http import HttpResponse
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, ListFlowable, ListItem
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

@login_requerido
@solo_alumno
def generar_pdf_informe(request):
    """
    Genera un PDF con los resultados del análisis IA (sin guardarlo aún).
    Recibe los datos en formato JSON desde el frontend.
    """
    if request.method != "POST":
        return JsonResponse({"error": "Método no permitido."}, status=405)

    try:
        data = json.loads(request.body.decode("utf-8"))
        analisis = data.get("analisis", {})
    except Exception as e:
        print("⚠️ Error leyendo datos del análisis:", e)
        return JsonResponse({"error": "Datos inválidos."}, status=400)

    # Configurar PDF
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    contenido = []

    # Estilos personalizados
    titulo = ParagraphStyle("Titulo", parent=styles["Heading1"], alignment=1, textColor=colors.HexColor("#004aad"))
    subtitulo = ParagraphStyle("Subtitulo", parent=styles["Heading2"], textColor=colors.HexColor("#003366"))
    normal = styles["Normal"]

    contenido.append(Paragraph("Informe de Análisis Académico", titulo))
    contenido.append(Spacer(1, 12))

    if analisis.get("resumen_corto"):
        contenido.append(Paragraph("<b>Resumen:</b> " + analisis["resumen_corto"], normal))
        contenido.append(Spacer(1, 12))

    def add_section(title, items, color="#004aad"):
        if items:
            contenido.append(Paragraph(f"<b><font color='{color}'>{title}</font></b>", subtitulo))
            lista = ListFlowable([ListItem(Paragraph(i, normal)) for i in items], bulletType="bullet")
            contenido.append(lista)
            contenido.append(Spacer(1, 10))

    add_section("Fortalezas", analisis.get("fortalezas", []), "#1E8449")
    add_section("Debilidades", analisis.get("debilidades", []), "#C0392B")
    add_section("Recomendaciones Académicas", analisis.get("recomendaciones", []), "#2471A3")
    add_section("Recomendaciones Laborales", analisis.get("recomendaciones_laborales", []), "#8E44AD")
    add_section("Herramientas de Mejora", analisis.get("herramietas_de_mejora", []), "#D68910")
    add_section("Recursos Recomendados", analisis.get("recomendaciones_recursos", []), "#117864")

    doc.build(contenido)

    # Retornar PDF como descarga
    buffer.seek(0)
    response = HttpResponse(buffer, content_type="application/pdf")
    response["Content-Disposition"] = 'attachment; filename="informe_academico.pdf"'
    return response



from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import base64, hashlib, uuid
from django.utils.timezone import now

@login_requerido
@solo_alumno
@csrf_exempt
def guardar_reporte_pdf(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "error": "Método no permitido."}, status=405)
    try:
        # leer JSON body
        try:
            payload = json.loads(request.body.decode('utf-8'))
        except Exception:
            return JsonResponse({"success": False, "error": "Payload inválido (no JSON)."}, status=400)

        pdf_base64 = payload.get("pdfBase64")
        nombre_reporte = payload.get("nombreReporte")  # puede venir null

        usuario_id = request.session.get("usuario_id")
        if not usuario_id:
            return JsonResponse({"success": False, "error": "Sesión inválida."}, status=403)

        if not pdf_base64:
            return JsonResponse({"success": False, "error": "No se recibió el archivo PDF."}, status=400)

        # decodificar a bytes y calcular hash
        try:
            pdf_bytes = base64.b64decode(pdf_base64)
        except Exception as e:
            return JsonResponse({"success": False, "error": "Base64 inválido."}, status=400)

        file_hash = hashlib.sha256(pdf_bytes).hexdigest()

        # verificar duplicado por hash en file_reporte
        existing = supabase.table("reporte").select("reporte_id").eq("file_reporte", file_hash).execute()
        if existing.data:
            return JsonResponse({"success": False, "error": "Este informe ya existe en la base de datos."}, status=409)

        # generar nombre si no viene
        if not nombre_reporte:
            # obtener nombre y apellido del usuario
            resp_user = supabase.table("usuario").select("nombre,apellido").eq("usuario_id", usuario_id).execute()
            nombre = ""
            apellido = ""
            if resp_user.data:
                nombre = resp_user.data[0].get("nombre", "").replace(" ", "_")
                apellido = resp_user.data[0].get("apellido", "").replace(" ", "_")
            fecha = now().date().isoformat()
            short = uuid.uuid4().hex[:6]
            nombre_reporte = f"Informe_{nombre}_{apellido}_{fecha}_{short}.pdf"

        # almacenar en la tabla reporte
        supabase.table("reporte").insert({
            "estudiante_id": usuario_id,
            "ruta_contenido": pdf_base64,
            "fecha_generado": now().isoformat(),
            "nombre_reporte": nombre_reporte,
            "file_reporte": file_hash
        }).execute()

        return JsonResponse({"success": True, "nombre_reporte": nombre_reporte})

    except Exception as e:
        print("❌ Error guardar_reporte_pdf:", e)
        return JsonResponse({"success": False, "error": "Error interno al guardar el informe."}, status=500)


