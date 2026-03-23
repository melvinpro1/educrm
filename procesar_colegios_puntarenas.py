#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import csv
from collections import OrderedDict

# Ruta del CSV
csv_path = r"C:\Users\melvi\Downloads\CentrosEducativos.csv"
colegios_puntarenas = []

print("📂 Procesando CSV de colegios...")
print(f"Ruta: {csv_path}\n")

try:
    # Intentar con diferentes encodings, empezando por los más comunes en Windows
    encodings = ['latin-1', 'cp1252', 'iso-8859-1', 'utf-8', 'utf-8-sig']
    file = None
    used_encoding = None
    
    for enc in encodings:
        try:
            file = open(csv_path, 'r', encoding=enc)
            # Intentar leer una línea para validar
            file.readline()
            file.seek(0)
            used_encoding = enc
            print(f"✅ Encoding detectado: {enc}\n")
            break
        except (UnicodeDecodeError, Exception):
            if file:
                file.close()
            continue
    
    if not file:
        raise Exception("No se pudo decodificar el archivo con ningún encoding")
    
    with file:
        reader = csv.reader(file, delimiter=';')
        headers = None
        fila_num = 0
        
        for row in reader:
            fila_num += 1
            
            # Buscar la fila de encabezados
            if row and "NOMBRE" in row and "PROVINCIA" in row:
                headers = row
                nombre_idx = headers.index("NOMBRE")
                provincia_idx = headers.index("PROVINCIA")
                print(f"✅ Encabezados encontrados en fila {fila_num}")
                print(f"   - Índice NOMBRE: {nombre_idx}")
                print(f"   - Índice PROVINCIA: {provincia_idx}\n")
                continue
            
            # Si encontramos headers, procesamos las siguientes filas
            if headers and len(row) > max(nombre_idx, provincia_idx):
                try:
                    provincia = row[provincia_idx].strip()
                    nombre = row[nombre_idx].strip()
                    
                    # Filtrar por Puntarenas
                    if provincia.upper() == "PUNTARENAS" and nombre and nombre != "NOMBRE":
                        colegios_puntarenas.append(nombre)
                        print(f"✓ {nombre}")
                except (IndexError, AttributeError) as e:
                    continue

    # Eliminar duplicados manteniendo el orden
    colegios_unicos = list(OrderedDict.fromkeys(colegios_puntarenas))
    
    print(f"\n{'='*60}")
    print(f"🎓 Total de colegios únicos en Puntarenas: {len(colegios_unicos)}")
    print(f"{'='*60}\n")
    
    if len(colegios_unicos) > 0:
        # Guardar en archivo JavaScript
        js_content = "// Lista de colegios de Puntarenas extraída del CSV CentrosEducativos.csv\n"
        js_content += "export const colegios = [\n"
        for colegio in colegios_unicos:
            js_content += f'  "{colegio}",\n'
        js_content += "];\n\n"
        js_content += "export default colegios;\n"
        
        # Escribir archivo
        output_path = r"c:\CRMEdu\educrm\src\data\colegiosData.js"
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(js_content)
        
        print(f"✅ Archivo actualizado: {output_path}")
        print(f"\nPrimeros 10 colegios:")
        for i, colegio in enumerate(colegios_unicos[:10], 1):
            print(f"   {i}. {colegio}")
    else:
        print("⚠️  No se encontraron colegios de Puntarenas. Verifica el CSV.")
    
except FileNotFoundError:
    print(f"❌ No se encontró el archivo: {csv_path}")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
