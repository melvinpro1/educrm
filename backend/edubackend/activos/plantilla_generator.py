"""
Generador de plantillas mejoradas para importación de activos
"""
import csv
from io import StringIO, BytesIO
from datetime import datetime
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation


def generar_plantilla_csv_mejorada():
    """Genera una plantilla CSV mejorada con instrucciones y ejemplos"""
    output = StringIO()
    writer = csv.writer(output)
    
    # Escribir instrucciones como comentarios
    writer.writerow(["INSTRUCCIONES PARA COMPLETAR LA PLANTILLA DE ACTIVOS"])
    writer.writerow([])
    writer.writerow(["CAMPOS OBLIGATORIOS: Nombre, Tipo, Estado"])
    writer.writerow(["CAMPOS OPCIONALES: Ninguno"])
    writer.writerow([])
    writer.writerow(["REGLAS DE VALIDACION:"])
    writer.writerow(["- Nombre: Texto descriptivo. Mínimo 3 caracteres. Ej: Computadora Lenovo ThinkPad"])
    writer.writerow(["- Tipo: computadora, tablet, libro, proyector, otro"])
    writer.writerow(["- Estado: disponible, prestado, en_mantenimiento"])
    writer.writerow([])
    writer.writerow(["COLUMNAS DEL CSV:"])
    writer.writerow([])
    
    # Encabezados
    headers = [
        "Nombre",
        "Tipo",
        "Estado"
    ]
    writer.writerow(headers)
    
    # Ejemplos de datos
    ejemplos = [
        ["Computadora Lenovo ThinkPad X1", "computadora", "disponible"],
        ["iPad Air 10 pulgadas", "tablet", "disponible"],
        ["Libro Análisis Matemático", "libro", "disponible"],
        ["Proyector Epson PowerLite", "proyector", "disponible"],
        ["Monitor LG 24 pulgadas", "otro", "disponible"],
    ]
    
    for ejemplo in ejemplos:
        writer.writerow(ejemplo)
    
    # Líneas vacías para datos del usuario
    for i in range(15):
        writer.writerow([""] * len(headers))
    
    return output.getvalue()


