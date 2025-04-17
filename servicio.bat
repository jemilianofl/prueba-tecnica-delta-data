@echo off
SET ENV_NAME=CRUD_credito

echo ---------------------------------------------
echo Iniciando entorno virtual: %ENV_NAME%
echo ---------------------------------------------

REM Crear entorno virtual
python -m venv %ENV_NAME%

REM Activar entorno
call %ENV_NAME%\Scripts\activate.bat

REM Instalar dependencias
echo ---------------------------------------------
echo Instalando dependencias...
echo ---------------------------------------------
pip install -r requirements.txt

REM Ejecutar aplicación
echo ---------------------------------------------
echo Iniciando servidor Flask en http://127.0.0.1:5000
echo ---------------------------------------------
python app.py

pause