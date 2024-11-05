#!/bin/bash -eu

# Este script genera 2 builds principales de tu proyecto:
# - dist/esm: Build ESM para Node.js
# - dist/cjs: Build CommonJS para Node.js

# Cambiar al directorio raíz del proyecto
ROOT="$(pwd)/$(dirname "$0")/.."
cd "$ROOT" || exit 1

DIR="$ROOT/dist"

# Limpiar el directorio de salida
rm -rf "$DIR"
mkdir -p "$DIR"

# Construir cada tipo de módulo
for MODULE_TYPE in esm cjs; do
  echo "Construyendo ${MODULE_TYPE}"

  # Crear directorios de salida para cada tipo de módulo
  DIST_DIR="$DIR/${MODULE_TYPE}"

  # Ejecutar TypeScript para generar los builds de cada tipo de módulo
  tsc -p tsconfig.${MODULE_TYPE}.json

  # Lógica específica para ESM y CJS
  if [ "$MODULE_TYPE" = "esm" ]; then
    # Para ESM: copiar archivos binarios a dist
    echo "Build ESM completado"
  else
    # Para CJS: Añadir package.json que especifica "type": "commonjs"
    echo "{\"type\":\"commonjs\"}" > "$DIST_DIR/package.json"
  fi
done

# Finalización del script
echo "-- Build completado --"
