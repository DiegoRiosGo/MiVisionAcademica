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
    path('leer_pdf/', views.leer_pdf, name='leer_pdf'),
    path('procesar_y_guardar_pdf/', views.procesar_y_guardar_pdf, name='procesar_y_guardar_pdf'),
] 