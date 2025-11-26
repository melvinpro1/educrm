#!/usr/bin/env python
"""
Script para eliminar todos los estudiantes y encargados de la base de datos.
"""
import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edubackend.settings')
django.setup()

from estudiantes.models import Estudiante, Encargado

def reset_tables():
    """Elimina todos los registros de estudiantes y encargados"""
    
    # Contar registros antes
    estudiantes_count = Estudiante.objects.count()
    encargados_count = Encargado.objects.count()
    
    print(f"\n📊 Registros actuales:")
    print(f"   - Estudiantes: {estudiantes_count}")
    print(f"   - Encargados: {encargados_count}")
    
    if estudiantes_count == 0 and encargados_count == 0:
        print("\n✅ Las tablas ya están vacías.")
        return
    
    # Confirmar acción
    confirmacion = input("\n⚠️  ¿Estás seguro de que quieres eliminar TODOS los registros? (escribe 'SI' para confirmar): ")
    
    if confirmacion.upper() != 'SI':
        print("\n❌ Operación cancelada.")
        return
    
    # Eliminar todos los estudiantes (esto también eliminará encargados huérfanos por cascade)
    print("\n🗑️  Eliminando estudiantes...")
    Estudiante.objects.all().delete()
    
    # Eliminar encargados restantes (por si quedó alguno)
    print("🗑️  Eliminando encargados...")
    Encargado.objects.all().delete()
    
    print("\n✅ Todas las tablas han sido vaciadas correctamente.")
    print("   Ahora puedes empezar a crear nuevos registros.\n")

if __name__ == '__main__':
    reset_tables()
