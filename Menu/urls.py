from django.urls import path
from .views import Inicio,InicioAlumno,PerfilAlumno,EstadisticasAsignaturaAlumno,TestInterestAlumno,InformeAlumno

urlpatterns = [
    path('',Inicio,name="Inicio"),

    # URLS del alumno
    path('inicio_alumno/', InicioAlumno, name="inicio_alumno"),
    path('perfil_alumno/', PerfilAlumno, name="perfil_alumno"),
    path('estadisticas_asignatura_alumno/', EstadisticasAsignaturaAlumno, name="estadisticas_asignatura_alumno"),
    path('test_interest_alumno/', TestInterestAlumno, name="test_interest_alumno"),
    path('informe_alumno/', InformeAlumno, name="informe_alumno"),



]