from supabase import create_client
from decouple import config

SUPABASE_URL = config("SUPABASE_URL")
SUPABASE_KEY = config("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


# Probar conexión con una tabla existente
try:
    response = supabase.table("usuario").select("*").limit(1).execute()
    print("✅ Conexión exitosa a Supabase.")
    print("Resultado de prueba:", response.data)
except Exception as e:
    print("❌ Error al conectar con Supabase:")
    print(e)
