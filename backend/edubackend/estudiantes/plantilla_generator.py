"""
Generador de plantillas mejoradas para importación de estudiantes
"""
import csv
from io import StringIO, BytesIO
from datetime import datetime
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

def generar_plantilla_csv_mejorada():
    """Genera una plantilla CSV mejorada con instrucciones y ejemplos"""
    output = StringIO()
    writer = csv.writer(output)
    
    # Escribir instrucciones como comentarios
    writer.writerow(["INSTRUCCIONES PARA COMPLETAR LA PLANTILLA DE ESTUDIANTES"])
    writer.writerow([])
    writer.writerow(["CAMPOS OBLIGATORIOS: Cedula, Nombre, CorreoInstitucional, Telefono, Colegio, Grado"])
    writer.writerow(["CAMPOS OPCIONALES: CorreoPersonal, Direccion, EncargadoNombre, EncargadoCorreo, EncargadoTelefono"])
    writer.writerow([])
    writer.writerow(["REGLAS DE VALIDACION:"])
    writer.writerow(["- Cedula: Números únicos sin espacios. Ej: 123456789"])
    writer.writerow(["- Nombre: Texto con letras. Mínimo 3 caracteres. Ej: Juan Perez"])
    writer.writerow(["- CorreoInstitucional: Formato email válido. Ej: juan@institución.com"])
    writer.writerow(["- Telefono: Solo números. Ej: 88887777 o +506 8888 7777"])
    writer.writerow(["- Colegio: Nombre del colegio de procedencia. Ej: Colegio Central"])
    writer.writerow(["- Grado: Nivel académico. Ej: Decimo, Undecimo, Duodecimo"])
    writer.writerow([])
    writer.writerow(["COLUMNAS DEL CSV:"])
    writer.writerow([])
    
    # Encabezados mejorados
    headers = [
        "Cedula",
        "Nombre",
        "CorreoInstitucional",
        "CorreoPersonal",
        "Telefono",
        "Colegio",
        "Grado",
        "Direccion",
        "EncargadoNombre",
        "EncargadoCorreo",
        "EncargadoTelefono"
    ]
    writer.writerow(headers)
    
    # Ejemplos de datos
    ejemplos = [
        [
            "123456789",
            "Juan Perez",
            "juan@institución.com",
            "juan@gmail.com",
            "88887777",
            "Colegio Central",
            "Decimo",
            "Calle Principal 123, Casa 1",
            "Maria Perez Garcia",
            "maria@gmail.com",
            "88887778"
        ],
        [
            "987654321",
            "Ana Rodriguez",
            "ana@institución.com",
            "",
            "87776666",
            "Liceo Bilingue",
            "Undecimo",
            "Av. Secundaria 456",
            "Carlos Rodriguez",
            "carlos@hotmail.com",
            "87776667"
        ]
    ]
    
    for ejemplo in ejemplos:
        writer.writerow(ejemplo)
    
    # Líneas vacías para datos del usuario
    for i in range(8):
        writer.writerow([""] * len(headers))
    
    return output.getvalue()


