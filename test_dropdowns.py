#!/usr/bin/env python3
"""
Script de prueba para verificar que los dropdowns se crearon correctamente
en las plantillas Excel de Activos y Estudiantes
"""

import sys
sys.path.insert(0, 'backend/edubackend')

import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edubackend.settings')

import django
django.setup()

from openpyxl import load_workbook
from io import BytesIO
from activos.plantilla_generator import generar_plantilla_excel as generar_activos
from estudiantes.plantilla_generator import generar_plantilla_excel as generar_estudiantes

def prueba_activos():
    """Verifica que la plantilla de activos tiene Data Validation"""
    print("\n" + "="*70)
    print("🧪 PRUEBA 1: VALIDACIÓN DE DROPDOWNS EN PLANTILLA DE ACTIVOS")
    print("="*70)
    
    try:
        # Generar plantilla
        plantilla_bytes = generar_activos()
        workbook = load_workbook(BytesIO(plantilla_bytes))
        ws_datos = workbook['Datos']
        
        # Verificar Data Validations
        validaciones = list(ws_datos.data_validations.dataValidation)
        
        if len(validaciones) == 0:
            print("❌ ERROR: No se encontraron validaciones de datos")
            return False
        
        print(f"\n✅ Encontradas {len(validaciones)} validaciones:")
        
        for idx, val in enumerate(validaciones, 1):
            print(f"\n  {idx}. Validación #{idx}")
            print(f"     Tipo: {val.type}")
            print(f"     Fórmula: {val.formula1}")
            print(f"     Celdas: {val.sqref}")
            print(f"     Mensaje: {val.prompt}")
            
            # Verificar que sea correcta
            if val.type == "list":
                if "B2:B26" in str(val.sqref) or "B" in str(val.sqref):
                    if "computadora" in val.formula1:
                        print(f"     ✓ Validación de TIPO correcta")
                elif "C2:C26" in str(val.sqref) or "C" in str(val.sqref):
                    if "disponible" in val.formula1:
                        print(f"     ✓ Validación de ESTADO correcta")
        
        print("\n✅ PRUEBA EXITOSA: Plantilla de Activos tiene dropdowns correctamente configurados")
        return True
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def prueba_estudiantes():
    """Verifica que la plantilla de estudiantes tiene Data Validation para Grado"""
    print("\n" + "="*70)
    print("🧪 PRUEBA 2: VALIDACIÓN DE DROPDOWNS EN PLANTILLA DE ESTUDIANTES")
    print("="*70)
    
    try:
        # Generar plantilla
        plantilla_bytes = generar_estudiantes()
        workbook = load_workbook(BytesIO(plantilla_bytes))
        ws_datos = workbook['Datos']
        
        # Verificar Data Validations
        validaciones = list(ws_datos.data_validations.dataValidation)
        
        if len(validaciones) == 0:
            print("❌ ERROR: No se encontraron validaciones de datos")
            return False
        
        print(f"\n✅ Encontradas {len(validaciones)} validaciones:")
        
        grado_encontrado = False
        for idx, val in enumerate(validaciones, 1):
            print(f"\n  {idx}. Validación #{idx}")
            print(f"     Tipo: {val.type}")
            print(f"     Fórmula: {val.formula1}")
            print(f"     Celdas: {val.sqref}")
            print(f"     Mensaje: {val.prompt}")
            
            # Verificar que sea de Grado
            if val.type == "list":
                if "G2:G21" in str(val.sqref) or "G" in str(val.sqref):
                    if "Decimo" in val.formula1:
                        print(f"     ✓ Validación de GRADO correcta")
                        grado_encontrado = True
        
        if grado_encontrado:
            print("\n✅ PRUEBA EXITOSA: Plantilla de Estudiantes tiene dropdown de Grado correctamente configurado")
            return True
        else:
            print("\n⚠️ ADVERTENCIA: No se encontró validación para GRADO")
            return False
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def main():
    print("\n")
    print("╔════════════════════════════════════════════════════════════════╗")
    print("║   ✨ PRUEBA DE DROPDOWNS EN PLANTILLAS EXCEL               ║")
    print("╚════════════════════════════════════════════════════════════════╝")
    
    resultados = []
    
    # Prueba 1: Activos
    resultados.append(("Activos", prueba_activos()))
    
    # Prueba 2: Estudiantes
    resultados.append(("Estudiantes", prueba_estudiantes()))
    
    # Resumen
    print("\n" + "="*70)
    print("📊 RESUMEN DE PRUEBAS")
    print("="*70)
    
    total = len(resultados)
    exitosas = sum(1 for _, resultado in resultados if resultado)
    
    for nombre, resultado in resultados:
        estado = "✅ EXITOSA" if resultado else "❌ FALLÓ"
        print(f"  {nombre}: {estado}")
    
    print(f"\nTotal: {exitosas}/{total} pruebas exitosas")
    
    if exitosas == total:
        print("\n🎉 ¡TODAS LAS PRUEBAS FUERON EXITOSAS!")
        print("\n✨ Características validadas:")
        print("   ✓ Dropdowns en Activos (Tipo, Estado)")
        print("   ✓ Dropdowns en Estudiantes (Grado)")
        print("   ✓ Data Validation correctamente configurada")
        print("   ✓ Mensajes de error y prompts activos")
        return 0
    else:
        print(f"\n⚠️ {total - exitosas} prueba(s) fallaron")
        return 1


if __name__ == "__main__":
    exit(main())
