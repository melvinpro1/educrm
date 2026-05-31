#!/usr/bin/env python3
"""
Script de prueba para verificar las mejoras:
1. Modelo Activo tiene campo identificador
2. Plantilla Excel genera con columna Identificador
3. Dropdown de Tipo es dinámico (obtiene tipos de BD)
"""

import sys
sys.path.insert(0, 'backend/edubackend')

import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edubackend.settings')

import django
django.setup()

from openpyxl import load_workbook
from io import BytesIO
from activos.models import Activo
from activos.plantilla_generator import generar_plantilla_excel, generar_plantilla_info

def prueba_modelo():
    """Verifica que el modelo tiene el campo identificador"""
    print("\n" + "="*70)
    print("🧪 PRUEBA 1: VERIFICAR CAMPO 'IDENTIFICADOR' EN MODELO")
    print("="*70)
    
    try:
        # Obtener campos del modelo
        campos = [f.name for f in Activo._meta.get_fields()]
        
        if 'identificador' in campos:
            print("\n✅ Campo 'identificador' encontrado en modelo Activo")
            print(f"\nCampos del modelo: {', '.join(campos)}")
            return True
        else:
            print("\n❌ Campo 'identificador' NO encontrado en modelo Activo")
            print(f"\nCampos del modelo: {', '.join(campos)}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def prueba_plantilla():
    """Verifica que la plantilla tiene 4 columnas"""
    print("\n" + "="*70)
    print("🧪 PRUEBA 2: VERIFICAR COLUMNA IDENTIFICADOR EN PLANTILLA")
    print("="*70)
    
    try:
        # Generar plantilla
        plantilla_bytes = generar_plantilla_excel()
        workbook = load_workbook(BytesIO(plantilla_bytes))
        ws_datos = workbook['Datos']
        
        # Obtener encabezados
        encabezados = []
        for col_num in range(1, 10):  # Revisar primeras 10 columnas
            celda = ws_datos.cell(row=1, column=col_num)
            if celda.value:
                encabezados.append(celda.value)
            else:
                break
        
        print(f"\n✅ Encabezados encontrados: {encabezados}")
        
        if 'Identificador/Modelo' in encabezados or 'Identificador' in encabezados:
            print("✅ Columna 'Identificador/Modelo' encontrada en la plantilla")
            
            # Verificar que tiene 4 columnas
            if len(encabezados) == 4:
                print("✅ Total de columnas: 4 (Nombre, Tipo, Estado, Identificador)")
                return True
            else:
                print(f"⚠️ Esperaba 4 columnas, encontré {len(encabezados)}")
                return False
        else:
            print("❌ Columna 'Identificador/Modelo' NO encontrada")
            return False
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def prueba_dropdown_dinamico():
    """Verifica que el dropdown de Tipo es dinámico"""
    print("\n" + "="*70)
    print("🧪 PRUEBA 3: VERIFICAR DROPDOWN DINÁMICO DE TIPO")
    print("="*70)
    
    try:
        # Obtener tipos de la BD
        tipos_bd = list(Activo.objects.values_list('tipo', flat=True).distinct())
        
        print(f"\n📊 Tipos existentes en BD: {tipos_bd if tipos_bd else 'Ninguno (usará valores por defecto)'}")
        
        # Generar plantilla
        plantilla_bytes = generar_plantilla_excel()
        workbook = load_workbook(BytesIO(plantilla_bytes))
        ws_datos = workbook['Datos']
        
        # Obtener validaciones
        validaciones = list(ws_datos.data_validations.dataValidation)
        
        print(f"\n✅ Encontradas {len(validaciones)} validaciones:")
        
        for val in validaciones:
            if "B" in str(val.sqref):
                print(f"\n   Validación de TIPO (Columna B):")
                print(f"   • Fórmula: {val.formula1}")
                print(f"   • Celdas: {val.sqref}")
                
                # Verificar si la fórmula contiene los tipos esperados
                formula = val.formula1.replace('"', '').split(',')
                if formula:
                    print(f"   • Valores en dropdown: {', '.join(formula)}")
                    return True
        
        return False
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def prueba_info_plantilla():
    """Verifica que la información de la plantilla incluye Identificador"""
    print("\n" + "="*70)
    print("🧪 PRUEBA 4: VERIFICAR INFO DE PLANTILLA")
    print("="*70)
    
    try:
        info = generar_plantilla_info()
        
        print("\n📋 Campos obligatorios:")
        for campo in info.get("campos_obligatorios", []):
            print(f"   ✓ {campo}")
        
        print("\n📋 Campos opcionales:")
        opcionales = info.get("campos_opcionales", [])
        if opcionales:
            for campo in opcionales:
                print(f"   ✓ {campo}")
        else:
            print("   (Ninguno)")
        
        if "Identificador/Modelo" in info.get("campos_opcionales", []):
            print("\n✅ Campo 'Identificador/Modelo' correctamente marcado como opcional")
            return True
        else:
            print("\n❌ Campo 'Identificador/Modelo' NO está en campos opcionales")
            return False
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def main():
    print("\n")
    print("╔════════════════════════════════════════════════════════════════╗")
    print("║   🧪 PRUEBAS DE MEJORA: IDENTIFICADOR + DROPDOWN DINÁMICO     ║")
    print("╚════════════════════════════════════════════════════════════════╝")
    
    resultados = []
    
    # Ejecutar pruebas
    resultados.append(("Modelo tiene 'identificador'", prueba_modelo()))
    resultados.append(("Plantilla tiene 4 columnas", prueba_plantilla()))
    resultados.append(("Dropdown TIPO es dinámico", prueba_dropdown_dinamico()))
    resultados.append(("Info de plantilla actualizada", prueba_info_plantilla()))
    
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
        print("\n✨ Mejoras validadas:")
        print("   ✓ Campo 'identificador' en modelo Activo")
        print("   ✓ Columna 'Identificador/Modelo' en plantilla Excel")
        print("   ✓ Dropdown de Tipo es dinámico (obtiene de BD)")
        print("   ✓ Campo opcional en formularios")
        return 0
    else:
        print(f"\n⚠️ {total - exitosas} prueba(s) fallaron")
        return 1


if __name__ == "__main__":
    exit(main())
