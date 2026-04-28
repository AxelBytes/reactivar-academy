import csv
import fitz  # PyMuPDF
import re
import pandas as pd
from pathlib import Path

# ---------------------------------------------------------------------------
# Configuración
# ---------------------------------------------------------------------------
PDF_PATH = Path(__file__).parent / "reglamento.pdf"
OUTPUT_XLSX = Path(__file__).parent / "reglamento_limpio.xlsx"
OUTPUT_CSV = Path(__file__).parent / "reglamento_limpio.csv"

# ---------------------------------------------------------------------------
# Patrones de expresiones regulares
# ---------------------------------------------------------------------------
# Capítulo: "CAPÍTULO 1", "CAPITULO IV", etc. (romanos o arábigos)
RE_CAPITULO = re.compile(
    r"^(CAP[IÍ]TULO\s+[IVXLCDM\d]+.*)",
    re.IGNORECASE | re.UNICODE,
)

# Artículo: líneas que comiencen con "1.", "19.1", "19.2.", "3.1.2", etc.
# Captura: grupo 1 = número de artículo, grupo 2 = título en la misma línea
RE_ARTICULO = re.compile(
    r"^(\d+(?:\.\d+)*\.?)\s{1,}(.+)$",
    re.UNICODE,
)

# Bloques que son solo paginado (un número suelto, con o sin espacios)
RE_SOLO_NUMERO = re.compile(r"^\s*\d+\s*$")

# Basura de índice: líneas que contienen solo puntos suspensivos / guiones / espacios
RE_BASURA_INDICE = re.compile(r"^[\s.\-_]{3,}$")

# Pie/encabezado "Página X" en cualquier variante
RE_PAGINA = re.compile(r"P[áa]gina\s*\d*", re.IGNORECASE | re.UNICODE)

# Frases repetitivas de encabezado/pie de página que se desean ignorar.
# Agrega aquí cualquier frase adicional que contamine tu PDF.
FRASES_RUIDO: list[str] = [
    "REGLAS OFICIALES DE NEWCOM",
    "REGLAMENTO OFICIAL",
    "FEDERACIÓN MEXICANA",
    # añade más si aparecen al inspeccionar el PDF
]

# Título sucio: texto con puntos suspensivos y/o números al final arrastrados del índice
# Ej: "DIMENSIONES....... 2"  →  "DIMENSIONES"
RE_TITULO_SUCIO = re.compile(r"[\s.]+\d*\s*$")


# ---------------------------------------------------------------------------
# Limpieza de líneas individuales
# ---------------------------------------------------------------------------
def es_linea_ruido(linea: str) -> bool:
    """
    Retorna True si la línea debe descartarse por ser:
    - Solo un número (paginado)
    - Solo puntos/guiones/espacios (basura de índice)
    - Encabezado o pie de página repetitivo
    """
    linea_strip = linea.strip()

    if not linea_strip:
        return True

    if RE_SOLO_NUMERO.match(linea_strip):
        return True

    if RE_BASURA_INDICE.match(linea_strip):
        return True

    if RE_PAGINA.search(linea_strip):
        return True

    linea_upper = linea_strip.upper()
    for frase in FRASES_RUIDO:
        if frase.upper() in linea_upper:
            return True

    return False


# ---------------------------------------------------------------------------
# Helpers de limpieza
# ---------------------------------------------------------------------------
def limpiar_texto(texto: str) -> str:
    """Normaliza espacios y elimina saltos de línea internos para párrafo continuo."""
    texto = texto.replace("\n", " ")
    texto = re.sub(r"\s{2,}", " ", texto)
    return texto.strip()


def limpiar_titulo(titulo: str) -> str:
    """
    Elimina puntos suspensivos y números sueltos al final del título
    que se arrastran desde el índice del PDF.
    Ej: 'DIMENSIONES....... 2'  →  'DIMENSIONES'
    """
    titulo = RE_TITULO_SUCIO.sub("", titulo)
    return titulo.strip()


def guardar_fila(
    filas: list,
    capitulo: str,
    articulo: str,
    titulo: str,
    contenido: str,
) -> None:
    """Agrega una fila solo cuando hay artículo o contenido real."""
    contenido_limpio = limpiar_texto(contenido)
    if articulo or contenido_limpio:
        filas.append(
            {
                "Capítulo": limpiar_texto(capitulo),
                "Artículo": articulo.strip(),
                "Título": limpiar_titulo(titulo),
                "Contenido": contenido_limpio,
            }
        )


