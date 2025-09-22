from django.shortcuts import render

# Create your views here.

from django.http import HttpResponse
from django.template import loader

def Inicio(request):
    return render(request,'Menu/Inicio.html')