def generar_plantilla_excel(tipos_activos=None):
    """Genera una plantilla Excel profesional con formato y estilos
    
    Args:
        tipos_activos: Lista de tipos de activos disponibles. Si es None, usa valores por defecto.
    """
    # Usar tipos por defecto si no se proporcionan
    if tipos_activos is None:
        tipos_activos = ['computadora', 'tablet', 'libro', 'proyector', 'otro']
    
    # Validar y limpiar tipos
    tipos_activos = [str(t).strip().lower() for t in tipos_activos if t]
    if not tipos_activos:
        tipos_activos = ['computadora', 'tablet', 'libro', 'proyector', 'otro']
    
    wb = Workbook()
    
    # ===== HOJA 1: INSTRUCCIONES =====
    ws_instrucciones = wb.active
    ws_instrucciones.title = "Instrucciones"
    
    # Estilos
    titulo_font = Font(name='Calibri', size=16, bold=True, color="FFFFFF")
    titulo_fill = PatternFill(start_color="1F4E78", end_color="1F4E78", fill_type="solid")
    
    subtitulo_font = Font(name='Calibri', size=12, bold=True, color="FFFFFF")
    subtitulo_fill = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
    
    contenido_font = Font(name='Calibri', size=11)
    obligatorio_fill = PatternFill(start_color="E2EFDA", end_color="E2EFDA", fill_type="solid")
    
    # Establecer ancho de columnas
    ws_instrucciones.column_dimensions['A'].width = 80
    
    # Título
    ws_instrucciones['A1'] = "PLANTILLA DE IMPORTACIÓN DE ACTIVOS - EduCRM"
    ws_instrucciones['A1'].font = titulo_font
    ws_instrucciones['A1'].fill = titulo_fill
    ws_instrucciones['A1'].alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
    ws_instrucciones.row_dimensions[1].height = 30
    
    # Sección 1: Información General
    fila = 3
    ws_instrucciones[f'A{fila}'] = "📋 INFORMACIÓN GENERAL"
    ws_instrucciones[f'A{fila}'].font = subtitulo_font
    ws_instrucciones[f'A{fila}'].fill = subtitulo_fill
    ws_instrucciones.row_dimensions[fila].height = 20
    
    fila += 1
    ws_instrucciones[f'A{fila}'] = "Esta plantilla te ayuda a importar activos de manera masiva al sistema. Completa la hoja 'Datos' con la información de los activos (computadoras, tablets, libros, proyectores, etc)."
    ws_instrucciones[f'A{fila}'].font = contenido_font
    ws_instrucciones.row_dimensions[fila].height = 30
    ws_instrucciones[f'A{fila}'].alignment = Alignment(wrap_text=True)
    
    # Sección 2: Campos Obligatorios
    fila += 2
    ws_instrucciones[f'A{fila}'] = "✓ CAMPOS OBLIGATORIOS"
    ws_instrucciones[f'A{fila}'].font = subtitulo_font
    ws_instrucciones[f'A{fila}'].fill = obligatorio_fill
    ws_instrucciones.row_dimensions[fila].height = 20
    
    campos_obligatorios = [
        "Nombre: Descripción única del activo (mínimo 3 caracteres). Ej: Computadora Lenovo ThinkPad X1",
        "Tipo: Categoría del activo. Valores válidos: computadora, tablet, libro, proyector, otro",
        "Estado: Situación actual del activo. Valores válidos: disponible, prestado, en_mantenimiento"
    ]
    
    for campo in campos_obligatorios:
        fila += 1
        ws_instrucciones[f'A{fila}'] = campo
        ws_instrucciones[f'A{fila}'].font = contenido_font
        ws_instrucciones.row_dimensions[fila].height = 25
        ws_instrucciones[f'A{fila}'].alignment = Alignment(wrap_text=True)
    
    # Sección 3: Tipos de Activos Válidos
    fila += 2
    ws_instrucciones[f'A{fila}'] = "🏷️ TIPOS DE ACTIVOS DISPONIBLES"
    ws_instrucciones[f'A{fila}'].font = subtitulo_font
    ws_instrucciones[f'A{fila}'].fill = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
    ws_instrucciones.row_dimensions[fila].height = 20
    
    tipos = [
        "computadora: Computadoras de escritorio o portátiles",
        "tablet: Tablets, iPads u otros dispositivos móviles similares",
        "libro: Libros, diccionarios, enciclopedias y otros materiales impresos",
        "proyector: Proyectores, televisores u otros equipos de visualización",
        "otro: Cualquier otro tipo de activo no clasificado anteriormente"
    ]
    
    for tipo in tipos:
        fila += 1
        ws_instrucciones[f'A{fila}'] = tipo
        ws_instrucciones[f'A{fila}'].font = contenido_font
        ws_instrucciones.row_dimensions[fila].height = 18
        ws_instrucciones[f'A{fila}'].alignment = Alignment(wrap_text=True)
    
    # Sección 4: Estados Válidos
    fila += 2
    ws_instrucciones[f'A{fila}'] = "📊 ESTADOS DISPONIBLES"
    ws_instrucciones[f'A{fila}'].font = subtitulo_font
    ws_instrucciones[f'A{fila}'].fill = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
    ws_instrucciones.row_dimensions[fila].height = 20
    
    estados = [
        "disponible: El activo está disponible para ser prestado",
        "prestado: El activo está actualmente prestado a un estudiante",
        "en_mantenimiento: El activo se encuentra en reparación o mantenimiento"
    ]
    
    for estado in estados:
        fila += 1
        ws_instrucciones[f'A{fila}'] = estado
        ws_instrucciones[f'A{fila}'].font = contenido_font
        ws_instrucciones.row_dimensions[fila].height = 18
        ws_instrucciones[f'A{fila}'].alignment = Alignment(wrap_text=True)
    
    # Sección 5: Ejemplos
    fila += 2
    ws_instrucciones[f'A{fila}'] = "📝 EJEMPLO DE DATOS CORRECTOS"
    ws_instrucciones[f'A{fila}'].font = subtitulo_font
    ws_instrucciones[f'A{fila}'].fill = subtitulo_fill
    ws_instrucciones.row_dimensions[fila].height = 20
    
    ejemplos_texto = [
        "Nombre: Computadora Lenovo ThinkPad X1 | Tipo: computadora | Estado: disponible",
        "Nombre: iPad Air 10 pulgadas | Tipo: tablet | Estado: disponible",
        "Nombre: Libro Análisis Matemático | Tipo: libro | Estado: disponible",
    ]
    
    for ejemplo in ejemplos_texto:
        fila += 1
        ws_instrucciones[f'A{fila}'] = ejemplo
        ws_instrucciones[f'A{fila}'].font = contenido_font
        ws_instrucciones[f'A{fila}'].fill = PatternFill(start_color="F2F2F2", end_color="F2F2F2", fill_type="solid")
        ws_instrucciones.row_dimensions[fila].height = 18
        ws_instrucciones[f'A{fila}'].alignment = Alignment(wrap_text=True)
    
    # ===== HOJA 2: DATOS =====
    ws_datos = wb.create_sheet("Datos")
    
    # Encabezados
    headers = ["Nombre", "Tipo", "Estado", "Identificador/Modelo"]
    
    # Estilos para encabezado
    header_font = Font(name='Calibri', size=11, bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="366092", end_color="366092", fill_type="solid")
    header_alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
    border = Border(
        left=Side(style='thin'),
        right=Side(style='thin'),
        top=Side(style='thin'),
        bottom=Side(style='thin')
    )
    
    # Escribir encabezados
    for col_num, header in enumerate(headers, 1):
        cell = ws_datos.cell(row=1, column=col_num)
        cell.value = header
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = header_alignment
        cell.border = border
    
    ws_datos.row_dimensions[1].height = 25
    
    # Ajustar ancho de columnas
    anchos = [40, 18, 20, 30]
    for col_num, ancho in enumerate(anchos, 1):
        ws_datos.column_dimensions[get_column_letter(col_num)].width = ancho
    
    # Agregar ejemplo de datos
    datos_ejemplo = [
        "Computadora Lenovo ThinkPad X1",
        "computadora",
        "disponible",
        "SN: 1A2B3C4D5E"
    ]
    
    ejemplo_font = Font(name='Calibri', size=10, italic=True, color="999999")
    ejemplo_fill = PatternFill(start_color="F9F9F9", end_color="F9F9F9", fill_type="solid")
    
    for col_num, valor in enumerate(datos_ejemplo, 1):
        cell = ws_datos.cell(row=2, column=col_num)
        cell.value = valor
        cell.font = ejemplo_font
        cell.fill = ejemplo_fill
        cell.border = border
        cell.alignment = Alignment(horizontal='left', vertical='center')
    
    # Agregar 23 filas vacías más para que el usuario complete
    data_font = Font(name='Calibri', size=10)
    for row_num in range(3, 26):
        for col_num in range(1, len(headers) + 1):
            cell = ws_datos.cell(row=row_num, column=col_num)
            cell.border = border
            cell.alignment = Alignment(horizontal='left', vertical='center')
            cell.font = data_font
    
    # ===== AGREGAR VALIDACIÓN DE DATOS (DROPDOWNS) =====
    
    # Generar fórmula de Tipo dinámicamente desde los tipos disponibles
    tipos_formula = ','.join(tipos_activos)
    
    # Validación para TIPO (Columna B) - DINÁMICO
    dv_tipo = DataValidation(
        type="list",
        formula1=f'"{tipos_formula}"',
        allow_blank=False
    )
    dv_tipo.error = f'Selecciona un tipo válido: {tipos_formula}'
    dv_tipo.errorTitle = 'Tipo inválido'
    dv_tipo.prompt = 'Selecciona un tipo de activo'
    dv_tipo.promptTitle = 'Tipo'
    ws_datos.add_data_validation(dv_tipo)
    dv_tipo.add(f'B2:B26')  # Aplica a la columna B (Tipo), filas 2-26
    
    # Validación para ESTADO (Columna C)
    dv_estado = DataValidation(
        type="list",
        formula1='"disponible,prestado,en_mantenimiento"',
        allow_blank=False
    )
    dv_estado.error = 'Selecciona un estado válido: disponible, prestado, en_mantenimiento'
    dv_estado.errorTitle = 'Estado inválido'
    dv_estado.prompt = 'Selecciona el estado actual del activo'
    dv_estado.promptTitle = 'Estado'
    ws_datos.add_data_validation(dv_estado)
    dv_estado.add(f'C2:C26')  # Aplica a la columna C (Estado), filas 2-26
    
    # Congelar la fila de encabezados
    ws_datos.freeze_panes = 'A2'
    
    # Guardar en bytes
    output = BytesIO()
    wb.save(output)
    output.seek(0)
    return output.getvalue()


