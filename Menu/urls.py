from django.urls import path
from .views import Inicio,InicioAlumno,PerfilAlumno,EstadisticasAsignaturaAlumno,TestInterestAlumno,InformeAlumno,InicioDocente,PerfilDocente,RetroalimentacionDocente
from . import views


urlpatterns = [
    path('',Inicio,name="Inicio"),

    # URLS del alumno
    path('inicio_alumno/', InicioAlumno, name="inicio_alumno"),
    path('perfil_alumno/', PerfilAlumno, name="perfil_alumno"),
    path('estadisticas_asignatura_alumno/', EstadisticasAsignaturaAlumno, name="estadisticas_asignatura_alumno"),
    path('test_interest_alumno/', TestInterestAlumno, name="test_interest_alumno"),
    path('informe_alumno/', InformeAlumno, name="informe_alumno"),

    # URLS del docente
    path('inicio_docente/', InicioDocente, name="InicioDocente"),
    path('perfil_docente/', PerfilDocente, name="PerfilDocente"),
    path('retroalimentacion_docente/', RetroalimentacionDocente, name="RetroalimentacionDocente"),

    #URL Programación
    path("registro/", views.registrar_usuario, name="registro"),
    path("login/", views.iniciar_sesion, name="login"),
    path("logout/", views.cerrar_sesion, name="logout"),
    path('procesar_y_guardar_pdf/', views.procesar_y_guardar_pdf, name='procesar_y_guardar_pdf'),
    path('api/estadisticas_alumno/', views.api_estadisticas_alumno, name='api_estadisticas_alumno'),

    #URL Programación IA y PDF
    path("analizar_perfil_ia_free/", views.analizar_perfil_ia_free, name="analizar_perfil_ia_free"),
    path('generar_pdf_informe/', views.generar_pdf_informe, name='generar_pdf_informe'),
    path('guardar_reporte_pdf/', views.guardar_reporte_pdf, name='guardar_reporte_pdf'),

    #URL Programación Retroalimentación docente
    path('obtener_asignaturas/', views.obtener_asignaturas, name='obtener_asignaturas'),
    path('obtener_siglas/', views.obtener_siglas, name='obtener_siglas'),
    path('obtener_estudiantes/', views.obtener_estudiantes, name='obtener_estudiantes'),
    path('guardar_comentario_docente/', views.guardar_comentario_docente, name='guardar_comentario_docente'),
    path('obtener_areas/', views.obtener_areas, name='obtener_areas'),
] 