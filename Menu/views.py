from django.shortcuts import render

# Create your views here.

from django.http import HttpResponse
from django.template import loader

def Inicio(request):
    return render(request,'Menu/Inicio.html')

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


