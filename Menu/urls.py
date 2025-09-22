from django.urls import path
from .views import Inicio

urlpatterns = [
    path('',Inicio,name="Inicio"),
]