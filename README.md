# Aplicación CRUD de Créditos - Delta Data Consulting

Esta aplicación permite registrar, editar, eliminar y visualizar créditos otorgados a clientes, usando **Flask + SQLite + HTML/JS**. También incluye una **gráfica interactiva con Chart.js** para visualizar la distribución de créditos por cliente.

---

## 🧠 Funcionalidades

- Registro de nuevos créditos mediante formulario.
- Visualización de créditos en una tabla.
- Edición y eliminación de créditos existentes.
- Validación básica de datos.
- Gráfico dinámico de créditos por cliente.
- Interfaz clara y moderna.
- Script automatizado para levantar todo en Windows.

---

### 📷 Snapshots
- Captura de los campos a rellenar y la tabla que se genera
![Interfaz](/snapshots/interfaz_uso.png)

- Funcionalidad de visualización de creditos y rango de montos
![Herramientas](/snapshots/herramientas.png)


## 🚀 Instrucciones para uso en Windows

> **Solo necesitas ejecutar una vez `servicio.bat` y el sistema se iniciará automáticamente.**

Este archivo:

1. Crea un entorno virtual llamado `CRUD_credito`.
2. Activa el entorno.
3. Instala las dependencias necesarias.
4. Ejecuta la aplicación Flask.

---

### 🛠️ Requisitos previos

- Tener **Python 3.9+** instalado en el sistema.
- Tener permisos para crear carpetas y ejecutar scripts.

---

## 🔧 Instrucciones manuales (si no usas Windows)

```bash
# 1. Crear entorno virtual
python -m venv CRUD_credito

# 2. Activar entorno (Windows)
CRUD_credito\Scripts\activate

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Ejecutar aplicación
python app.py