# ---------------------------------------------------------------------------
# Extracción principal (máquina de estados)
# ---------------------------------------------------------------------------
def extraer_reglamento(pdf_path: Path) -> list[dict]:
    doc = fitz.open(str(pdf_path))

    filas: list[dict] = []

    # Variables de estado
    capitulo_actual: str = ""
    articulo_actual: str = ""
    titulo_actual: str = ""
    contenido_actual: str = ""

    for num_pagina, pagina in enumerate(doc, start=1):
        # get_text("blocks") → (x0, y0, x1, y1, text, block_no, block_type)
        bloques = pagina.get_text("blocks")

        # Ordenar por posición vertical para lectura natural de arriba a abajo
        bloques = sorted(bloques, key=lambda b: (b[1], b[0]))

        for bloque in bloques:
            # block_type 1 = imagen → ignorar
            if bloque[6] != 0:
                continue

            texto_bloque: str = bloque[4].strip()

            if not texto_bloque:
                continue

            # Descartar bloques que sean solo número de página
            if RE_SOLO_NUMERO.match(texto_bloque):
                continue

            lineas = texto_bloque.splitlines()

            for linea_raw in lineas:
                linea = linea_raw.strip()

                # --- Filtro de ruido (encabezados, pies, basura de índice) ---
                if es_linea_ruido(linea):
                    continue

                # --- Detección de CAPÍTULO ---
                m_cap = RE_CAPITULO.match(linea)
                if m_cap:
                    guardar_fila(filas, capitulo_actual, articulo_actual, titulo_actual, contenido_actual)
                    capitulo_actual = limpiar_texto(m_cap.group(1))
                    articulo_actual = ""
                    titulo_actual = ""
                    contenido_actual = ""
                    continue

                # --- Detección de ARTÍCULO ---
                m_art = RE_ARTICULO.match(linea)
                if m_art:
                    guardar_fila(filas, capitulo_actual, articulo_actual, titulo_actual, contenido_actual)
                    articulo_actual = m_art.group(1).rstrip(".")
                    titulo_actual = limpiar_titulo(limpiar_texto(m_art.group(2)))
                    contenido_actual = ""
                    continue

                # --- Continuación de CONTENIDO (párrafos huérfanos incluidos) ---
                # Cualquier texto que no sea capítulo ni artículo se acumula
                # en el artículo actual; nunca genera una fila nueva por sí solo.
                separador = " " if contenido_actual else ""
                contenido_actual += separador + linea

    # Guardar el último artículo al finalizar el documento
    guardar_fila(filas, capitulo_actual, articulo_actual, titulo_actual, contenido_actual)

    doc.close()
    return filas


# ---------------------------------------------------------------------------
# Exportación a Excel (.xlsx)
# ---------------------------------------------------------------------------
def exportar_excel(df: pd.DataFrame, output_path: Path) -> None:
    with pd.ExcelWriter(str(output_path), engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Reglamento")

        hoja = writer.sheets["Reglamento"]
        anchos = {"Capítulo": 35, "Artículo": 15, "Título": 45, "Contenido": 80}
        for col_idx, col_name in enumerate(df.columns, start=1):
            hoja.column_dimensions[
                hoja.cell(row=1, column=col_idx).column_letter
            ].width = anchos.get(col_name, 20)

        # Activar ajuste de texto en toda la hoja para que el contenido se lea bien
        from openpyxl.styles import Alignment
        for fila in hoja.iter_rows():
            for celda in fila:
                celda.alignment = Alignment(wrap_text=True, vertical="top")

    print(f"[OK] Excel generado: {output_path}")


# ---------------------------------------------------------------------------
# Exportación a CSV (.csv) con QUOTE_ALL para blindar comas internas
# ---------------------------------------------------------------------------
def exportar_csv(df: pd.DataFrame, output_path: Path) -> None:
    df.to_csv(
        str(output_path),
        index=False,
        encoding="utf-8-sig",   # BOM para compatibilidad con Excel al abrir CSV
        quoting=csv.QUOTE_ALL,  # Entrecomilla TODOS los campos sin excepción
        lineterminator="\n",
    )
    print(f"[OK] CSV generado:  {output_path}")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
def main() -> None:
    if not PDF_PATH.exists():
        raise FileNotFoundError(
            f"No se encontró el archivo PDF en: {PDF_PATH}\n"
            "Asegúrate de que 'reglamento.pdf' está en la misma carpeta que este script."
        )

    print(f"[INFO] Procesando: {PDF_PATH}")
    filas = extraer_reglamento(PDF_PATH)

    if not filas:
        print("[AVISO] No se extrajo ninguna fila. Revisa los patrones regex o el formato del PDF.")
        return

    df = pd.DataFrame(filas, columns=["Capítulo", "Artículo", "Título", "Contenido"])

    print(f"[INFO] Total de filas extraídas: {len(df)}")
    print(f"[INFO] Capítulos detectados:     {df['Capítulo'].nunique()}")
    print(f"[INFO] Artículos únicos:         {df['Artículo'].nunique()}")

    exportar_excel(df, OUTPUT_XLSX)
    exportar_csv(df, OUTPUT_CSV)


if __name__ == "__main__":
    main()
