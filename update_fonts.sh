#!/bin/bash
# Script para actualizar las referencias de fuentes en archivos HTML

# Buscar todos los archivos HTML
FILES=$(find /Users/rodrigomunoz/Desktop/arrayanmed.cl/public -name "*.html")

# Reemplazar link de Google Fonts
for file in $FILES; do
  # Reemplazar la importación de Google Fonts
  sed -i '' 's|<link href="https://fonts.googleapis.com/css2?family=Bubblegum+Sans&family=Comic+Neue:wght@400;700&family=Patrick+Hand&family=Short+Stack&display=swap" rel="stylesheet">|<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&family=Quicksand:wght@400;500;600;700&display=swap" rel="stylesheet">|g' "$file"
done

echo "Actualización de fuentes completada!"