def generar_plantilla_info():
    """Genera información sobre la plantilla para mostrar en el frontend"""
    return {
        "campos_obligatorios": [
            "Nombre",
            "Tipo",
            "Estado"
        ],
        "campos_opcionales": [
            "Identificador/Modelo"
        ],
        "tipos_validos": [
            "computadora",
            "tablet",
            "libro",
            "proyector",
            "otro"
        ],
        "estados_validos": [
            "disponible",
            "prestado",
            "en_mantenimiento"
        ],
        "validaciones": {
            "Nombre": "Texto descriptivo, mínimo 3 caracteres. Ej: Computadora Lenovo ThinkPad X1",
            "Tipo": "Debe ser uno de: computadora, tablet, libro, proyector, otro",
            "Estado": "Debe ser uno de: disponible, prestado, en_mantenimiento",
            "Identificador/Modelo": "Campo opcional. Ej: SN: 1A2B3C4D5E, Modelo X1, Inventario #123"
        },
        "ejemplos": [
            {
                "nombre": "Computadora Lenovo ThinkPad X1",
                "tipo": "computadora",
                "estado": "disponible"
            },
            {
                "nombre": "iPad Air 10 pulgadas",
                "tipo": "tablet",
                "estado": "disponible"
            },
            {
                "nombre": "Libro Análisis Matemático",
                "tipo": "libro",
                "estado": "disponible"
            },
            {
                "nombre": "Proyector Epson PowerLite",
                "tipo": "proyector",
                "estado": "disponible"
            }
        ]
    }


if __name__ == "__main__":
    plantilla = generar_plantilla_csv_mejorada()
    print(plantilla)