def generar_plantilla_excel():
    """Genera una plantilla Excel profesional con formato y estilos"""
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
    advertencia_fill = PatternFill(start_color="FFF2CC", end_color="FFF2CC", fill_type="solid")
    
    # Establecer ancho de columnas
    ws_instrucciones.column_dimensions['A'].width = 80
    
    # Título
    ws_instrucciones['A1'] = "PLANTILLA DE IMPORTACIÓN DE ESTUDIANTES - EduCRM"
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
    ws_instrucciones[f'A{fila}'] = "Esta plantilla te ayuda a importar estudiantes de manera masiva al sistema. Completa la hoja 'Datos' con la información de los estudiantes."
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
        "Cedula: Número único del estudiante (sin espacios ni caracteres especiales)",
        "Nombre: Nombre completo del estudiante (mínimo 3 caracteres)",
        "CorreoInstitucional: Email institucional (formato: usuario@dominio.com)",
        "Telefono: Teléfono de contacto (solo números)",
        "Colegio: Nombre del colegio de procedencia",
        "Grado: Nivel académico (Decimo, Undecimo, Duodecimo, etc)"
    ]
    
    for campo in campos_obligatorios:
        fila += 1
        ws_instrucciones[f'A{fila}'] = campo
        ws_instrucciones[f'A{fila}'].font = contenido_font
        ws_instrucciones.row_dimensions[fila].height = 18
        ws_instrucciones[f'A{fila}'].alignment = Alignment(wrap_text=True)
    
    # Sección 3: Campos Opcionales
    fila += 2
    ws_instrucciones[f'A{fila}'] = "◇ CAMPOS OPCIONALES"
    ws_instrucciones[f'A{fila}'].font = subtitulo_font
    ws_instrucciones[f'A{fila}'].fill = PatternFill(start_color="E2EFDA", end_color="E2EFDA", fill_type="solid")
    ws_instrucciones.row_dimensions[fila].height = 20
    
    campos_opcionales = [
        "CorreoPersonal: Email personal del estudiante",
        "Direccion: Dirección del domicilio del estudiante",
        "EncargadoNombre: Nombre del responsable/encargado",
        "EncargadoCorreo: Email del encargado (importante para comunicaciones)",
        "EncargadoTelefono: Teléfono del encargado"
    ]
    
    for campo in campos_opcionales:
        fila += 1
        ws_instrucciones[f'A{fila}'] = campo
        ws_instrucciones[f'A{fila}'].font = contenido_font
        ws_instrucciones.row_dimensions[fila].height = 18
        ws_instrucciones[f'A{fila}'].alignment = Alignment(wrap_text=True)
    
    # Sección 4: Ejemplos
    fila += 2
    ws_instrucciones[f'A{fila}'] = "📝 EJEMPLO DE DATOS CORRECTOS"
    ws_instrucciones[f'A{fila}'].font = subtitulo_font
    ws_instrucciones[f'A{fila}'].fill = subtitulo_fill
    ws_instrucciones.row_dimensions[fila].height = 20
    
    ejemplos_texto = [
        "Cedula: 123456789 | Nombre: Juan Perez | Email: juan@institución.com | Teléfono: 88887777",
        "Colegio: Colegio Central | Grado: Decimo | Encargado: Maria Perez | Email Encargado: maria@gmail.com"
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
    headers = [
        "Cedula",
        "Nombre",
        "CorreoInstitucional",
        "CorreoPersonal",
        "Telefono",
        "Colegio",
        "Grado",
        "Direccion",
        "EncargadoNombre",
        "EncargadoCorreo",
        "EncargadoTelefono"
    ]
    
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
    anchos = [15, 20, 25, 25, 15, 20, 15, 30, 20, 25, 15]
    for col_num, ancho in enumerate(anchos, 1):
        ws_datos.column_dimensions[get_column_letter(col_num)].width = ancho
    
    # Agregar ejemplo de datos en la primera fila
    datos_ejemplo = [
        "123456789",
        "Juan Perez",
        "juan@institución.com",
        "juan@gmail.com",
        "88887777",
        "Colegio Central",
        "Decimo",
        "Calle Principal 123",
        "Maria Perez",
        "maria@gmail.com",
        "88887778"
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
    
    # Agregar 18 filas vacías más para que el usuario complete
    data_font = Font(name='Calibri', size=10)
    for row_num in range(3, 21):
        for col_num in range(1, len(headers) + 1):
            cell = ws_datos.cell(row=row_num, column=col_num)
            cell.border = border
            cell.alignment = Alignment(horizontal='left', vertical='center')
            cell.font = data_font
    
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
            "Cedula",
            "Nombre",
            "CorreoInstitucional",
            "Telefono",
            "Colegio",
            "Grado"
        ],
        "campos_opcionales": [
            "CorreoPersonal",
            "Direccion",
            "EncargadoNombre",
            "EncargadoCorreo",
            "EncargadoTelefono"
        ],
        "validaciones": {
            "Cedula": "Números únicos sin espacios. Ej: 123456789",
            "Nombre": "Letras, mínimo 3 caracteres. Ej: Juan Perez",
            "CorreoInstitucional": "Email válido. Ej: juan@institución.com",
            "CorreoPersonal": "Email válido (opcional)",
            "Telefono": "Solo números. Ej: 88887777",
            "Colegio": "Nombre del colegio. Ej: Colegio Central",
            "Grado": "Nivel. Ej: Decimo, Undecimo, Duodecimo",
            "Direccion": "Domicilio completo (opcional)",
            "EncargadoNombre": "Nombre del responsable (opcional)",
            "EncargadoCorreo": "Email del responsable (opcional)",
            "EncargadoTelefono": "Teléfono del responsable (opcional)"
        },
        "ejemplos": [
            {
                "cedula": "123456789",
                "nombre": "Juan Perez",
                "correo_institucional": "juan@institución.com",
                "correo_personal": "juan@gmail.com",
                "telefono": "88887777",
                "colegio": "Colegio Central",
                "grado": "Decimo",
                "direccion": "Calle Principal 123",
                "encargado_nombre": "Maria Perez",
                "encargado_correo": "maria@gmail.com",
                "encargado_telefono": "88887778"
            }
        ]
    }


if __name__ == "__main__":
    plantilla = generar_plantilla_csv_mejorada()
    print(plantilla)
