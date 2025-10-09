import os
from django import template

register = template.Library()

@register.filter
def basename(value):
    """
    Devuelve solo el nombre del archivo a partir de una ruta completa.
    Ejemplo: 'pdf_notas/archivo123.pdf' → 'archivo123.pdf'
    """
    if value:
        return os.path.basename(value)
    return ""